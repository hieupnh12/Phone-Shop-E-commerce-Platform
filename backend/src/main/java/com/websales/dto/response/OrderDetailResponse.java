package com.websales.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OrderDetailResponse {
    Integer orderDetailId;
    String productVersionId;
    Long productId;  // Add this to get actual product ID for feedback
    String productName;
    String productImage;
    BigDecimal unitPriceBefore;
    BigDecimal unitPriceAfter;
    Integer quantity;
    BigDecimal subtotal;
}

