package com.websales.service;

import com.websales.dto.request.CreateRoleRequest;
import com.websales.dto.request.UpdateRoleRequest;
import com.websales.dto.response.RoleResponse;
import com.websales.entity.Employee;
import com.websales.entity.InvalidToken;
import com.websales.entity.Permission;
import com.websales.entity.Role;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.mapper.RoleMapper;
import com.websales.repository.EmployeeRepo;
import com.websales.repository.InvalidTokenRepository;
import com.websales.repository.PermissionRepo;
import com.websales.repository.RoleRepo;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleService {
    RoleRepo roleRepo;
    PermissionRepo permissionRepo;
    RoleMapper roleMapper;
    EmployeeRepo employeeRepo;
    InvalidTokenRepository invalidTokenRepo;
    RedisTemplate<String, String> redisTemplate;

    @NonFinal
    @Value("${jwt.expiration}")
    protected Long VALID_DURATION;

    public RoleResponse createRole(CreateRoleRequest request) {
       if (roleRepo.existsRoleByName(request.getRoleName())){
           throw new AppException(ErrorCode.ROLE_EXITED);
       }
        Set<Permission> permissions = new HashSet<>(
                permissionRepo.findAllById(request.getPermissionId())
        );


     var role  =  roleRepo.save(  Role.builder()
                 .name(request.getRoleName())
                 .description(request.getDescription())
                 .rolePermissions(permissions)
                 .build());

        return roleMapper.roleToRoleResponse(role);
    }

    public List<RoleResponse> getAllRole() {
       return roleRepo.findAll()
                .stream()
                .map(roleMapper::roleToRoleResponse)
                .collect(Collectors.toList());
    }

    public List<Permission> getAllPermission() {
        return permissionRepo.findAll();
    }

    public void updateRole(Integer roleId, UpdateRoleRequest request) {
        Role role = roleRepo.findById(roleId).orElseThrow(
                () -> new AppException(ErrorCode.ROLE_NOT_EXIT)
        );

        if (!request.getRoleName().equals(role.getName())){
            if (roleRepo.existsRoleByName(request.getRoleName())){
                throw new AppException(ErrorCode.ROLE_EXITED);
            }
            role.setName(request.getRoleName());
        }
        role.setDescription(request.getDescription());
        Set<Permission> newPermissions = permissionRepo.findAllById(request.getPermissionId())
                .stream()
                .collect(Collectors.toSet());
        role.setRolePermissions(newPermissions);
        List<Employee> employees = employeeRepo.findByRoleId(roleId);
        for (Employee employee : employees) {
            String jwtId = redisTemplate.opsForValue().get("jwt:" + employee.getFullName());
            if (jwtId != null) {
                InvalidToken invalidToken = InvalidToken.builder()
                        .id(jwtId)
                        .expiryTime(new Date(Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli())) // Sử dụng VALID_DURATION từ cấu hình
                        .build();
                invalidTokenRepo.save(invalidToken);
                redisTemplate.delete("jwt:" + employee.getFullName());
                redisTemplate.delete("permissions:" + employee.getFullName());
            }
        }

        roleRepo.save(role);
    }

    @Transactional
    public void deleteRole(Integer roleId) {
        Role role = roleRepo.findById(roleId).orElseThrow(
                () -> new AppException(ErrorCode.ROLE_NOT_EXIT)
        );

        if (employeeRepo.existsByEmployeeRolesContains(role)) {
            throw new AppException(ErrorCode.CONSTRAINT_VIOLATION);
        }
        if (role.getIsDeleted() != null && role.getIsDeleted()) {
            throw new AppException(ErrorCode.ROLE_NOT_EXIT);
        }
        role.setIsDeleted(true);
        roleRepo.save(role);
    }


}
