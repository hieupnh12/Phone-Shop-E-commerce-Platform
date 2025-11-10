package com.websales.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerResponse {
    Long customerId;
    String fullName;
    String phoneNumber;
    String email;
    Boolean gender;
    LocalDate birthDate;
    String address;
    LocalDateTime createAt;
    LocalDateTime updateAt;
}
