package com.websales.dto.request;


import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

import java.math.BigDecimal;

@Builder                 // Tạo builder pattern giúp tạo đối tượng dễ dàng, linh hoạt
// Đánh dấu class này là entity, ánh xạ tới bảng trong DB
@Data                    // Tự sinh getter, setter, toString, equals, hashCode
@NoArgsConstructor       // Tạo constructor không tham số (mặc định)
@AllArgsConstructor      // Tạo constructor với tất cả các tham số
@FieldDefaults(level = AccessLevel.PRIVATE) // Mặc định các biến thành private, không cần khai báo riêng
public class ProductVersionRequest {

    @NotNull
    @Positive
        Long idProduct;

    @NotNull
    @Positive
        Long idRom;

    @NotNull
    @Positive
        Long idRam;

    @NotNull
    @Positive
        Long idColor;

    @NotNull
    @DecimalMin("0.0")
    BigDecimal importPrice;

    Integer stockQuantity;

    @NotNull
    @DecimalMin("0.0")
    BigDecimal exportPrice;

    @NotNull
    Boolean status;


    //thêm các imei tương ứng với từng sản pham version
    List<ProductItemRequest> Items;

}
