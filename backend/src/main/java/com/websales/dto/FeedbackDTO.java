package com.websales.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackDTO {
    @JsonProperty("feedback_id")
    private Integer feedbackId;

    @JsonProperty("customer_id")
    private Long customerId;

    @JsonProperty("product_id")
    private Integer productId;

    private LocalDateTime date;
    private Integer rate;
    private String content;
    private Boolean status;

    // Customer info for display
    @JsonProperty("customer_name")
    private String customerName;

    // Product info for display
    @JsonProperty("product_name")
    private String productName;
}
