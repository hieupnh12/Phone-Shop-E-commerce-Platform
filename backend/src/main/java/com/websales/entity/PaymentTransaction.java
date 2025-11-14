package com.websales.entity;

import com.websales.enums.PaymentStatus;
import com.websales.enums.TransactionType;
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
@Table(name = "payment_transactions")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentTransaction {

    @Id
    @Column(name = "transaction_id", length = 255)
    String transactionId;

    @Column(name = "transaction_code", length = 100, unique = true)
    String transactionCode;

    @Column(name = "order_id")
    Integer orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_method_id")
    PaymentMethod paymentMethod;

    @Column(name = "payment_time")
    LocalDateTime paymentTime;

    @Column(name = "amount_used", precision = 15, scale = 2)
    BigDecimal amountUsed;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20)
    PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", length = 20)
    TransactionType transactionType;

    @Column(name = "response_message", columnDefinition = "TEXT")
    String responseMessage;

    @Column(name = "address", length = 500)
    String address;

    @PrePersist
    protected void onCreate() {
        if (paymentTime == null) {
            paymentTime = LocalDateTime.now();
        }
        if (paymentStatus == null) {
            paymentStatus = PaymentStatus.PENDING;
        }
        if (transactionType == null) {
            transactionType = TransactionType.PAYMENT;
        }
    }
}

