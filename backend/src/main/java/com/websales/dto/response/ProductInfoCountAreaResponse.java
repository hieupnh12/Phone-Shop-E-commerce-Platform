package com.websales.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductInfoCountAreaResponse {
    Long areaCount;
    Long productInCount;
    List<ProductInfoResponse> productInfoResponses;

}
