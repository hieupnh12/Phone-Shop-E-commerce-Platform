package com.websales.mapper;

import com.websales.dto.response.RoleResponse;
import com.websales.entity.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    RoleResponse roleToRoleResponse(Role role);
}
