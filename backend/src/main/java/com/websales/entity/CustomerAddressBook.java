package com.websales.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "customer_address_book")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class CustomerAddressBook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "address_book_id")
    Long addressBookId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    Customer customer;

    @Column(name = "address", length = 500, nullable = false)
    String address;
}

