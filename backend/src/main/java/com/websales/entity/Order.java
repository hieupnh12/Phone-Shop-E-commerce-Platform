package com.websales.entity;

import com.websales.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders" )
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    Integer orderId;

         @ManyToOne(fetch = FetchType.LAZY)
         @JoinColumn(name = "customer_id")
         Customer customerId;

    @Column(name = "create_datetime")
    LocalDateTime createDatetime;

         @ManyToOne(fetch = FetchType.LAZY)
         @JoinColumn(name = "employee_id")
         Employee employeeId;

    @Column(name = "end_datetime")
    LocalDateTime endDatetime;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;

    @Column(name = "total_amount", precision = 15, scale = 2)
    BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    OrderStatus status ;

    @Column(name = "is_paid")
    Boolean isPaid;

    @PrePersist
    protected void onCreate() {
        if (createDatetime == null) {
            createDatetime = LocalDateTime.now();
        }
        if (status == null) {
            status = OrderStatus.PENDING;
        }
        if (isPaid == null) {
            isPaid = false;
        }
    }
}
