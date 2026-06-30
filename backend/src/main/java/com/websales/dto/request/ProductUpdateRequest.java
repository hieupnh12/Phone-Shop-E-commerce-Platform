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

    String battery;

    String scanFrequency;

    String screenSize;

             Long idOperatingSystem;

    String screenResolution;

    String screenTech;

    String chipset;

    String rearCamera;

    String frontCamera;

    Integer warrantyPeriod;

               Integer idBrand;

               String idWarehouseArea;

    Integer stockQuantity;

    Boolean status;

    Long categoryId;

}
