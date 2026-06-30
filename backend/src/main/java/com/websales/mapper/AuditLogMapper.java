package com.websales.mapper;
import com.websales.dto.response.AuditLogResponse;
import com.websales.entity.AuditLog;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {

    @Mapping(target = "employeeFullName", ignore = true)
    AuditLogResponse toResponse(AuditLog auditLog);
    
    @AfterMapping
    default void afterMapping(AuditLog auditLog, @MappingTarget AuditLogResponse response) {
        // Map employeeFullName from Employee relationship
        if (auditLog.getEmployee() != null) {
            response.setEmployeeFullName(auditLog.getEmployee().getFullName());
        }
    }
}
