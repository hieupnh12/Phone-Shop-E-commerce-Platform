package com.websales.dto.response;

import java.math.BigDecimal;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StatisticSummaryResponse {
    private String date;
    private Long orders;
    private BigDecimal revenue;
    private BigDecimal cost;
    private BigDecimal benefit;
    private String topProduct;
}
