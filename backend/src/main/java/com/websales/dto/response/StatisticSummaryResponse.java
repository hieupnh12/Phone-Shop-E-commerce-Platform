package com.websales.dto.response;

import java.math.BigDecimal;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

// @Data
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StatisticSummaryResponse {
    String date;
    int orders;
    BigDecimal revenue;
    BigDecimal cost;
    BigDecimal benefit;
    String topProduct;
}
