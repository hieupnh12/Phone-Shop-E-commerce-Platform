package com.websales.dto.response;

import com.websales.enums.OrderStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ListOrderResponse {
    Integer orderId;
    LocalDateTime createDatetime;
    BigDecimal totalAmount;
    OrderStatus status;
    DetailResponse orderDetail;


}
