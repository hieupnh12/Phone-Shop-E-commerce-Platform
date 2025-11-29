package com.websales.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.websales.entity.AuditLog;
import com.websales.entity.Employee;
import com.websales.entity.Role;
import com.websales.handler.ContextUtils;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class AuditLogListener {

    private Long getCurrentEmployeeId() {
        return ContextUtils.getEmployeeId();
    }

    /**
     * Serialize entity safely without triggering lazy loading
     * Only serializes basic fields, not relationships
     */
    private String serializeObject(Object obj) {
        try {
            if (obj instanceof Role) {
                return serializeRole((Role) obj);
            } else if (obj instanceof Employee) {
                return serializeEmployee((Employee) obj);
            } else {
                // Fallback to JSON serialization for other types
                ObjectMapper mapper = ContextUtils.getObjectMapper();
                return mapper.writeValueAsString(obj);
            }
        } catch (Exception e) {
            log.error("Error serializing object for audit log", e);
            return "{}";
        }
    }

    private String serializeRole(Role role) {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("id", role.getId());
            data.put("name", role.getName());
            data.put("description", role.getDescription());
            data.put("isDeleted", role.getIsDeleted());
            // Don't serialize rolePermissions to avoid lazy loading issues in @PostPersist
            // Relationship data will not be included to prevent Hibernate session issues
            ObjectMapper mapper = ContextUtils.getObjectMapper();
            return mapper.writeValueAsString(data);
        } catch (Exception e) {
            log.error("Error serializing Role", e);
            return "{}";
        }
    }

    private String serializeEmployee(Employee employee) {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("id", employee.getId());
            data.put("email", employee.getEmail());
            data.put("fullName", employee.getFullName());
            data.put("isActive", employee.getIsActive());
            data.put("createdAt", employee.getCreatedAt());
            data.put("updatedAt", employee.getUpdatedAt());
            // Don't serialize relationships to avoid lazy loading issues in @PostPersist
            // Relationship data will not be included to prevent Hibernate session issues
            // Don't include passwordHash for security
            ObjectMapper mapper = ContextUtils.getObjectMapper();
            return mapper.writeValueAsString(data);
        } catch (Exception e) {
            log.error("Error serializing Employee", e);
            return "{}";
        }
    }

    @PostPersist
    public void postPersist(Object entity) {
        try {
            log.debug("PostPersist called for entity: {}", entity.getClass().getSimpleName());
            if (entity instanceof Employee || entity instanceof Role) {
                log.debug("Entity is Employee or Role, scheduling audit log creation...");
                // Delay building audit log until after transaction commit to avoid Hibernate session issues
                scheduleAuditLogCreation(entity, "CREATE");
            } else {
                log.debug("Entity {} is not Employee or Role, skipping audit log", entity.getClass().getSimpleName());
            }
        } catch (Exception e) {
            log.error("Error in postPersist audit log listener for entity: {}", entity.getClass().getSimpleName(), e);
        }
    }

    @PreUpdate
    public void preUpdate(Object entity) {
        try {
            log.debug("PreUpdate called for entity: {}", entity.getClass().getSimpleName());
            if (entity instanceof Employee || entity instanceof Role) {
                log.debug("Entity is Employee or Role, building audit log...");
                AuditLog auditLog = buildAuditLog(entity, "UPDATE");
                saveAuditLogAfterCommit(auditLog);
            } else {
                log.debug("Entity {} is not Employee or Role, skipping audit log", entity.getClass().getSimpleName());
            }
        } catch (Exception e) {
            log.error("Error in preUpdate audit log listener for entity: {}", entity.getClass().getSimpleName(), e);
        }
    }

    private AuditLog buildAuditLog(Object entity, String action) {
        try {
            log.debug("Building audit log for action: {} on entity: {}", action, entity.getClass().getSimpleName());
            Long employeeId = getCurrentEmployeeId();
            log.debug("Current employeeId: {}", employeeId);

            if (employeeId == null) {
                log.warn("Cannot create audit log: employeeId is null for action {} on entity {}", action, entity.getClass().getSimpleName());
                return null;
            }

            Long recordId = getRecordId(entity);
            log.debug("Record ID: {}", recordId);
            if (recordId == null) {
                log.warn("Cannot create audit log: recordId is null for action {} on entity {}", action, entity.getClass().getSimpleName());
                return null;
            }

            AuditLog auditLog = AuditLog.builder()
                    .employeeId(employeeId)
                    .action(action)
                    .tableName(entity.getClass().getSimpleName())
                    .recordId(recordId)
                    .changes(serializeObject(entity))
                    .ipAddress(ContextUtils.getIpAddress())
                    .userAgent(ContextUtils.getUserAgent())
                    .build();
            log.debug("Audit log built successfully for entity: {}", entity.getClass().getSimpleName());
            return auditLog;
        } catch (Exception e) {
            log.error("Error building audit log for entity: {}", entity.getClass().getSimpleName(), e);
            return null;
        }
    }

    private void scheduleAuditLogCreation(Object entity, String action) {
        try {
            boolean isTransactionActive = TransactionSynchronizationManager.isActualTransactionActive();
            log.debug("Transaction active: {}", isTransactionActive);

            if (isTransactionActive) {
                log.debug("Registering transaction synchronization for audit log creation");

                final Object entityRef = entity;
                final String entityClassName = entity.getClass().getSimpleName();

                final Long recordId = getRecordIdUsingReflection(entity);

                final String ipAddress = ContextUtils.getIpAddress();
                final String userAgent = ContextUtils.getUserAgent();

                if (recordId == null) {
                    log.warn("Cannot create audit log: recordId is null for action {} on entity {}", action, entityClassName);
                    return;
                }

                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        try {
                            log.debug("Transaction committed, creating audit log for entity: {}", entityClassName);

                            final Long employeeId = getCurrentEmployeeId();

                            if (employeeId == null) {
                                log.warn("Cannot create audit log: employeeId is null after commit for action {} on entity {}", action, entityClassName);
                                return;
                            }

                            String changes = serializeObject(entityRef);

                            AuditLog auditLog = AuditLog.builder()
                                    .employeeId(employeeId)
                                    .action(action)
                                    .tableName(entityClassName)
                                    .recordId(recordId)
                                    .changes(changes)
                                    .ipAddress(ipAddress)
                                    .userAgent(userAgent)
                                    .build();

                            ContextUtils.getAuditLogService().saveAuditLog(auditLog);
                            log.debug("Audit log saved successfully");
                        } catch (Exception e) {
                            log.error("Error creating audit log after commit", e);
                        }
                    }
                });
            }
            else {
                log.debug("No active transaction, creating audit log immediately");
                AuditLog auditLog = buildAuditLog(entity, action);
                if (auditLog != null) {
                    ContextUtils.getAuditLogService().saveAuditLog(auditLog);                    log.debug("Audit log saved successfully");
                }
            }        } catch (Exception e) {
            log.error("Error in scheduleAuditLogCreation", e);
        }
    }

    private void saveAuditLogAfterCommit(AuditLog auditLog) {
        if (auditLog == null) {
            log.debug("Audit log is null, skipping save");
            return;
        }

        try {
            boolean isTransactionActive = TransactionSynchronizationManager.isActualTransactionActive();
            log.debug("Transaction active: {}", isTransactionActive);

            if (isTransactionActive) {
                log.debug("Registering transaction synchronization for audit log");
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        try {
                            log.debug("Transaction committed, saving audit log");
                            ContextUtils.getAuditLogService().saveAuditLog(auditLog);                            log.debug("Audit log saved successfully");
                        } catch (Exception e) {
                            log.error("Error saving audit log after commit", e);
                        }
                    }
                });
            }
            else {
                log.debug("No active transaction, saving audit log immediately");
                ContextUtils.getAuditLogService().saveAuditLog(auditLog);                log.debug("Audit log saved successfully");
            }
        } catch (Exception e) {
            log.error("Error in saveAuditLogAfterCommit", e);
        }
    }

    /**
     * Safely get record ID using reflection to avoid triggering Hibernate getters
     */
    private Long getRecordIdUsingReflection(Object entity) {
        try {
            Class<?> entityClass = entity.getClass();
            Field idField = null;

            // Try to find id field
            Field[] fields = entityClass.getDeclaredFields();
            for (Field field : fields) {
                if (field.getName().equals("id")) {
                    idField = field;
                    break;
                }
            }

            if (idField == null) {
                log.warn("Could not find id field in entity: {}", entityClass.getSimpleName());
                return null;
            }

            idField.setAccessible(true);
            Object idValue = idField.get(entity);

            if (idValue == null) {
                return null;
            }

            if (idValue instanceof Long) {
                return (Long) idValue;
            } else if (idValue instanceof Integer) {
                return ((Integer) idValue).longValue();
            } else {
                log.warn("Unexpected ID type: {} in entity: {}", idValue.getClass().getSimpleName(), entityClass.getSimpleName());
                return null;
            }
        } catch (Exception e) {
            log.error("Error getting record ID using reflection from entity: {}", entity.getClass().getSimpleName(), e);
            return null;
        }
    }

    private Long getRecordId(Object entity) {
        try {
            if (entity instanceof Employee) {
                Long id = ((Employee) entity).getId();
                return id != null ? id : null;
            }
            if (entity instanceof Role) {
                Integer id = ((Role) entity).getId();
                return id != null ? id.longValue() : null;
            }
            return null;
        } catch (Exception e) {
            log.error("Error getting record ID from entity: {}", entity.getClass().getSimpleName(), e);
            return null;
        }
    }
}