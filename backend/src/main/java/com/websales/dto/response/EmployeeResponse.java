package com.websales.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeResponse {
    Long id;
    String fullName;
    String email;
    LocalDateTime createdAt;
    Boolean isActive ;
    Set<RoleResponse> roles;
}
