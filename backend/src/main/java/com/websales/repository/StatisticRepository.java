package com.websales.repository;

import java.text.NumberFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;


import com.websales.configuration.StatsProcedureConfig;
import com.websales.entity.Order;
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
          double percent = ((double)(current - previous) / previous) * 100;
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


     // 2. Chart theo ngày
     @Query(value = """
    SELECT DATE_FORMAT(order_day, '%d/%m/%Y') AS date,
           SUM(total_amount) AS revenue,
           COUNT(*) AS orders
    FROM (
        SELECT DATE(o.create_datetime) AS order_day,
               o.total_amount
        FROM orders o
        WHERE (:start IS NULL OR :start = '' OR o.end_datetime >= :start)
          AND (:end   IS NULL OR :end   = '' OR o.end_datetime < :end)
          AND o.status IN ('DELIVERED')
    ) t
    GROUP BY order_day
    ORDER BY order_day
    """, nativeQuery = true)
     List<Object[]> getChartData(
             @Param("start") String start,
             @Param("end") String end
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


     // 5. Danh sách đơn hàng + phân trang + tìm kiếm + sort
     @Query(value = """
SELECT 
    o.order_id,
    DATE_FORMAT(o.create_datetime, '%d/%m/%Y') AS createDate,
    CONCAT(p.product_name, ' ', pv.color_id, ' ', pv.ram_id, '/', pv.rom_id) AS productName,
    od.quantity,
    pv.import_price,
    od.unit_price_after * od.quantity AS totalPrice,
    (od.unit_price_after - pv.import_price) * od.quantity AS profit,
    o.status,
    c.full_name AS customerName,
    c.phone_number AS customerPhone,
    c.email AS customerEmail,

    CASE 
        WHEN :rangeType = 'day'   THEN DATE(o.end_datetime)
        WHEN :rangeType = 'month' THEN DATE_FORMAT(o.end_datetime, '%Y-%m')
        WHEN :rangeType = 'year'  THEN YEAR(o.end_datetime)
        WHEN :rangeType = 'week'  THEN CONCAT(YEAR(o.end_datetime), '-W', LPAD(WEEK(o.end_datetime, 3), 2, '0'))
        ELSE NULL
    END AS groupKey

FROM orders o
JOIN order_details od ON o.order_id = od.order_id
JOIN product_versions pv ON od.product_version_id = pv.product_version_id
JOIN products p ON pv.product_id = p.product_id
JOIN customers c ON o.customer_id = c.customer_id

WHERE (:start IS NULL OR :start = '' OR DATE(o.end_datetime) >= :start)
  AND (:end IS NULL OR :end = '' OR DATE(o.end_datetime) < :end)
  AND o.status = 'DELIVERED'

  -- SEARCH đúng yêu cầu của bạn
  AND (
        :search IS NULL OR :search = '' OR
        CAST(o.order_id AS CHAR) LIKE CONCAT('%', :search, '%') OR
        p.product_name LIKE CONCAT('%', :search, '%') OR
        c.email LIKE CONCAT('%', :search, '%') OR
        c.phone_number LIKE CONCAT('%', :search, '%')
      )

  -- FILTER RANGE TYPE nếu != null
  AND (
        :rangeType IS NULL OR :rangeType = 'none' OR
        (
            :rangeType = 'day'   AND DATE(o.end_datetime) = DATE(:start)
        ) OR (
            :rangeType = 'month' AND DATE_FORMAT(o.end_datetime, '%Y-%m') = DATE_FORMAT(:start, '%Y-%m')
        ) OR (
            :rangeType = 'year'  AND YEAR(o.end_datetime) = YEAR(:start)
        ) OR (
            :rangeType = 'week'  AND WEEK(o.end_datetime, 3) = WEEK(:start, 3)
        )
      )

ORDER BY o.end_datetime DESC
""",

             countQuery = """
SELECT COUNT(DISTINCT o.order_id)
FROM orders o
JOIN order_details od ON o.order_id = od.order_id
JOIN product_versions pv ON od.product_version_id = pv.product_version_id
JOIN products p ON pv.product_id = p.product_id
JOIN customers c ON o.customer_id = c.customer_id

WHERE (:start IS NULL OR :start = '' OR DATE(o.end_datetime) >= :start)
  AND (:end IS NULL OR :end = '' OR DATE(o.end_datetime) < :end)
  AND o.status = 'DELIVERED'
  AND (
        :search IS NULL OR :search = '' OR
        CAST(o.order_id AS CHAR) LIKE CONCAT('%', :search, '%') OR
        p.product_name LIKE CONCAT('%', :search, '%') OR
        c.email LIKE CONCAT('%', :search, '%') OR
        c.phone_number LIKE CONCAT('%', :search, '%')
      )
""",
             nativeQuery = true)
     Page<Object[]> getOrderDetailsPage(
             @Param("start") String start,
             @Param("end") String end,
             @Param("search") String search,
             @Param("rangeType") String rangeType,
             Pageable pageable
     );


}
