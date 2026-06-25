package com.websales.mapper;

import com.websales.dto.response.RoleResponse;
import com.websales.entity.Permission;
import com.websales.entity.Role;
import java.util.LinkedHashSet;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class RoleMapperImpl implements RoleMapper {

    @Override
    public RoleResponse roleToRoleResponse(Role role) {
        if ( role == null ) {
            return null;
        }

        RoleResponse.RoleResponseBuilder roleResponse = RoleResponse.builder();

        roleResponse.id( role.getId() );
        roleResponse.name( role.getName() );
        Set<Permission> set = role.getRolePermissions();
        if ( set != null ) {
            roleResponse.rolePermissions( new LinkedHashSet<Permission>( set ) );
        }

        return roleResponse.build();
    }
}
