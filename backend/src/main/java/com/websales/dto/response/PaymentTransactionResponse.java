package com.websales.dto.response;

import com.websales.enums.PaymentStatus;
import com.websales.enums.TransactionType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentTransactionResponse {
    String transactionId;
    String transactionCode;
    Integer orderId;    
    PaymentMethodResponse paymentMethod;
    LocalDateTime paymentTime;
    BigDecimal amountUsed;
    PaymentStatus paymentStatus;
    TransactionType transactionType;
    String responseMessage;
    String address;
}

