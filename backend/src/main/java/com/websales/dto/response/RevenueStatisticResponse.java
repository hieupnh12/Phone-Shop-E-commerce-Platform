package com.websales.dto.response;

import lombok.Builder;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

@Builder
public record RevenueStatisticResponse(
        Summary summaries,
        List<ChartData> chartData,
        List<PaymentMethodDto> paymentMethods,
        Page<OrderDetailDto> orders
) {
    public record ChartData(String date, BigDecimal revenue, Long orders) {}
    public record PaymentMethodDto(String name, BigDecimal revenue, Double percent) {}
    public record OrderDetailDto(
            String orderId,
            String date,
            String product,
            Integer quantity,
            BigDecimal price,
            BigDecimal revenue,
            BigDecimal profit,
            String status,
            String paymentMethod
    ) {}

    public record Summary(BigDecimal totalRevenue, Long totalOrders, BigDecimal totalProfit,
                          String bestSellerName, Long bestSellerUnits){}
}





