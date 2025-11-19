package com.websales.repository;

import com.websales.entity.Order;
import com.websales.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
//    List<Order> findByCustomerId(Long customerId);
//    List<Order> findByStatus(OrderStatus status);
//    Optional<Order> findByOrderId(Integer orderId);
}
