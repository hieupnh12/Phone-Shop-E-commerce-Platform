package com.websales.dto.response;

import java.math.BigDecimal;

public interface CustomerCountOrders {
    Long getTotalOrders();
    BigDecimal getTotalAmount();
}
