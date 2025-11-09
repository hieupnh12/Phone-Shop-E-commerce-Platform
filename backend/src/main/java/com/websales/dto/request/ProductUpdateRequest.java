package com.websales.dto.request;


import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductUpdateRequest {

    String nameProduct;

    String image;

            Long idOrigin;

    Integer battery;

    String scanFrequency;

    Double screenSize;

             Long idOperatingSystem;

    String screenResolution;

    String screenTech;

    Integer chipset;

    String rearCamera;

    String frontCamera;

    Integer warrantyPeriod;

               Long idBrand;

               Long idWarehouseArea;

    Integer stockQuantity;

    Boolean status;

               Long idCate;

//    Boolean status;
}
