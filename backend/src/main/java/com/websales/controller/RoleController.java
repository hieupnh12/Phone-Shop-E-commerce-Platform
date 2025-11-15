package com.websales.controller;

import com.websales.dto.request.CreateRoleRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.service.RoleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.RecursiveTask;

@RestController
@RequestMapping("/role")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleController {
    RoleService roleService;

    @PostMapping
    public ApiResponse<String> createRole(@RequestBody CreateRoleRequest request) {
        roleService.createRole(request);
        return ApiResponse.<String>builder()
                .result("Tao role thanh cong")
                .build();
    }
}
