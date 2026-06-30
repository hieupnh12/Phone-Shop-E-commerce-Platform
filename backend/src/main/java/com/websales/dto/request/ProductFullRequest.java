package com.websales.dto.request;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductFullRequest {

    Long idProduct;

    ProductExtraRequest products ;

    //them danh sach cac phien ban san pham
    List<ProductVersionRequest> versions;
}
