package com.websales.dto.response;

import java.math.BigDecimal;

public record SummaryRevenueResponse(
        BigDecimal totalRevenue,
        Long totalOrders,
        BigDecimal totalProfit,
        String bestSellerName,
        Long bestSellerUnits
) {
}
