package com.websales.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateRoleRequest {

    @NotBlank(message = "Tên Role không được để trống")
    String roleName;

    @NotBlank(message = "Mô tả không được để trống")
    String description;

    @NotNull(message = "Permission ID không được để null")
    Set<Integer> permissionId;
}
