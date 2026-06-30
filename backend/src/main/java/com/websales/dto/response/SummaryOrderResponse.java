package com.websales.dto.response;

public record SummaryOrderResponse(
        long pendingOrders,
        long paidOrders,
        long shippedOrders,
        long deliveredOrders,
        long canceledOrders,
        long returnedOrders
) {
}
