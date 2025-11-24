package com.websales.dto.response;

import java.math.BigDecimal;

public interface OrderDetailResponse {
    Integer getOrderId();
    BigDecimal getUnitPriceBefore();
    String getProductName();
    String getPicture();
    Integer getRemainingProducts();
}
