package com.websales.dto.request;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record RevenueStatisticRequest(
        LocalDate startDate,
        LocalDate endDate,
        Long categoryId,
        String orderStatus,
        Long paymentMethodId,
        int page,
        int size,
        String search,
        String sort
) {

}
