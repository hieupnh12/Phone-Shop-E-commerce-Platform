package com.websales.repository;

import com.websales.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {

    // Tìm item theo cartId và IMEI
    Optional<CartItem> findByCart_IdCartAndProductItem_Imei(Integer idCart, String imei);

    // Xoá item theo userId + imei (join qua Carts)
    @Modifying
    @Query("""
               DELETE FROM CartItem ci
               WHERE ci.cart.userId = :userId
                 AND ci.productItem.imei = :imei
            """)
    void deleteByUserIdAndImei(String userId, String imei);

}
