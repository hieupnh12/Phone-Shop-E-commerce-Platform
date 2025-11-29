package com.websales.dto.response;

public record SummaryDashboardResponse(ValueSummary revenue, ValueSummary topProduct, ValueSummary orderCount, ValueSummary profit) {
    public record ValueSummary(
            String value,
            String change
    ){}
}

