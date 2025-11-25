package com.websales.dto.response;

import java.math.BigDecimal;

public interface ListOrderDetailResponse {
    Integer getOrderId();
     Long getProductId();
     String getProductVersionId();
    BigDecimal getUnitPriceBefore();
    String getProductName();
    String getPicture();
}
