package com.websales.entity;

<<<<<<< HEAD
public class Order {
    
=======
import com.websales.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    Integer orderId;
    
    @Column(name = "customer_id")
    Long customerId;
    
    @Column(name = "create_datetime")
    LocalDateTime createDatetime;
    
    @Column(name = "employee_id")
    Long employeeId;
    
    @Column(name = "end_datetime")
    LocalDateTime endDatetime;
    
    @Column(name = "note", columnDefinition = "TEXT")
    String note;
    
    @Column(name = "total_amount", precision = 15, scale = 2)
    BigDecimal totalAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    OrderStatus status;
    
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
>>>>>>> cuong
}
