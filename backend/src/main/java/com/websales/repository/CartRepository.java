package com.websales.repository;

import com.websales.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    List<Cart> findByCustomerId(Long customerId);
    Optional<Cart> findFirstByCustomerIdAndStatus(Long customerId, Boolean status);
    
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartItems WHERE c.customerId = :customerId AND c.status = :status")
    Optional<Cart> findFirstByCustomerIdAndStatusWithItems(@Param("customerId") Long customerId, @Param("status") Boolean status);
}
