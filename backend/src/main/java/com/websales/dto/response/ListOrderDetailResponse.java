package com.websales.dto.response;

import java.math.BigDecimal;

public interface ListOrderDetailResponse {
    Integer getOrderId();
     Long getProductId();
     String getProductVersionId();
    BigDecimal getUnitPriceAfter();
    String getProductName();
    String getPicture();
}
