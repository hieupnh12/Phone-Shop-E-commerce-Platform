package com.websales.dto.response;

import java.math.BigDecimal;

public record StatisticOrderResponse(String date, BigDecimal revenue, Long orders) {
}
