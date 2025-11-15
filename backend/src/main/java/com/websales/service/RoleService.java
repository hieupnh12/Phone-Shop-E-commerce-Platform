package com.websales.service;

import com.websales.dto.request.CreateRoleRequest;
import com.websales.entity.Permission;
import com.websales.entity.Role;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.repository.PermissionRepo;
import com.websales.repository.RoleRepo;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleService {
    RoleRepo roleRepo;
    PermissionRepo permissionRepo;

    public void createRole(CreateRoleRequest request) {
       if (roleRepo.existsRoleByName(request.getRoleName())){
           throw new AppException(ErrorCode.ROLE_EXITED);
       }
        Set<Permission> permissions = new HashSet<>(
                permissionRepo.findAllById(request.getPermissionId())
        );


         roleRepo.save(  Role.builder()
                 .name(request.getRoleName())
                 .description(request.getDescription())
                 .rolePermissions(permissions)
                 .build());
    }
}
