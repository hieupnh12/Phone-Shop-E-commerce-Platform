package com.websales.repository;

import java.text.NumberFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;


import com.websales.configuration.StatsProcedureConfig;
import com.websales.entity.Order;
import com.websales.entity.ProductVersion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import com.websales.dto.response.StatisticSummaryResponse;
import com.websales.entity.Product;
import org.springframework.stereotype.Repository;

@Repository
public interface StatisticRepository extends JpaRepository<StatsProcedureConfig.StatsProcedure, Long> {

    @Procedure(name = "sp_GetSalesReportByDays")
    List<StatisticSummaryResponse> getSaleReportByDays(@Param("p_days") int days);

    private String calcPercent(Long current, Long previous) {
        if (previous == 0) return "+100%";
        double percent = ((double) (current - previous) / previous) * 100;
        return String.format("%+.1f%%", percent);
    }


    // 1. Summary + Best Seller
    @Query(value = """
                SELECT 
                    COALESCE(SUM(od.unit_price_after * od.quantity), 0) AS totalRevenue,
                    COUNT(DISTINCT o.order_id) AS totalOrders,
                    COALESCE(SUM((od.unit_price_after - pv.import_price) * od.quantity), 0) AS totalProfit,
                    (
                        SELECT p.product_name
                        FROM orders o2
                        JOIN order_details od2 ON o2.order_id = od2.order_id
                        JOIN product_versions pv2 ON od2.product_version_id = pv2.product_version_id
                        JOIN products p ON pv2.product_id = p.product_id
                        WHERE o2.status = 'DELIVERED'
                          AND (:fromDate IS NULL OR :fromDate = '' OR DATE(o2.end_datetime) >= :fromDate)
                          AND (:toDate IS NULL OR :toDate = '' OR DATE(o2.end_datetime) < :toDate)
                        GROUP BY p.product_id, p.product_name
                        ORDER BY SUM(od2.quantity) DESC, SUM(od2.unit_price_after * od2.quantity) DESC
                        LIMIT 1
                    ) AS bestSellerName,
                    (
                        SELECT SUM(od2.quantity)
                        FROM orders o2
                        JOIN order_details od2 ON o2.order_id = od2.order_id
                        JOIN product_versions pv2 ON od2.product_version_id = pv2.product_version_id
                        JOIN products p ON pv2.product_id = p.product_id
                        WHERE o2.status = 'DELIVERED'
                          AND (:fromDate IS NULL OR :fromDate = '' OR DATE(o2.end_datetime) >= :fromDate)
                          AND (:toDate IS NULL OR :toDate = '' OR DATE(o2.end_datetime) < :toDate)
                        GROUP BY p.product_id, p.product_name
                        ORDER BY SUM(od2.quantity) DESC
                        LIMIT 1
                    ) AS bestSellerUnits
                FROM orders o
                JOIN order_details od ON o.order_id = od.order_id
                JOIN product_versions pv ON od.product_version_id = pv.product_version_id
                WHERE o.status IN ('DELIVERED')
                  AND (:fromDate IS NULL OR :fromDate = '' OR DATE(o.end_datetime) >= :fromDate)
                  AND (:toDate IS NULL OR :toDate = '' OR DATE(o.end_datetime) < :toDate)
            """, nativeQuery = true)
    Map<String, Object> getSummary(
            @Param("fromDate") String startDate,
            @Param("toDate") String endDate
    );


