package com.websales.repository;

import com.websales.dto.response.DetailResponse;
import com.websales.dto.response.ListOrderDetailResponse;
import com.websales.dto.response.OrderDetailResponse;
import com.websales.entity.OrderDetail;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepo extends CrudRepository<OrderDetail, Integer> {

    @Query(value = """
SELECT 
    od.order_id,
    od.unit_price_before,
    p.product_name,
    p.picture,
    (
        (SELECT COUNT(*) FROM order_details od2 WHERE od2.order_id = od.order_id) - 1
    ) AS remaining_products
FROM order_details od
LEFT JOIN product_versions pv ON od.product_version_id = pv.product_version_id
LEFT JOIN products p ON p.product_id = pv.product_id
WHERE od.order_id = ?
ORDER BY od.order_detail_id ASC
LIMIT 1
""", nativeQuery = true)
    DetailResponse getOrderPreview(Integer orderId);

    @Query(value = """
            select od.order_id,
                       p.product_id,
                           pv.product_version_id, 
                               od.unit_price_before, 
                                   p.product_name, 
                                       p.picture, 
                                           od.quantity
    from order_details od left join 
            product_versions pv on 
                    od.product_version_id = pv.product_version_id
           left join products p on 
                   p.product_id = pv.product_id 
        where od.order_id = ? ;
    """, nativeQuery = true)
    List<ListOrderDetailResponse> getListOrderDetailByOrderId(Integer orderId);



}
