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
public class RatingStatsDTO {
    @JsonProperty("average_rating")
    private Double averageRating;

    @JsonProperty("total_reviews")
    private Integer totalReviews;

    @JsonProperty("five_star_count")
    private Integer fiveStarCount;

    @JsonProperty("four_star_count")
    private Integer fourStarCount;

    @JsonProperty("three_star_count")
    private Integer threeStarCount;

    @JsonProperty("two_star_count")
    private Integer twoStarCount;

    @JsonProperty("one_star_count")
    private Integer oneStarCount;
}
