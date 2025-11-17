package com.websales.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Builder
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "order_details")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderDetail {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_detail_id")
    Integer orderDetailId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_version_id")
    ProductVersion productVersion;
    
    @Column(name = "unit_price_before", precision = 15, scale = 2)
    BigDecimal unitPriceBefore;
    
    @Column(name = "unit_price_after", precision = 15, scale = 2)
    BigDecimal unitPriceAfter;
    
    @Column(name = "quantity")
    Integer quantity;
}
