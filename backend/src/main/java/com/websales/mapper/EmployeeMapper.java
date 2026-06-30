package com.websales.mapper;

import com.websales.dto.response.EmployeeResponse;
import com.websales.dto.response.RoleResponse;
import com.websales.entity.Employee;
import com.websales.entity.Permission;
import com.websales.entity.Role;
import org.mapstruct.Mapper;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {
  //  EmployeeResponse employeeToEmployeeResponse(Employee employee);

     default EmployeeResponse employeeToEmployeeResponse(Employee employee) {
        if (employee == null) {
            return null;
        }

        Set<RoleResponse> rolesResponse = employee.getEmployeeRoles().stream()
                .map(this::roleToRoleResponse)
                .collect(Collectors.toSet());

        return EmployeeResponse.builder()
                .id(employee.getId())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .createdAt(employee.getCreatedAt())
                .isActive(employee.getIsActive())
                .roles(rolesResponse)
                .build();
    }

     default RoleResponse roleToRoleResponse(Role role) {
        if (role == null) {
            return null;
        }

        Set<Permission> permissions = role.getRolePermissions();

        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .rolePermissions(permissions)
                .build();
    }

}
