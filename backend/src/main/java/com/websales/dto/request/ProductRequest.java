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

    @UniqueName(entity = Product.class, fieldName = "nameProduct")
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



    //them danh sach cac phien ban san pham
    private List<ProductVersionRequest> versions;

}
