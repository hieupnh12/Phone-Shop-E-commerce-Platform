package com.websales.dto.response;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OriginResponse {
    Long idOrigin;
    String nameOrigin;
//    boolean status;

}
