package com.websales.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductResponse {
    Long idProduct;

    String nameProduct;

    String image;

    String  originName;

    Integer battery;

    String scanFrequency;

    Double screenSize;

    String  operatingSystemName;

    String screenResolution;

    String screenTech;

    Integer chipset;

    String rearCamera;

    String frontCamera;

    Integer warrantyPeriod;

    String brandName;

    String  warehouseAreaName;

    Integer stockQuantity;

    Boolean status;

}
