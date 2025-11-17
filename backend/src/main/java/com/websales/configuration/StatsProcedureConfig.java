package com.websales.configuration;

import com.websales.dto.response.StatisticSummaryResponse;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import jakarta.persistence.StoredProcedureParameter;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
public class StatsProcedureConfig {

    @Entity
    @SqlResultSetMapping(
            name = "StatisticSummaryMapping",
            classes = @ConstructorResult(
                    targetClass = StatisticSummaryResponse.class,
                    columns = {
                            @ColumnResult(name = "date", type = String.class), // DATE_FORMAT → String
                            @ColumnResult(name = "orders", type = Long.class),
                            @ColumnResult(name = "revenue", type = BigDecimal.class),
                            @ColumnResult(name = "cost", type = BigDecimal.class),
                            @ColumnResult(name = "benefit", type = BigDecimal.class),
                            @ColumnResult(name = "topProduct", type = String.class)
                    }
            )
    )
    @NamedStoredProcedureQuery(
        name = "sp_GetSalesReportByDays",
            procedureName = "sp_GetSalesReportByDays",
            parameters = {
                    @StoredProcedureParameter(mode = ParameterMode.IN, name = "p_days", type = Integer.class)
            },
            resultSetMappings = "StatisticSummaryMapping"
    )
    public static class StatsProcedure {
        @Id
        private Long p_daysHidden;
    }
}
