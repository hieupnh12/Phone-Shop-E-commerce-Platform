package com.websales.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentMethodResponse {
    Integer paymentMethodId;
    String paymentMethodType;
    String provider;
    Boolean status;
}

