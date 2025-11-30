package com.websales.repository;

import com.websales.dto.response.ListOrderResponse;
import com.websales.entity.Customer;
import com.websales.entity.Order;
import com.websales.enums.OrderStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByCustomerId(Customer customerId);
    List<Order> findByStatus(OrderStatus status);
    Optional<Order> findByOrderId(Integer orderId);

    @Query(value = """
    select * from orders where customer_id = ?
""", nativeQuery = true)
    List<ListOrderResponse> findAllOrderByCustomerId(Long customerId);

    List<Order> findByCustomerId(Customer customer, Sort sort);
    
    // Tìm đơn hàng theo employeeId với pagination
    org.springframework.data.domain.Page<Order> findByEmployeeId_Id(Long employeeId, org.springframework.data.domain.Pageable pageable);
}
