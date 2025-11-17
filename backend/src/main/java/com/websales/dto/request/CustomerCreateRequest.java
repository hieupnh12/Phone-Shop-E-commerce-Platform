package com.websales.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerCreateRequest {
    String fullName;
    @Pattern(regexp = "^(0)[0-9]{9}$", message = "PHONE_NUMBER_INVALID")
    String phoneNumber;
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "EMAIL_INVALID")
    String email;
    Boolean gender;
    @JsonFormat(pattern = "dd-MM-yyyy")
    LocalDate birthDate;

}
