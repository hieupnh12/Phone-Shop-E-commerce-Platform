package com.websales.configuration;

import com.websales.entity.AuditLog;
import com.websales.entity.Employee;
import com.websales.entity.Role;
import com.websales.handler.ContextUtils;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

public class AuditLogListener {

    private Long getCurrentEmployeeId() {
        return ContextUtils.getEmployeeId();
    }

    private String serializeObject(Object obj) {
        try {
            return ContextUtils.getObjectMapper().writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }

    @PrePersist
    public void prePersist(Object entity) {
        if (entity instanceof Employee || entity instanceof Role) {
            createAuditLog(entity, "CREATE");
        }
    }

    @PreUpdate
    public void preUpdate(Object entity) {
        if (entity instanceof Employee || entity instanceof Role) {
            createAuditLog(entity, "UPDATE");
        }
    }

    private void createAuditLog(Object entity, String action) {
        Long employeeId = getCurrentEmployeeId();

        if (employeeId == null) return;

        AuditLog log = AuditLog.builder()
                .employeeId(employeeId)
                .action(action)
                .tableName(entity.getClass().getSimpleName())
                .recordId(getRecordId(entity))
                .changes(serializeObject(entity))
                .ipAddress(ContextUtils.getIpAddress())
                .userAgent(ContextUtils.getUserAgent())
                .build();

        ContextUtils.getAuditLogRepository().save(log);
    }

    private Long getRecordId(Object entity) {
        if (entity instanceof Employee) return ((Employee) entity).getId();
        if (entity instanceof Role) return (long) ((Role) entity).getId();
        return null;
    }
}
