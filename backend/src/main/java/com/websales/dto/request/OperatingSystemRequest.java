package com.websales.dto.request;



import com.websales.entity.OperatingSystem;
import com.websales.validation.UniqueName;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OperatingSystemRequest {

    @UniqueName(entity = OperatingSystem.class, fieldName = "name")
    String nameOS;

    boolean status;

}
