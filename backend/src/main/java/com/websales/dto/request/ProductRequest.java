package com.websales.dto.request;


import com.websales.entity.Product;
import com.websales.validation.UniqueName;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductRequest {

    @UniqueName(entity = Product.class, fieldName = "productName")
    String productName;

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



    //them danh sach cac phien ban san pham
    private List<ProductVersionRequest> versions;

}
