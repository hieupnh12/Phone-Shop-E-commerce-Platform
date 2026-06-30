package com.websales.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateFeedbackRequest {
    @JsonProperty("product_id")
    private Integer productId;

    private Integer rate;
    private String content;
}
