package com.websales.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OrderDetailResponse {
    Integer orderDetailId;
    String productVersionId;
    String productName;
    String productImage;
    BigDecimal unitPriceBefore;
    BigDecimal unitPriceAfter;
    Integer quantity;
    BigDecimal subtotal;
}

