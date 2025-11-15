package com.websales.dto.response;

import com.websales.entity.Customer;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CusLoginResponse {
    String token;
    Customer customer;
}
