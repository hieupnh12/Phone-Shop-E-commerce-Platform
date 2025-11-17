package com.websales.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SmsRequest {
    String ApiKey;
    String SecretKey;
    String Content;
    String Phone;
    String Brandname;
    String SmsType;
    String IsUnicode;
}
