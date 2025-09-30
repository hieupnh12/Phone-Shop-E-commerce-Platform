package com.websales.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductInfoResponse {
    Long ProductId;
    String tProductName;
    String tImage;
    String OriginName;
    String BrandName;
    String AreaName;
}
