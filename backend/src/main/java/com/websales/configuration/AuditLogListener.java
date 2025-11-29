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
import java.util.*;

@Slf4j
@Component
public class AuditLogListener {

    // ThreadLocal to store old entity state before update
    private static final ThreadLocal<Map<String, String>> oldEntityState = new ThreadLocal<>();

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

    private String serializeRole(Object entity) {
        try {
            Map<String, Object> data = new HashMap<>();

            if (entity instanceof Role role) {
                data.put("id", getFieldValue(role, "id"));
                data.put("name", getFieldValue(role, "name"));
                data.put("description", getFieldValue(role, "description"));
                data.put("isDeleted", getFieldValue(role, "isDeleted"));

                // Serialize permissions with full details
                Set<?> rolePermissions = (Set<?>) getFieldValue(role, "rolePermissions");
                if (rolePermissions != null && !rolePermissions.isEmpty()) {
                    List<Map<String, Object>> permissionDetails = rolePermissions.stream()
                            .map(permission -> {
                                Map<String, Object> permData = new HashMap<>();
                                permData.put("id", getFieldValue(permission, "id"));
                                permData.put("module", getFieldValue(permission, "module"));
                                permData.put("action", getFieldValue(permission, "action"));
                                permData.put("resource", getFieldValue(permission, "resource"));
                                return permData;
                            })
                            .filter(permData -> permData.get("id") != null) // Only include valid permissions
                            .sorted(Comparator.comparing(p -> {
                                Object id = p.get("id");
                                return id instanceof Integer ? (Integer) id : 0;
                            }))
                            .toList();
                    data.put("permissions", permissionDetails);
                } else {
                    data.put("permissions", new ArrayList<>());
                }
            }
            else if (entity instanceof Employee emp) {
                data.put("id", getFieldValue(emp, "id"));
                data.put("email", getFieldValue(emp, "email"));
                data.put("fullName", getFieldValue(emp, "fullName"));
                data.put("isActive", getFieldValue(emp, "isActive"));
                data.put("createdAt", getFieldValue(emp, "createdAt"));
                data.put("updatedAt", getFieldValue(emp, "updatedAt"));
            }

            return ContextUtils.getObjectMapper().writeValueAsString(data);
        } catch (Exception e) {
            log.error("Error serializing entity for audit log", e);
            return "{\"error\": \"serialization failed\"}";
        }
    }
    private String serializeEmployee(Employee employee) {
        try {
            Map<String, Object> data = new HashMap<>();
            // Use reflection to safely access fields without triggering Hibernate operations
            data.put("id", getFieldValue(employee, "id"));
            data.put("email", getFieldValue(employee, "email"));
            data.put("fullName", getFieldValue(employee, "fullName"));
            data.put("isActive", getFieldValue(employee, "isActive"));
            data.put("createdAt", getFieldValue(employee, "createdAt"));
            data.put("updatedAt", getFieldValue(employee, "updatedAt"));
            // Don't serialize relationships to avoid lazy loading issues
            // Relationship data will not be included to prevent Hibernate session issues
            // Don't include passwordHash for security
            ObjectMapper mapper = ContextUtils.getObjectMapper();
            return mapper.writeValueAsString(data);
        } catch (Exception e) {
            log.error("Error serializing Employee", e);
            return "{}";
        }
    }
    
    /**
     * Safely get field value using reflection to avoid triggering Hibernate getters
     */
    private Object getFieldValue(Object obj, String fieldName) {
        try {
            Class<?> clazz = obj.getClass();
            Field field = null;
            
            // Try to find field in current class and superclasses
            while (clazz != null && field == null) {
                try {
                    field = clazz.getDeclaredField(fieldName);
                } catch (NoSuchFieldException e) {
                    clazz = clazz.getSuperclass();
                }
            }
            
            if (field == null) {
                log.warn("Could not find field: {} in class: {}", fieldName, obj.getClass().getSimpleName());
                return null;
            }
            
            field.setAccessible(true);
            return field.get(obj);
        } catch (Exception e) {
            log.warn("Error getting field value for field: {} in class: {}", fieldName, obj.getClass().getSimpleName(), e);
            return null;
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
                log.debug("Entity is Employee or Role, saving old state and scheduling audit log creation...");
                // Save old state before update for comparison
                saveOldEntityState(entity);
                // Delay building audit log until after transaction commit to avoid Hibernate session issues
                scheduleAuditLogCreation(entity, "UPDATE");
            } else {
                log.debug("Entity {} is not Employee or Role, skipping audit log", entity.getClass().getSimpleName());
            }
        } catch (Exception e) {
            log.error("Error in preUpdate audit log listener for entity: {}", entity.getClass().getSimpleName(), e);
        }
        // Note: Don't remove oldEntityState here - it will be cleaned up in afterCommit
    }
    
    /**
     * Save old entity state before update for comparison
     */
    private void saveOldEntityState(Object entity) {
        try {
            String oldState = serializeObject(entity);
            Long recordId = getRecordIdUsingReflection(entity);
            if (recordId != null) {
                Map<String, String> stateMap = new HashMap<>();
                stateMap.put(recordId.toString(), oldState);
                oldEntityState.set(stateMap);
                log.debug("Saved old state for entity with ID: {}", recordId);
            }
        } catch (Exception e) {
            log.error("Error saving old entity state", e);
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

                            String changes;
                            if ("UPDATE".equals(action)) {
                                // For UPDATE, create diff object with old and new values
                                changes = createUpdateDiff(entityRef, recordId);
                            } else {
                                // For CREATE, just serialize the new entity
                                changes = serializeObject(entityRef);
                            }

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
                        } finally {
                            // Clean up old state after processing
                            oldEntityState.remove();
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
    
    /**
     * Create diff object showing changes between old and new entity state
     */
    private String createUpdateDiff(Object newEntity, Long recordId) {
        try {
            Map<String, Object> diff = new HashMap<>();
            
            // Get old state from ThreadLocal
            Map<String, String> oldStateMap = oldEntityState.get();
            String oldStateJson = null;
            if (oldStateMap != null && recordId != null) {
                oldStateJson = oldStateMap.get(recordId.toString());
            }
            
            // Serialize new state
            String newStateJson = serializeObject(newEntity);
            
            // Parse old and new states to compare
            ObjectMapper mapper = ContextUtils.getObjectMapper();
            Map<String, Object> oldState = oldStateJson != null ? 
                mapper.readValue(oldStateJson, Map.class) : new HashMap<>();
            Map<String, Object> newState = mapper.readValue(newStateJson, Map.class);
            
            // Find differences
            Map<String, Object> changes = new HashMap<>();
            Set<String> allKeys = new HashSet<>();
            allKeys.addAll(oldState.keySet());
            allKeys.addAll(newState.keySet());
            
            for (String key : allKeys) {
                Object oldValue = oldState.get(key);
                Object newValue = newState.get(key);
                
                if (!Objects.equals(oldValue, newValue)) {
                    Map<String, Object> change = new HashMap<>();
                    change.put("old", oldValue);
                    change.put("new", newValue);
                    changes.put(key, change);
                }
            }
            
            diff.put("old", oldState);
            diff.put("new", newState);
            diff.put("changes", changes);
            
            return mapper.writeValueAsString(diff);
        } catch (Exception e) {
            log.error("Error creating update diff", e);
            // Fallback to just new state if diff creation fails
            return serializeObject(newEntity);
        }
    }
}