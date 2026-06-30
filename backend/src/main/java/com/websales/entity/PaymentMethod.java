package com.websales.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "payment_methods")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_method_id")
    Integer paymentMethodId;

    @Column(name = "payment_method_type", length = 50)
    String paymentMethodType;

    @Column(name = "provider", length = 50)
    String provider;

    @Column(name = "status")
    Boolean status;
}

