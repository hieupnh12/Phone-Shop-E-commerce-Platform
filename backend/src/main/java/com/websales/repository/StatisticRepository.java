package com.websales.repository;

import java.time.LocalDate;
import java.util.List;
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
public interface StatisticRepository extends JpaRepository<Order, Long> {
    
     @Procedure(name = "sp_GetSalesReportByDays")
     List<StatisticSummaryResponse> getSaleReportByDays(@Param("p_days") int days);

     // 1. Summary + Best Seller
     @Query(value = """
        WITH params AS (
            SELECT :startDate::date AS start_d, :endDate::date AS end_d,
                   :catId AS cat_filter, :payId AS pay_filter
        ),
        filtered AS (
            SELECT o.*
            FROM orders o, params p
            WHERE DATE(o.create_datetime) BETWEEN p.start_d AND p.end_d
              AND o.status IN ('PAID','SHIPPED','DELIVERED')
              AND o.is_paid = true
        ),
        details AS (
            SELECT od.*, pv.import_price, p.product_name, p.category_id
            FROM order_details od
            JOIN product_versions pv ON od.product_version_id = pv.product_version_id
            JOIN products p ON pv.product_id = p.product_id
            JOIN filtered o ON od.order_id = o.order_id
            WHERE (:catId IS NULL OR p.category_id = :catId)
        ),
        best AS (
            SELECT p.product_name, SUM(od.quantity) units
            FROM details od
            JOIN products p ON od.product_id = pv.product_id
            GROUP BY p.product_name ORDER BY units DESC LIMIT 1
        )
        SELECT
            COALESCE(SUM(o.total_amount), 0) AS totalRevenue,
            COUNT(DISTINCT o.order_id) AS totalOrders,
            COALESCE(SUM((od.unit_price_after - pv.import_price) * od.quantity), 0) AS totalProfit,
            COALESCE(b.product_name, 'N/A') AS bestSellerName,
            COALESCE(b.units, 0) AS bestSellerUnits
        FROM filtered o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN product_versions pv ON od.product_version_id = pv.product_version_id
        CROSS JOIN best b
        """, nativeQuery = true)
     Map<String, Object> getSummary(
             @Param("startDate") String startDate,
             @Param("endDate") String endDate,
             @Param("catId") Long catId,
             @Param("payId") Long payId
     );

     // 2. Chart theo ngày
     @Query(value = """
        SELECT TO_CHAR(o.create_datetime, 'DD/MM') AS date,
               SUM(o.total_amount) AS revenue,
               COUNT(*) AS orders
        FROM orders o
        WHERE DATE(o.create_datetime) BETWEEN :start AND :end
          AND o.status IN ('PAID','SHIPPED','DELIVERED')
          AND o.is_paid = true
        GROUP BY DATE(o.create_datetime)
        ORDER BY DATE(o.create_datetime)
        """, nativeQuery = true)
     List<Object[]> getChartData(@Param("start") LocalDate start, @Param("end") LocalDate end);

     // 3. Top 5 sản phẩm
     @Query(value = """
        SELECT p.product_name || ' ' || pv.color_id || ' ' || pv.ram_id || '/' || pv.rom_id,
               SUM(od.unit_price_after * od.quantity),
               SUM(od.quantity)
        FROM orders o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN product_versions pv ON od.product_version_id = pv.product_version_id
        JOIN products p ON pv.product_id = p.product_id
        WHERE DATE(o.create_datetime) BETWEEN :start AND :end
          AND o.status IN ('PAID','SHIPPED','DELIVERED') AND o.is_paid = true
        GROUP BY p.product_name, pv.color_id, pv.ram_id, pv.rom_id
        ORDER BY SUM(od.quantity) DESC LIMIT 5
        """, nativeQuery = true)
     List<Object[]> getTopProducts(@Param("start") LocalDate start, @Param("end") LocalDate end);

     // 4. Doanh thu theo phương thức thanh toán (dùng bảng payment_transactions)
     @Query(value = """
        SELECT pm.payment_method_type,
               SUM(pt.amount_used) AS revenue
        FROM orders o
        JOIN payment_transactions pt ON pt.order_id = o.order_id
        JOIN payment_methods pm ON pt.payment_method_id = pm.payment_method_id
        WHERE DATE(o.create_datetime) BETWEEN :start AND :end
          AND o.status IN ('PAID','SHIPPED','DELIVERED')
          AND pt.payment_status = 'SUCCESS'
          AND (:payId IS NULL OR pt.payment_method_id = :payId)
        GROUP BY pm.payment_method_type
        """, nativeQuery = true)
     List<Object[]> getPaymentMethodStats(
             @Param("start") LocalDate start,
             @Param("end") LocalDate end,
             @Param("payId") Long payId
     );

     // 5. Danh sách đơn hàng + phân trang + tìm kiếm + sort
     @Query(value = """
        SELECT o.order_id,
               TO_CHAR(o.create_datetime, 'DD/MM/YYYY'),
               p.product_name || ' ' || pv.color_id || ' ' || pv.ram_id || '/' || pv.rom_id,
               od.quantity,
               od.unit_price_after,
               od.unit_price_after * od.quantity,
               (od.unit_price_after - pv.import_price) * od.quantity,
               o.status,
               COALESCE(pm.payment_method_type, 'Khác')
        FROM orders o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN product_versions pv ON od.product_version_id = pv.product_version_id
        JOIN products p ON pv.product_id = p.product_id
        LEFT JOIN payment_transactions pt ON pt.order_id = o.order_id AND pt.payment_status = 'SUCCESS'
        LEFT JOIN payment_methods pm ON pt.payment_method_id = pm.payment_method_id
        WHERE DATE(o.create_datetime) BETWEEN :start AND :end
          AND o.status IN ('PAID','SHIPPED','DELIVERED')
          AND o.is_paid = true
          AND (:search IS NULL OR :search = '' OR o.order_id::text LIKE '%'||:search||'%')
        """,
             countQuery = "SELECT COUNT(DISTINCT o.order_id) FROM orders o ... (tương tự điều kiện)",
             nativeQuery = true)
     Page<Object[]> getOrderDetailsPage(
             @Param("start") LocalDate start,
             @Param("end") LocalDate end,
             @Param("search") String search,
             Pageable pageable
     );
}
