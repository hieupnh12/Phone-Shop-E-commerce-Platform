package com.websales.dto.request;



import com.websales.entity.Origin;
import com.websales.validation.UniqueName;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OriginRequest {


//    @UniqueName(entity = Origin.class, fieldName = "origin_name")
    String nameOrigin;

    boolean status;
}
