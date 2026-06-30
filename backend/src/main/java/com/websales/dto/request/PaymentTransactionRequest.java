package com.websales.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("idTransaction")
    String transactionId;
    
    String transactionCode;
    
    @JsonProperty("idOrder")
    Integer orderId;
    
    @JsonProperty("idPaymentMethod")
    Integer paymentMethodId;
    
    BigDecimal amountUsed;
    PaymentStatus paymentStatus;
    TransactionType transactionType;
    String responseMessage;
    String address;
}

