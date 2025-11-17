package com.websales.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CartItem")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCartItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idCart", nullable = false)
    private Cart cart;

    // Thay vì String imei rời, map ManyToOne tới ProductItem (PK = imei)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "imei", nullable = false)
    private ProductItem productItem;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "status")
    private Boolean status;
}
