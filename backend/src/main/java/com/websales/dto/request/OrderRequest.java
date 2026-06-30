package com.websales.dto.request;

import com.websales.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class OrderRequest {
    Long customerId;
    Long employeeId;
    String note;
    BigDecimal totalAmount;
    OrderStatus status;
    Boolean isPaid;
    List<OrderDetailRequest> orderDetails;
    
    @Data
    @Builder
    public static class OrderDetailRequest {
        String productVersionId;
        BigDecimal unitPriceBefore;
        BigDecimal unitPriceAfter;
        Integer quantity;
    }
}

