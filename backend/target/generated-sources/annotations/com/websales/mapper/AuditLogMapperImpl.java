package com.websales.mapper;

import com.websales.dto.response.AuditLogResponse;
import com.websales.entity.AuditLog;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class AuditLogMapperImpl implements AuditLogMapper {

    @Override
    public AuditLogResponse toResponse(AuditLog auditLog) {
        if ( auditLog == null ) {
            return null;
        }

        AuditLogResponse.AuditLogResponseBuilder auditLogResponse = AuditLogResponse.builder();

        auditLogResponse.action( auditLog.getAction() );
        auditLogResponse.changes( auditLog.getChanges() );
        auditLogResponse.createdAt( auditLog.getCreatedAt() );
        auditLogResponse.employeeId( auditLog.getEmployeeId() );
        auditLogResponse.id( auditLog.getId() );
        auditLogResponse.ipAddress( auditLog.getIpAddress() );
        auditLogResponse.recordId( auditLog.getRecordId() );
        auditLogResponse.tableName( auditLog.getTableName() );
        auditLogResponse.userAgent( auditLog.getUserAgent() );

        AuditLogResponse auditLogResponseResult = auditLogResponse.build();

        afterMapping( auditLog, auditLogResponseResult );

        return auditLogResponseResult;
    }
}
