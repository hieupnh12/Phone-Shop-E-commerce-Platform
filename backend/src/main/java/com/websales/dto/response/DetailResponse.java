package com.websales.dto.response;

import java.math.BigDecimal;

public interface DetailResponse {
        Integer getOrderId();
        BigDecimal getUnitPriceAfter();
        String getProductName();
        String getPicture();
        Integer getRemainingProducts();
    }