    // 2. Chart theo ngày - dùng end_datetime để đồng bộ với order details
    // Tính revenue từ order_details giống như order details query để đồng bộ
    @Query(value = """
        SELECT
            t.groupKey AS date,
            SUM(t.revenue) AS revenue,
            COUNT(DISTINCT t.order_id) AS orders
        FROM (
            SELECT 
                o.order_id,
                od.unit_price_after * od.quantity AS revenue,

                -- BUILD GROUP KEY theo end_datetime (khi order được giao)
                CASE
                    WHEN :rangeType = 'hour'    
                        THEN CONCAT(DATE_FORMAT(o.end_datetime, '%Y-%m-%d'), ' ', LPAD(HOUR(o.end_datetime), 2, '0'), ':00')

                    WHEN :rangeType = 'day'     
                        THEN DATE_FORMAT(o.end_datetime, '%Y-%m-%d')

                    WHEN :rangeType = 'week'    
                        THEN CONCAT(
                                YEAR(o.end_datetime),
                                '-W',
                                LPAD(WEEK(o.end_datetime, 3), 2, '0')
                             )

                    WHEN :rangeType = 'month'   
                        THEN DATE_FORMAT(o.end_datetime, '%Y-%m')

                    WHEN :rangeType = 'quarter' 
                        THEN CONCAT(
                                YEAR(o.end_datetime),
                                '-Q',
                                FLOOR((MONTH(o.end_datetime)-1)/3)+1
                             )

                    WHEN :rangeType = 'year'    
                        THEN CAST(YEAR(o.end_datetime) AS CHAR)

                    ELSE DATE_FORMAT(o.end_datetime, '%Y-%m-%d')
                END AS groupKey

            FROM orders o
            JOIN order_details od ON o.order_id = od.order_id

            WHERE o.status = 'DELIVERED'

              AND (:start IS NULL OR :start = '' OR o.end_datetime >= :start)
              AND (:end   IS NULL OR :end   = '' OR o.end_datetime < :end)

              AND (
                    :search IS NULL OR :search = '' OR
                    CAST(o.order_id AS CHAR) LIKE CONCAT('%', :search, '%')
                  )

        ) t
        GROUP BY t.groupKey
        ORDER BY t.groupKey
        """, nativeQuery = true)
    List<Object[]> getChartData(
            @Param("start") String start,
            @Param("end")   String end,
            @Param("search") String search,
            @Param("rangeType") String rangeType
    );



    // 3. Top 5 sản phẩm
    @Query(value = """
            SELECT CONCAT(p.product_name, ' ', pv.color_id, ' ', pv.ram_id, '/', pv.rom_id),
                   SUM(od.unit_price_after * od.quantity),
                   SUM(od.quantity)
            FROM orders o
            JOIN order_details od ON o.order_id = od.order_id
            JOIN product_versions pv ON od.product_version_id = pv.product_version_id
            JOIN products p ON pv.product_id = p.product_id
            WHERE DATE(o.end_datetime) BETWEEN :start AND :end
              AND o.status IN ('DELIVERED') 
            GROUP BY p.product_name, pv.color_id, pv.ram_id, pv.rom_id
            ORDER BY SUM(od.quantity) DESC LIMIT 5
            """, nativeQuery = true)
    List<Object[]> getTopProducts(@Param("start") LocalDate start, @Param("end") LocalDate end);

    // 4. Doanh thu theo phương thức thanh toán
    @Query(value = """
            SELECT pm.payment_method_type,
                   SUM(pt.amount_used) AS revenue
            FROM orders o
            JOIN payment_transactions pt 
                ON pt.order_id = o.order_id
            JOIN payment_methods pm 
                ON pt.payment_method_id = pm.payment_method_id
            WHERE (:start IS NULL OR :start = '' OR DATE(o.end_datetime) >= :start)
              AND (:end   IS NULL OR :end   = '' OR DATE(o.end_datetime) <  :end)
              AND o.status IN ('PAID','SHIPPED','DELIVERED')
              AND pt.payment_status = 'SUCCESS'
              AND (:payId IS NULL OR pt.payment_method_id = :payId)
            GROUP BY pm.payment_method_type
            """, nativeQuery = true)
    List<Object[]> getPaymentMethodStats(
            @Param("start") String start,
            @Param("end") String end,
            @Param("payId") Long payId
    );


