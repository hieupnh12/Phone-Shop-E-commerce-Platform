package com.websales.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;


@Builder                 // Tạo builder pattern giúp tạo đối tượng dễ dàng, linh hoạt
// Đánh dấu class này là entity, ánh xạ tới bảng trong DB
@Data                    // Tự sinh getter, setter, toString, equals, hashCode
@NoArgsConstructor       // Tạo constructor không tham số (mặc định)
@AllArgsConstructor      // Tạo constructor với tất cả các tham số
@FieldDefaults(level = AccessLevel.PRIVATE) // Mặc định các biến thành private, không cần khai báo riêng
public class NewVersionResponse {

    String idVersion;

    String idProduct;

    String productName;

    String romName;

    String ramName;

    String colorName;

    List<ImageVersionResponse> images;

    BigDecimal importPrice;

    BigDecimal exportPrice;

    Integer stockQuantity;

    Boolean status;

    List<ImeiResponse> imei;   //importRequest3

}
