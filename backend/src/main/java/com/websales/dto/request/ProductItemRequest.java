package com.websales.dto.request;

import com.websales.enums.ItemStatus;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder                 // Tạo builder pattern giúp tạo đối tượng dễ dàng, linh hoạt
@Data                    // Tự sinh getter, setter, toString, equals, hashCode
@NoArgsConstructor       // Tạo constructor không tham số (mặc định)
@AllArgsConstructor      // Tạo constructor với tất cả các tham số
@FieldDefaults(level = AccessLevel.PRIVATE) // Mặc định các biến thành private, không cần khai báo riêng
public class ProductItemRequest {

    @Pattern(regexp = "^\\d{15}$", message = "IMEI must be exactly 15 digits")
    String imei;

    String idProductVersion;

    @Builder.Default
    ItemStatus status = ItemStatus.IN_STOCK;
}
