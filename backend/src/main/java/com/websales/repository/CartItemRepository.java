package com.websales.repository;

import com.websales.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {

    // Tìm item theo cartId và productVersionId
    Optional<CartItem> findByCart_IdCartAndProductVersion_IdVersion(Integer idCart, String productVersionId);

    // Xoá item theo customerId + productVersionId (join qua Carts)
    @Modifying
    @Query("""
               DELETE FROM CartItem ci
               WHERE ci.cart.customerId = :customerId
                 AND ci.productVersion.idVersion = :productVersionId
            """)
    void deleteByCustomerIdAndProductVersionId(Long customerId, String productVersionId);

}
