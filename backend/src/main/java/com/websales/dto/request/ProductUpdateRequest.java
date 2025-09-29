package com.websales.dto.request;


import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductUpdateRequest {

    Long originId;

    String processor;

    Integer battery;

    Double screenSize;

    Long operatingSystemId;

    Integer chipset;

    String rearCamera;

    String frontCamera;

    Integer warrantyPeriod;

    Long  brandId;

    Long  warehouseAreaId;

//    Boolean status;
}