    @Query(
            value = """
        SELECT 
            o.order_id,
            DATE_FORMAT(o.end_datetime, '%d/%m/%Y') AS createDate,
            CONCAT(p.product_name, ' ', pv.color_id, ' ', pv.ram_id, '/', pv.rom_id) AS productName,
            od.quantity,
            pv.import_price AS importPrice,
            od.unit_price_after AS unitPrice,
            od.unit_price_after * od.quantity AS totalPrice,
            (od.unit_price_after - pv.import_price) * od.quantity AS profit,
            o.status,
            COALESCE(
                (SELECT pm2.payment_method_type 
                 FROM payment_transactions pt2 
                 JOIN payment_methods pm2 ON pt2.payment_method_id = pm2.payment_method_id 
                 WHERE pt2.order_id = o.order_id 
                   AND (pt2.payment_status = 'SUCCESS' OR pt2.payment_status = 'PENDING')
                 ORDER BY 
                   CASE WHEN pt2.payment_status = 'SUCCESS' THEN 1 ELSE 2 END,
                   pt2.payment_time DESC
                 LIMIT 1),
                'N/A'
            ) AS paymentMethodType,

            CASE 
                WHEN LOWER(:rangeType) = 'hour'   THEN CONCAT(DATE_FORMAT(o.end_datetime, '%Y-%m-%d'), ' ', LPAD(HOUR(o.end_datetime), 2, '0'), ':00')
                WHEN LOWER(:rangeType) = 'day'    THEN DATE_FORMAT(o.end_datetime, '%Y-%m-%d')
                WHEN LOWER(:rangeType) = 'week'   THEN CONCAT(YEAR(o.end_datetime), '-W', LPAD(WEEK(o.end_datetime, 3), 2, '0'))
                WHEN LOWER(:rangeType) = 'month'  THEN DATE_FORMAT(o.end_datetime, '%Y-%m')
                WHEN LOWER(:rangeType) = 'year'   THEN CAST(YEAR(o.end_datetime) AS CHAR)
                ELSE DATE_FORMAT(o.end_datetime, '%Y-%m-%d')
            END AS groupKey

        FROM orders o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN product_versions pv ON od.product_version_id = pv.product_version_id
        JOIN products p ON pv.product_id = p.product_id
        LEFT JOIN customers c ON o.customer_id = c.customer_id

        WHERE o.status = 'DELIVERED'
          AND (:start IS NULL OR :start = '' OR o.end_datetime >= :start)
          AND (:end   IS NULL OR :end   = '' OR o.end_datetime < :end)
          AND (
                :search IS NULL OR :search = '' OR
                CAST(o.order_id AS CHAR) LIKE CONCAT('%', :search, '%') OR
                p.product_name LIKE CONCAT('%', :search, '%') OR
                (c.email IS NOT NULL AND c.email LIKE CONCAT('%', :search, '%')) OR
                (c.phone_number IS NOT NULL AND c.phone_number LIKE CONCAT('%', :search, '%'))
              )

        ORDER BY o.end_datetime DESC
        """,
            countQuery = """
        SELECT COUNT(DISTINCT CONCAT(o.order_id, '-', od.product_version_id))
        FROM orders o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN product_versions pv ON od.product_version_id = pv.product_version_id
        JOIN products p ON pv.product_id = p.product_id
        LEFT JOIN customers c ON o.customer_id = c.customer_id

        WHERE o.status = 'DELIVERED'
          AND (:start IS NULL OR :start = '' OR o.end_datetime >= :start)
          AND (:end   IS NULL OR :end   = '' OR o.end_datetime < :end)
          AND (
                :search IS NULL OR :search = '' OR
                CAST(o.order_id AS CHAR) LIKE CONCAT('%', :search, '%') OR
                p.product_name LIKE CONCAT('%', :search, '%') OR
                (c.email IS NOT NULL AND c.email LIKE CONCAT('%', :search, '%')) OR
                (c.phone_number IS NOT NULL AND c.phone_number LIKE CONCAT('%', :search, '%'))
              )
        """,
            nativeQuery = true
    )
    Page<Object[]> getOrderDetailsPage(
            @Param("start") String start,
            @Param("end") String end,
            @Param("search") String search,
            @Param("rangeType") String rangeType,
            Pageable pageable
    );


    @Query("SELECT p FROM ProductVersion p " +
           "LEFT JOIN FETCH p.ram " +
           "LEFT JOIN FETCH p.rom " +
           "LEFT JOIN FETCH p.color " +
           "WHERE p.stockQuantity <= :threshold")
    List<ProductVersion> findLowStockProducts(@Param("threshold") Integer threshold);
}
