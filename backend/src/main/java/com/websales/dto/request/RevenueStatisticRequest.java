package com.websales.dto.request;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record RevenueStatisticRequest(
        String startDate,
        String endDate,
        String rangeType,               // day, month, week, year
        Long paymentMethodId,
        int page,
        int size,
        String search,                  // search all: email, phone, product, orderId
        String sort
) {
}
