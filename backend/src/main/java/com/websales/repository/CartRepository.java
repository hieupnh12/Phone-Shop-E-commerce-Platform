package com.websales.repository;

import com.websales.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    List<Cart> findByUserId(String userId);
    Optional<Cart> findFirstByUserIdAndStatus(String userId, Boolean status);
}
