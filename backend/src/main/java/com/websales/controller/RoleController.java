package com.websales.controller;

import com.websales.dto.request.CreateRoleRequest;
import com.websales.dto.request.UpdateRoleRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.RoleResponse;
import com.websales.entity.Permission;
import com.websales.service.RoleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.RecursiveTask;

@RestController
@RequestMapping("/role")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleController {
    RoleService roleService;

    @PostMapping
    @PreAuthorize("hasAuthority('SCOPE_STAFF_MANAGE_ROLES')")
    public ApiResponse<RoleResponse> createRole(@RequestBody CreateRoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.createRole(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_STAFF_VIEW_ALL') or hasAuthority('SCOPE_STAFF_MANAGE_ROLES')")
    public ApiResponse<List<RoleResponse>> getAllRoles() {
    return ApiResponse.<List<RoleResponse>>builder()
            .result(roleService.getAllRole())
            .build();
    }

    @GetMapping("/permission")
    @PreAuthorize("hasAuthority('SCOPE_STAFF_VIEW_ALL') or hasAuthority('SCOPE_STAFF_MANAGE_ROLES')")
    public ApiResponse<List<Permission>> getAllPermission() {
        return ApiResponse.<List<Permission>>builder()
                .result(roleService.getAllPermission())
                .build();
    }

    @PutMapping("/{roleId}")
    @PreAuthorize("hasAuthority('SCOPE_STAFF_MANAGE_ROLES')")
    public ApiResponse<String> updateRole(@PathVariable Integer roleId, @RequestBody UpdateRoleRequest request) {
        roleService.updateRole(roleId, request);
        return ApiResponse.<String>builder()
                .result("Cập nhật Role thành công")
                .build();
    }

    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasAuthority('SCOPE_STAFF_MANAGE_ROLES')")
    public ApiResponse<String> deleteRole(@PathVariable Integer roleId) {
        roleService.deleteRole(roleId);
        return ApiResponse.<String>builder()
                .result("Xóa Role thành công")
                .build();
    }
}

