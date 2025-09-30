package com.websales.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductResponse {
    Long productId;

   String productName;

     String image;

     String originName;

    String processor;

     Integer battery;

     Double screenSize;

   String operatingSystemName;

     Integer chipset;

    String rearCamera;

    String frontCamera;

   Integer warrantyPeriod;

  String  brandName;

    String  warehouseAreaName;

    Integer stockQuantity;

     Boolean status;

}
