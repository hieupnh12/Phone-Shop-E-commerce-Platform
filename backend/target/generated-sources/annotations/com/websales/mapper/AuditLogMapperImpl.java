package com.websales.mapper;

import com.websales.dto.response.AuditLogResponse;
import com.websales.entity.AuditLog;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class AuditLogMapperImpl implements AuditLogMapper {

    @Override
    public AuditLogResponse toResponse(AuditLog auditLog) {
        if ( auditLog == null ) {
            return null;
        }

        AuditLogResponse.AuditLogResponseBuilder auditLogResponse = AuditLogResponse.builder();

        auditLogResponse.id( auditLog.getId() );
        auditLogResponse.employeeId( auditLog.getEmployeeId() );
        auditLogResponse.action( auditLog.getAction() );
        auditLogResponse.tableName( auditLog.getTableName() );
        auditLogResponse.recordId( auditLog.getRecordId() );
        auditLogResponse.changes( auditLog.getChanges() );
        auditLogResponse.ipAddress( auditLog.getIpAddress() );
        auditLogResponse.userAgent( auditLog.getUserAgent() );
        auditLogResponse.createdAt( auditLog.getCreatedAt() );

        AuditLogResponse auditLogResponseResult = auditLogResponse.build();

        afterMapping( auditLog, auditLogResponseResult );

        return auditLogResponseResult;
    }
}
