package com.websales.dto.request;

import com.websales.enums.PaymentStatus;
import com.websales.enums.TransactionType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentTransactionRequest {
    String transactionCode;
    Integer orderId;
    Integer paymentMethodId;
    BigDecimal amountUsed;
    PaymentStatus paymentStatus;
    TransactionType transactionType;
    String responseMessage;
    String address;
}

