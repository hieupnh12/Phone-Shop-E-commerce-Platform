package com.websales.dto.response;

import com.websales.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    Integer orderId;
    Long customerId;
    String customerName;
    String customerPhone;
    String customerAddress;
    LocalDateTime createDatetime;
    Long employeeId;
    LocalDateTime endDatetime;
    String note;
    BigDecimal totalAmount;
    OrderStatus status;
    Boolean isPaid;
    List<OrderDetailResponse> orderDetails;
}
