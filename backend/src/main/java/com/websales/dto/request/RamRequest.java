package com.websales.dto.request;



import com.websales.entity.Ram;
import com.websales.validation.UniqueName;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder                 // Tạo builder pattern giúp tạo đối tượng dễ dàng, linh hoạt
@Data                    // Tự sinh getter, setter, toString, equals, hashCode
@NoArgsConstructor       // Tạo constructor không tham số (mặc định)
@AllArgsConstructor      // Tạo constructor với tất cả các tham số
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RamRequest {

    @UniqueName(entity = Ram.class, fieldName = "name")
    String nameRam;

    Boolean status;
}
