package com.websales.repository;

import com.websales.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface SummaryCardRepository extends JpaRepository<Order, Integer> {

    // 1) DOANH THU
    @Query(value = """
            SELECT COALESCE(SUM(od.unit_price_after * od.quantity), 0)
                      FROM orders o
                        JOIN order_details od ON o.order_id = od.order_id
                        WHERE o.status = 'DELIVERED'
                        AND (:fromDate IS NULL OR :fromDate = '' OR o.end_datetime >= :fromDate)
                        AND (:toDate   IS NULL OR :toDate   = '' OR o.end_datetime <  :toDate);
        """, nativeQuery = true)
    Long getRevenue(
            @Param("fromDate") String fromDate,
            @Param("toDate")   String toDate
    );

    // 1.1) DOANH THU THEO RANGE FLOOR((MONTH(o.end_datetime)-1)/3)+1 AS quarter
    @Query(value = """
    SELECT
        CASE
            WHEN :rangeType = 'hour'    THEN CAST(HOUR(o.create_datetime) AS CHAR)
            WHEN :rangeType = 'day'     THEN DATE(o.create_datetime)
            WHEN :rangeType = 'week'    THEN CONCAT(YEAR(o.create_datetime), '-', LPAD(WEEK(o.create_datetime, 3), 2, '0'))
            WHEN :rangeType = 'month'   THEN CONCAT(YEAR(o.create_datetime), '-', LPAD(MONTH(o.create_datetime), 2, '0'))
            WHEN :rangeType = 'quarter' THEN CONCAT(YEAR(o.create_datetime), '-Q', FLOOR((MONTH(o.create_datetime)-1)/3)+1)
            WHEN :rangeType = 'year'    THEN CAST(YEAR(o.create_datetime) AS CHAR)
            ELSE DATE(o.create_datetime)
        END AS time_group,

        COALESCE(SUM(o.total_amount), 0) AS revenue,
        COALESCE(COUNT(DISTINCT o.order_id), 0) AS total_orders

    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.customer_id

    WHERE
        (:orderStatus = 'all' OR :orderStatus IS NULL OR :orderStatus = '' OR o.status = :orderStatus)

        AND (
             (:search IS NOT NULL AND :search != '' AND
              (c.email LIKE CONCAT('%', :search, '%') OR c.phone_number LIKE CONCAT('%', :search, '%')))
             OR (:search IS NULL OR :search = '')
         )

        AND (
            :searchStaff IS NULL OR :searchStaff = '' 
            OR CAST(o.employee_id AS CHAR) LIKE CONCAT('%', :searchStaff, '%')
        )

        AND (:fromDate IS NULL OR :fromDate = '' OR o.create_datetime >= :fromDate)
        AND (:toDate   IS NULL OR :toDate   = '' OR o.create_datetime <  :toDate)

    GROUP BY time_group
    ORDER BY time_group
""", nativeQuery = true)
    List<Object[]> getRevenueAndOrdersByRange(
            @Param("fromDate") String fromDate,
            @Param("toDate") String toDate,
            @Param("rangeType") String rangeType,
            @Param("orderStatus") String orderStatus,
            @Param("search") String search,
            @Param("searchStaff") String searchStaff
    );


    // 2) TOP PRODUCT
    @Query(value = """
        SELECT p.product_name AS bestSellerName,  SUM(od.quantity) AS bestSellerUnits
        FROM orders o
        JOIN order_details od ON o.order_id = od.order_id
        JOIN product_versions pv ON od.product_version_id = pv.product_version_id
        JOIN products p ON pv.product_id = p.product_id
        WHERE o.status = 'DELIVERED'
          AND (:fromDate IS NULL OR :fromDate = '' OR o.end_datetime >= :fromDate)
          AND (:toDate   IS NULL OR :toDate   = '' OR o.end_datetime <  :toDate)
        GROUP BY p.product_id, p.product_name
        ORDER BY SUM(od.quantity) DESC, SUM(od.unit_price_after * od.quantity) DESC
        LIMIT 1
    """, nativeQuery = true)
    Map<String, Object> getTopProductAsArray(
            @Param("fromDate") String fromDate,
            @Param("toDate")   String toDate
    );

    // 3) SỐ ĐƠN HÀNG
    @Query(value = """
    SELECT COALESCE((
        SELECT COUNT(DISTINCT o.order_id)
        FROM orders o
        WHERE (:fromDate IS NULL OR DATE(o.end_datetime) >= :fromDate)
          AND (:toDate   IS NULL OR DATE(o.end_datetime) <  :toDate) 
          AND o.status IN ('DELIVERED')
    ), 0)
    """, nativeQuery = true)
    Long getOrderCount(
            @Param("fromDate") String fromDate,
            @Param("toDate")   String toDate
    );


    // 4) LỢI NHUẬN
    @Query(value = """
            SELECT COALESCE((
            SELECT SUM(od.unit_price_after * od.quantity) - SUM(pv.import_price * od.quantity)
                FROM orders o
                JOIN order_details od ON o.order_id = od.order_id
                JOIN product_versions pv ON od.product_version_id = pv.product_version_id
                WHERE (:fromDate IS NULL OR :fromDate = '' OR DATE(o.end_datetime) >= :fromDate)
                    AND (:toDate   IS NULL OR :toDate   = '' OR DATE(o.end_datetime) < :toDate)
                    AND o.status IN ('DELIVERED')
        ), 0)
        """, nativeQuery = true)
    Long getProfit(
            @Param("fromDate") String fromDate,
            @Param("toDate")   String toDate
    );

    // 5) Order with status
    @Query(value = """
    SELECT
        COALESCE(SUM(CASE WHEN o.status = 'SHIPPED' THEN 1 ELSE 0 END), 0) AS shippedOrders,
        COALESCE(SUM(CASE WHEN o.status = 'PENDING' THEN 1 ELSE 0 END), 0) AS pendingOrders,
        COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN 1 ELSE 0 END), 0) AS paidOrders,
        COALESCE(SUM(CASE WHEN o.status = 'DELIVERED' THEN 1 ELSE 0 END), 0) AS deliveredOrders,
        COALESCE(SUM(CASE WHEN o.status = 'CANCELED' THEN 1 ELSE 0 END), 0) AS canceledOrders,
        COALESCE(SUM(CASE WHEN o.status = 'RETURNED' THEN 1 ELSE 0 END), 0) AS returnOrders
    FROM `orders` o
    WHERE (:fromDate IS NULL OR DATE(o.create_datetime) >= :fromDate)
      AND (:toDate   IS NULL OR DATE(o.create_datetime) <  :toDate)
""", nativeQuery = true)
    Object getSumOrderCount(
            @Param("fromDate") String fromDate,
            @Param("toDate") String toDate
    );

    // lấy sản phẩm theo số lượng và số lượng còn
    @Query(value = """
    SELECT p.product_name as name,
           SUM(od.quantity) as soldQuantity,
           SUM(pv.stock_quantity) as stockQuantity
    FROM order_details od
    JOIN orders o ON od.order_id = o.order_id
    JOIN product_versions pv ON od.product_version_id = pv.product_version_id
    JOIN products p ON pv.product_id = p.product_id
    WHERE (:from IS NULL OR o.create_datetime >= :from)
      AND (:to IS NULL OR o.create_datetime <= :to)
      AND o.status = 'DELIVERED'
    GROUP BY p.product_id
    ORDER BY soldQuantity DESC
    LIMIT 1
""", nativeQuery = true)
    Object getTopProduct(@Param("from") String from, @Param("to") String to);

    @Query(value = """
    SELECT 
        p.product_name AS name,
        SUM(od.quantity) AS soldQuantity,
        SUM(pv.stock_quantity) AS stockQuantity
    FROM orders o
    JOIN order_details od ON od.order_id = o.order_id
    JOIN product_versions pv ON od.product_version_id = pv.product_version_id
    JOIN products p ON pv.product_id = p.product_id
    WHERE o.status = 'DELIVERED'
      AND o.end_datetime >= :fromDate
      AND o.end_datetime <= :toDate
    GROUP BY p.product_id, p.product_name
    ORDER BY SUM(od.quantity) DESC
    LIMIT 10
""", nativeQuery = true)
    List<Object[]> getTopProducts(
            @Param("fromDate") String fromDate,
            @Param("toDate") String toDate
    );

    // Tổng số lượng bán ra
    @Query(value = """
        SELECT SUM(od.quantity) 
        FROM order_details od
        JOIN orders o ON od.order_id = o.order_id
        WHERE (:from IS NULL OR o.create_datetime >= :from)
      AND (:to IS NULL OR o.create_datetime <= :to)
          AND o.status = 'DELIVERED'
    """, nativeQuery = true)
    Long getTotalQuantity(@Param("from") String from, @Param("to") String to);

    // Sản phẩm tồn kho nhiều nhất
    @Query(value = """
        SELECT p.product_name, SUM(p.stock_quantity) 
        FROM products p
        GROUP BY p.product_name
        ORDER BY SUM(p.stock_quantity) DESC
        LIMIT 1
    """, nativeQuery = true)
    Object getInventoryProduct();

    // Số lượng sản phẩm theo thương hiệu
    @Query(value = """
    SELECT
        b.brand_name,
        SUM(p.stock_quantity) AS totalStock
    FROM products p
    JOIN brands b ON p.brand_id = b.brand_id
    GROUP BY b.brand_id, b.brand_name
    ORDER BY totalStock DESC;
""", nativeQuery = true)
    List<Object[]> getByBrand(@Param("from") String from, @Param("to") String to);
}
