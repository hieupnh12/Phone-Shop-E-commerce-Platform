package com.websales.dto.response;


import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductFULLResponse {
    Long idProduct;

          String nameProduct;

    String image;

          String  originName;

    String battery;

    String scanFrequency;

    String screenSize;

         String  operatingSystemName;

    String screenResolution;

    String screenTech;

    String chipset;

    String rearCamera;

    String frontCamera;

    Integer warrantyPeriod;

          String brandName;

          String  warehouseAreaName;

          String  categoryName;

    Integer stockQuantity;

    Boolean status;

    List<ProductVersionResponse> productVersionResponses;
}
