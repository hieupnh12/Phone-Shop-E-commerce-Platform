package com.websales.mapper;
import com.websales.dto.response.AuditLogResponse;
import com.websales.entity.AuditLog;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {

    AuditLogResponse toResponse(AuditLog auditLog);
}
