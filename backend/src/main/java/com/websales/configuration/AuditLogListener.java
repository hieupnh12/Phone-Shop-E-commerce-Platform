package com.websales.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.websales.entity.AuditLog;
import com.websales.entity.Customer;
import com.websales.entity.Employee;
import com.websales.entity.Order;
import com.websales.entity.Permission;
import com.websales.entity.Product;
import com.websales.entity.Role;
import com.websales.handler.ContextUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreRemove;
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
    // Key format: "EntityClassName:recordId" to avoid conflicts
    private static final ThreadLocal<Map<String, String>> oldEntityState = new ThreadLocal<>();
    
    // ThreadLocal to store entity snapshots when loaded (via @PostLoad)
    // This allows us to get old state even after entity is modified
    private static final ThreadLocal<Map<String, String>> entitySnapshots = new ThreadLocal<>();

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
                return serializeRole(obj);
            } else if (obj instanceof Employee) {
                return serializeEmployee((Employee) obj);
            } else if (obj instanceof Product) {
                return serializeProduct((Product) obj);
            } else if (obj instanceof Order) {
                return serializeOrder((Order) obj);
            } else if (obj instanceof Customer) {
                return serializeCustomer((Customer) obj);
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
            if (!(entity instanceof Role role)) {
                log.warn("serializeRole called with non-Role entity: {}", entity.getClass().getSimpleName());
                return "{}";
            }

            Map<String, Object> data = new HashMap<>();
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

            return ContextUtils.getObjectMapper().writeValueAsString(data);
        } catch (Exception e) {
            log.error("Error serializing Role for audit log", e);
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
    
    private String serializeProduct(Product product) {
        try {
            Map<String, Object> data = new HashMap<>();
            // Use reflection to safely access fields without triggering Hibernate operations
            data.put("idProduct", getFieldValue(product, "idProduct"));
            data.put("nameProduct", getFieldValue(product, "nameProduct"));
            data.put("image", getFieldValue(product, "image"));
            data.put("battery", getFieldValue(product, "battery"));
            data.put("scanFrequency", getFieldValue(product, "scanFrequency"));
            data.put("screenSize", getFieldValue(product, "screenSize"));
            data.put("screenResolution", getFieldValue(product, "screenResolution"));
            data.put("screenTech", getFieldValue(product, "screenTech"));
            data.put("chipset", getFieldValue(product, "chipset"));
            data.put("rearCamera", getFieldValue(product, "rearCamera"));
            data.put("frontCamera", getFieldValue(product, "frontCamera"));
            data.put("warrantyPeriod", getFieldValue(product, "warrantyPeriod"));
            data.put("stockQuantity", getFieldValue(product, "stockQuantity"));
            data.put("status", getFieldValue(product, "status"));
            
            // Serialize relationships safely - only IDs to avoid lazy loading
            Object origin = getFieldValue(product, "origin");
            if (origin != null) {
                Object originId = getFieldValue(origin, "id");
                data.put("originId", originId);
            }
            
            Object brand = getFieldValue(product, "brand");
            if (brand != null) {
                Object brandId = getFieldValue(brand, "id");
                data.put("brandId", brandId);
            }
            
            Object category = getFieldValue(product, "category");
            if (category != null) {
                Object categoryId = getFieldValue(category, "id");
                data.put("categoryId", categoryId);
            }
            
            Object operatingSystem = getFieldValue(product, "operatingSystem");
            if (operatingSystem != null) {
                Object osId = getFieldValue(operatingSystem, "id");
                data.put("operatingSystemId", osId);
            }
            
            Object warehouseArea = getFieldValue(product, "warehouseArea");
            if (warehouseArea != null) {
                Object waId = getFieldValue(warehouseArea, "id");
                data.put("warehouseAreaId", waId);
            }
            
            // Don't serialize productVersion list to avoid lazy loading issues
            // Only include count if available
            List<?> productVersions = (List<?>) getFieldValue(product, "productVersion");
            if (productVersions != null) {
                data.put("productVersionCount", productVersions.size());
            }
            
            ObjectMapper mapper = ContextUtils.getObjectMapper();
            return mapper.writeValueAsString(data);
        } catch (Exception e) {
            log.error("Error serializing Product", e);
            return "{}";
        }
    }
    
    private String serializeOrder(Order order) {
        try {
            Map<String, Object> data = new HashMap<>();
            // Use reflection to safely access fields without triggering Hibernate operations
            data.put("orderId", getFieldValue(order, "orderId"));
            data.put("createDatetime", getFieldValue(order, "createDatetime"));
            data.put("endDatetime", getFieldValue(order, "endDatetime"));
            data.put("note", getFieldValue(order, "note"));
            data.put("totalAmount", getFieldValue(order, "totalAmount"));
            data.put("status", getFieldValue(order, "status"));
            data.put("isPaid", getFieldValue(order, "isPaid"));
            
            // Serialize relationships safely - only IDs to avoid lazy loading
            // Wrap in try-catch to handle LazyInitializationException if persistence context is closed
            try {
                Object customerId = getFieldValue(order, "customerId");
                if (customerId != null) {
                    Object customerIdValue = getFieldValue(customerId, "customerId");
                    data.put("customerId", customerIdValue);
                }
            } catch (org.hibernate.LazyInitializationException e) {
                log.debug("Could not serialize customerId for Order (lazy loading issue): {}", e.getMessage());
                // Skip customerId if lazy loading fails - this is OK, we have orderId
            } catch (Exception e) {
                log.debug("Could not serialize customerId for Order: {}", e.getMessage());
            }
            
            try {
                Object employeeId = getFieldValue(order, "employeeId");
                if (employeeId != null) {
                    Object employeeIdValue = getFieldValue(employeeId, "id");
                    data.put("employeeId", employeeIdValue);
                }
            } catch (org.hibernate.LazyInitializationException e) {
                log.debug("Could not serialize employeeId for Order (lazy loading issue): {}", e.getMessage());
                // Skip employeeId if lazy loading fails - this is OK
            } catch (Exception e) {
                log.debug("Could not serialize employeeId for Order: {}", e.getMessage());
            }
            
            // Don't serialize orderDetails list to avoid lazy loading issues
            // Only include count if available (and safe to access)
            try {
                List<?> orderDetails = (List<?>) getFieldValue(order, "orderDetails");
                if (orderDetails != null) {
                    data.put("orderDetailsCount", orderDetails.size());
                }
            } catch (org.hibernate.LazyInitializationException e) {
                log.debug("Could not serialize orderDetails for Order (lazy loading issue): {}", e.getMessage());
                // Skip orderDetails if lazy loading fails - this is OK
            } catch (Exception e) {
                log.debug("Could not serialize orderDetails for Order: {}", e.getMessage());
            }
            
            ObjectMapper mapper = ContextUtils.getObjectMapper();
            return mapper.writeValueAsString(data);
        } catch (Exception e) {
            log.error("Error serializing Order", e);
            // Return minimal data instead of empty object
            try {
                Map<String, Object> minimalData = new HashMap<>();
                minimalData.put("orderId", getFieldValue(order, "orderId"));
                ObjectMapper mapper = ContextUtils.getObjectMapper();
                return mapper.writeValueAsString(minimalData);
            } catch (Exception ex) {
                return "{}";
            }
        }
    }
    
    private String serializeCustomer(Customer customer) {
        try {
            Map<String, Object> data = new HashMap<>();
            // Use reflection to safely access fields without triggering Hibernate operations
            data.put("customerId", getFieldValue(customer, "customerId"));
            data.put("fullName", getFieldValue(customer, "fullName"));
            data.put("phoneNumber", getFieldValue(customer, "phoneNumber"));
            data.put("email", getFieldValue(customer, "email"));
            data.put("gender", getFieldValue(customer, "gender"));
            data.put("birthDate", getFieldValue(customer, "birthDate"));
            data.put("address", getFieldValue(customer, "address"));
            data.put("createAt", getFieldValue(customer, "createAt"));
            data.put("updateAt", getFieldValue(customer, "updateAt"));
            
            ObjectMapper mapper = ContextUtils.getObjectMapper();
            return mapper.writeValueAsString(data);
        } catch (Exception e) {
            log.error("Error serializing Customer", e);
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
        // IMPORTANT: This method must NEVER throw exceptions or fail the transaction
        // All errors must be caught and logged, but the transaction must continue
        try {
            log.debug("PostPersist called for entity: {}", entity.getClass().getSimpleName());
            if (entity instanceof Employee || entity instanceof Role || entity instanceof Product 
                    || entity instanceof Order || entity instanceof Customer) {
                try {
                    log.debug("Entity is tracked for audit log, scheduling audit log creation...");
                    // Delay building audit log until after transaction commit to avoid Hibernate session issues
                    scheduleAuditLogCreation(entity, "CREATE");
                } catch (Exception e) {
                    log.error("Error scheduling audit log creation in postPersist for entity: {}. This error will NOT fail the transaction.", 
                        entity.getClass().getSimpleName(), e);
                    // Continue - don't fail transaction
                }
            } else {
                log.debug("Entity {} is not tracked for audit log", entity.getClass().getSimpleName());
            }
        } catch (Exception e) {
            // Catch ALL exceptions to prevent transaction failure
            log.error("Unexpected error in postPersist audit log listener for entity: {}. This error will NOT fail the transaction.", 
                entity.getClass().getSimpleName(), e);
        }
    }

    @PostLoad
    public void postLoad(Object entity) {
        try {
            if (entity instanceof Employee || entity instanceof Role || entity instanceof Product 
                    || entity instanceof Order || entity instanceof Customer) {
                Long recordId = getRecordIdUsingReflection(entity);
                if (recordId != null) {
                    String entityClassName = entity.getClass().getSimpleName();
                    String key = entityClassName + ":" + recordId;
                    
                    // Save snapshot of entity when it's loaded
                    // This will be used in preUpdate to get old state
                    // Only update snapshot if it doesn't exist or if this is a fresh load
                    String snapshot = serializeObject(entity);
                    
                    Map<String, String> snapshots = entitySnapshots.get();
                    if (snapshots == null) {
                        snapshots = new HashMap<>();
                        entitySnapshots.set(snapshots);
                    }
                    
                    // Only save snapshot if it doesn't exist (first load)
                    // This prevents overwriting snapshot that was saved before modification
                    if (!snapshots.containsKey(key)) {
                        snapshots.put(key, snapshot);
                        log.debug("Saved snapshot for entity: {} with ID: {} (first load)", entityClassName, recordId);
                    } else {
                        log.debug("Snapshot already exists for entity: {} with ID: {}, keeping old snapshot", 
                            entityClassName, recordId);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error in postLoad audit log listener", e);
        }
    }

    @PreUpdate
    public void preUpdate(Object entity) {
        // IMPORTANT: This method must NEVER throw exceptions or fail the transaction
        // All errors must be caught and logged, but the transaction must continue
        try {
            Long recordId = getRecordIdUsingReflection(entity);
            if (recordId == null) {
                log.debug("PreUpdate called for entity: {} but recordId is null, skipping audit log", 
                    entity.getClass().getSimpleName());
                return;
            }
            
            log.debug("PreUpdate called for entity: {} with ID: {}", entity.getClass().getSimpleName(), recordId);
            
            if (entity instanceof Employee || entity instanceof Role || entity instanceof Product 
                    || entity instanceof Order || entity instanceof Customer) {
                try {
                    log.debug("Entity is tracked for audit log, getting snapshot for old state...");
                    
                    String entityClassName = entity.getClass().getSimpleName();
                    String key = entityClassName + ":" + recordId;
                    
                    // Get snapshot saved in @PostLoad (this is the old state before modification)
                    Map<String, String> snapshots = entitySnapshots.get();
                    String oldStateJson = null;
                    if (snapshots != null) {
                        oldStateJson = snapshots.get(key);
                    }
                    
                    if (oldStateJson != null) {
                        // Save old state from snapshot
                        try {
                            saveOldEntityStateFromJson(oldStateJson, entityClassName, recordId);
                            log.debug("Old state saved from snapshot for entity: {} with ID: {}", entityClassName, recordId);
                        } catch (Exception e) {
                            log.error("Error saving old state from snapshot for entity: {} with ID: {}", 
                                entityClassName, recordId, e);
                            // Continue - don't fail transaction
                        }
                        
                        // DON'T update snapshot here - keep the old snapshot until after commit
                        // This ensures if there are multiple updates in the same transaction, we always have the original state
                    } else {
                        log.debug("No snapshot found for entity: {} with ID: {}. This may indicate the entity was created and updated in the same transaction.", 
                            entityClassName, recordId);
                        
                        // If no snapshot exists, it means the entity was likely created in this transaction
                        // and hasn't been loaded from the database yet. In this case, we can't get the "old" state
                        // because there isn't one - the entity is new. We'll serialize the current state as "old"
                        // (which will be the same as "new" for the first update after creation)
                        // This is acceptable because for newly created entities, there is no "old" state to compare.
                        try {
                            saveOldEntityState(entity);
                            log.debug("Serialized current state as old state for newly created entity: {} with ID: {}", 
                                entityClassName, recordId);
                        } catch (Exception e) {
                            log.error("Error serializing current state as old state for entity: {} with ID: {}", 
                                entityClassName, recordId, e);
                            // Continue - don't fail transaction
                        }
                    }
                    
                    // Delay building audit log until after transaction commit to avoid Hibernate session issues
                    try {
                        scheduleAuditLogCreation(entity, "UPDATE");
                    } catch (Exception e) {
                        log.error("Error scheduling audit log creation for entity: {} with ID: {}", 
                            entityClassName, recordId, e);
                        // Continue - don't fail transaction
                    }
                } catch (Exception e) {
                    log.error("Error processing preUpdate for tracked entity: {} with ID: {}", 
                        entity.getClass().getSimpleName(), recordId, e);
                    // Continue - don't fail transaction
                }
            } else {
                log.debug("Entity {} is not tracked for audit log", entity.getClass().getSimpleName());
            }
        } catch (Exception e) {
            // Catch ALL exceptions to prevent transaction failure
            log.error("Unexpected error in preUpdate audit log listener for entity: {}. This error will NOT fail the transaction.", 
                entity.getClass().getSimpleName(), e);
            // Ensure cleanup even on error
            try {
                oldEntityState.remove();
            } catch (Exception cleanupEx) {
                log.error("Error cleaning up ThreadLocal", cleanupEx);
            }
        }
    }
    
    @PreRemove
    public void preRemove(Object entity) {
        try {
            log.debug("PreRemove called for entity: {}", entity.getClass().getSimpleName());
            if (entity instanceof Employee || entity instanceof Role || entity instanceof Product 
                    || entity instanceof Order || entity instanceof Customer) {
                log.debug("Entity is tracked for audit log, saving state before deletion...");
                // Save state before deletion
                saveOldEntityState(entity);
                // Schedule audit log creation for DELETE
                scheduleAuditLogCreation(entity, "DELETE");
            } else {
                log.debug("Entity {} is not tracked for audit log", entity.getClass().getSimpleName());
            }
        } catch (Exception e) {
            log.error("Error in preRemove audit log listener for entity: {}", entity.getClass().getSimpleName(), e);
        }
    }
    
    /**
     * Reload and serialize old state from database safely using native query
     * This is called in preUpdate when snapshot is not available
     * Uses native query to avoid Hibernate entity creation conflicts
     */
    private String reloadAndSerializeOldStateFromDatabaseSafe(String entityClassName, Long recordId) {
        try {
            EntityManager entityManager = ContextUtils.getBean(EntityManager.class);
            if (entityManager == null) {
                return null;
            }

            ObjectMapper mapper = ContextUtils.getObjectMapper();
            
            // Use native query to get raw data - this is safe and doesn't create entity objects
            if ("Role".equals(entityClassName)) {
                @SuppressWarnings("unchecked")
                List<Object[]> results = entityManager.createNativeQuery(
                    "SELECT id, name, description, is_deleted FROM roles WHERE id = ? AND is_deleted = 0")
                    .setParameter(1, recordId.intValue())
                    .getResultList();
                
                if (results.isEmpty()) {
                    return null;
                }
                
                Object[] row = results.get(0);
                Map<String, Object> roleData = new HashMap<>();
                roleData.put("id", row[0]);
                roleData.put("name", row[1]);
                roleData.put("description", row[2]);
                roleData.put("isDeleted", ((Number) row[3]).byteValue() == 1);
                
                @SuppressWarnings("unchecked")
                List<Object[]> permResults = entityManager.createNativeQuery(
                    "SELECT p.id, p.module, p.action, p.resource " +
                    "FROM role_permissions rp " +
                    "JOIN permissions p ON rp.permission_id = p.id " +
                    "WHERE rp.role_id = ? " +
                    "ORDER BY p.id")
                    .setParameter(1, recordId.intValue())
                    .getResultList();
                
                List<Map<String, Object>> permissions = new ArrayList<>();
                for (Object[] permRow : permResults) {
                    Map<String, Object> permData = new HashMap<>();
                    permData.put("id", permRow[0]);
                    permData.put("module", permRow[1]);
                    permData.put("action", permRow[2]);
                    permData.put("resource", permRow[3]);
                    permissions.add(permData);
                }
                roleData.put("permissions", permissions);
                
                return mapper.writeValueAsString(roleData);
            } else if ("Order".equals(entityClassName)) {
                @SuppressWarnings("unchecked")
                List<Object[]> results = entityManager.createNativeQuery(
                    "SELECT order_id, customer_id, employee_id, create_datetime, end_datetime, " +
                    "note, total_amount, status, is_paid FROM orders WHERE order_id = ?")
                    .setParameter(1, recordId.intValue())
                    .getResultList();
                
                if (results.isEmpty()) {
                    return null;
                }
                
                Object[] row = results.get(0);
                Map<String, Object> orderData = new HashMap<>();
                orderData.put("orderId", ((Number) row[0]).intValue());
                orderData.put("customerId", row[1] != null ? ((Number) row[1]).longValue() : null);
                orderData.put("employeeId", row[2] != null ? ((Number) row[2]).longValue() : null);
                orderData.put("createDatetime", row[3] != null ? ((java.sql.Timestamp) row[3]).toLocalDateTime().toString() : null);
                orderData.put("endDatetime", row[4] != null ? ((java.sql.Timestamp) row[4]).toLocalDateTime().toString() : null);
                orderData.put("note", row[5]);
                orderData.put("totalAmount", row[6] != null ? row[6].toString() : null);
                orderData.put("status", row[7] != null ? row[7].toString() : null);
                orderData.put("isPaid", row[8] != null && ((Number) row[8]).byteValue() == 1);
                
                return mapper.writeValueAsString(orderData);
            }
            // Add other entity types as needed
            
            return null;
        } catch (Exception e) {
            log.error("Error reloading entity from database safely: {}", entityClassName, e);
            return null;
        }
    }
    
    /**
     * Reload and serialize old state from database in a NEW transaction
     * This is called AFTER the main transaction commits, so it doesn't interfere with Hibernate
     * DEPRECATED: Use reloadAndSerializeOldStateFromDatabaseSafe instead
     */
    @Deprecated
    private String reloadAndSerializeOldStateFromDatabaseInNewTransaction(String entityClassName, Long recordId) {
        try {
            // Use AuditLogService which has REQUIRES_NEW transaction to reload safely
            EntityManager entityManager = ContextUtils.getBean(EntityManager.class);
            if (entityManager == null) {
                log.warn("EntityManager not available");
                return null;
            }

            ObjectMapper mapper = ContextUtils.getObjectMapper();
            
            // Use native query to get raw data from database
            if ("Role".equals(entityClassName)) {
                @SuppressWarnings("unchecked")
                List<Object[]> results = entityManager.createNativeQuery(
                    "SELECT id, name, description, is_deleted FROM roles WHERE id = ? AND is_deleted = 0")
                    .setParameter(1, recordId.intValue())
                    .getResultList();
                
                if (results.isEmpty()) {
                    log.warn("Role not found in database with ID: {}", recordId);
                    return null;
                }
                
                Object[] row = results.get(0);
                Map<String, Object> roleData = new HashMap<>();
                roleData.put("id", row[0]);
                roleData.put("name", row[1]);
                roleData.put("description", row[2]);
                roleData.put("isDeleted", ((Number) row[3]).byteValue() == 1);
                
                // Load permissions
                @SuppressWarnings("unchecked")
                List<Object[]> permResults = entityManager.createNativeQuery(
                    "SELECT p.id, p.module, p.action, p.resource " +
                    "FROM role_permissions rp " +
                    "JOIN permissions p ON rp.permission_id = p.id " +
                    "WHERE rp.role_id = ? " +
                    "ORDER BY p.id")
                    .setParameter(1, recordId.intValue())
                    .getResultList();
                
                List<Map<String, Object>> permissions = new ArrayList<>();
                for (Object[] permRow : permResults) {
                    Map<String, Object> permData = new HashMap<>();
                    permData.put("id", permRow[0]);
                    permData.put("module", permRow[1]);
                    permData.put("action", permRow[2]);
                    permData.put("resource", permRow[3]);
                    permissions.add(permData);
                }
                roleData.put("permissions", permissions);
                
                return mapper.writeValueAsString(roleData);
            }
            // Similar for other entity types...
            
            log.warn("Unsupported entity type: {}", entityClassName);
            return null;
        } catch (Exception e) {
            log.error("Error reloading entity from database in new transaction: {}", entityClassName, e);
            return null;
        }
    }
    
    /**
     * Serialize old entity state directly from database using native query
     * This bypasses Hibernate's persistence context and avoids entity creation issues
     * Returns serialized JSON string directly, not an entity object
     * DEPRECATED: Use reloadAndSerializeOldStateFromDatabaseInNewTransaction instead
     */
    @Deprecated
    private String reloadAndSerializeOldStateFromDatabase(Object entity) {
        try {
            EntityManager entityManager = ContextUtils.getBean(EntityManager.class);
            if (entityManager == null) {
                log.warn("EntityManager not available, cannot reload entity");
                return null;
            }

            Long recordId = getRecordIdUsingReflection(entity);
            if (recordId == null) {
                log.warn("Cannot reload entity: recordId is null");
                return null;
            }

            Class<?> entityClass = entity.getClass();
            ObjectMapper mapper = ContextUtils.getObjectMapper();
            
            // Use native query to get raw data from database and serialize directly to JSON
            // This avoids creating entity objects that could conflict with Hibernate
            if (entity instanceof Role) {
                // Get Role basic fields
                @SuppressWarnings("unchecked")
                List<Object[]> results = entityManager.createNativeQuery(
                    "SELECT id, name, description, is_deleted FROM roles WHERE id = ? AND is_deleted = 0")
                    .setParameter(1, recordId.intValue())
                    .getResultList();
                
                if (results.isEmpty()) {
                    log.warn("Role not found in database with ID: {}", recordId);
                    return null;
                }
                
                Object[] row = results.get(0);
                Map<String, Object> roleData = new HashMap<>();
                roleData.put("id", row[0]);
                roleData.put("name", row[1]);
                roleData.put("description", row[2]);
                roleData.put("isDeleted", ((Number) row[3]).byteValue() == 1);
                
                // Load permissions separately and add as list of maps (not entity objects)
                @SuppressWarnings("unchecked")
                List<Object[]> permResults = entityManager.createNativeQuery(
                    "SELECT p.id, p.module, p.action, p.resource " +
                    "FROM role_permissions rp " +
                    "JOIN permissions p ON rp.permission_id = p.id " +
                    "WHERE rp.role_id = ? " +
                    "ORDER BY p.id")
                    .setParameter(1, recordId.intValue())
                    .getResultList();
                
                List<Map<String, Object>> permissions = new ArrayList<>();
                for (Object[] permRow : permResults) {
                    Map<String, Object> permData = new HashMap<>();
                    permData.put("id", permRow[0]);
                    permData.put("module", permRow[1]);
                    permData.put("action", permRow[2]);
                    permData.put("resource", permRow[3]);
                    permissions.add(permData);
                }
                roleData.put("permissions", permissions);
                
                String json = mapper.writeValueAsString(roleData);
                log.debug("Successfully reloaded and serialized Role from database: ID: {}, Permissions: {}", 
                    recordId, permissions.size());
                return json;
                
            } else if (entity instanceof Employee) {
                @SuppressWarnings("unchecked")
                List<Object[]> results = entityManager.createNativeQuery(
                    "SELECT id, email, full_name, is_active, created_at, updated_at FROM employees WHERE id = ?")
                    .setParameter(1, recordId)
                    .getResultList();
                
                if (results.isEmpty()) {
                    return null;
                }
                
                Object[] row = results.get(0);
                Map<String, Object> empData = new HashMap<>();
                empData.put("id", ((Number) row[0]).longValue());
                empData.put("email", row[1]);
                empData.put("fullName", row[2]);
                empData.put("isActive", ((Number) row[3]).byteValue() == 1);
                empData.put("createdAt", row[4] != null ? ((java.sql.Timestamp) row[4]).toLocalDateTime().toString() : null);
                empData.put("updatedAt", row[5] != null ? ((java.sql.Timestamp) row[5]).toLocalDateTime().toString() : null);
                
                return mapper.writeValueAsString(empData);
                    
            } else if (entity instanceof Order) {
                @SuppressWarnings("unchecked")
                List<Object[]> results = entityManager.createNativeQuery(
                    "SELECT order_id, customer_id, employee_id, create_datetime, end_datetime, " +
                    "note, total_amount, status, is_paid FROM orders WHERE order_id = ?")
                    .setParameter(1, recordId.intValue())
                    .getResultList();
                
                if (results.isEmpty()) {
                    return null;
                }
                
                Object[] row = results.get(0);
                Map<String, Object> orderData = new HashMap<>();
                orderData.put("orderId", ((Number) row[0]).intValue());
                orderData.put("customerId", row[1] != null ? ((Number) row[1]).longValue() : null);
                orderData.put("employeeId", row[2] != null ? ((Number) row[2]).longValue() : null);
                orderData.put("createDatetime", row[3] != null ? ((java.sql.Timestamp) row[3]).toLocalDateTime().toString() : null);
                orderData.put("endDatetime", row[4] != null ? ((java.sql.Timestamp) row[4]).toLocalDateTime().toString() : null);
                orderData.put("note", row[5]);
                orderData.put("totalAmount", row[6] != null ? row[6].toString() : null);
                orderData.put("status", row[7] != null ? row[7].toString() : null);
                orderData.put("isPaid", row[8] != null && ((Number) row[8]).byteValue() == 1);
                
                return mapper.writeValueAsString(orderData);
                
            } else if (entity instanceof Product) {
                @SuppressWarnings("unchecked")
                List<Object[]> results = entityManager.createNativeQuery(
                    "SELECT product_id, product_name, picture, battery, scan_frequency, screen_size, " +
                    "screen_resolution, screen_tech, chipset, rear_camera, front_camera, warranty_period, " +
                    "stock_quantity, status, origin_id, brand_id, category_id, operating_system_id, warehouse_area_id " +
                    "FROM products WHERE product_id = ?")
                    .setParameter(1, recordId)
                    .getResultList();
                
                if (results.isEmpty()) {
                    return null;
                }
                
                Object[] row = results.get(0);
                Map<String, Object> productData = new HashMap<>();
                productData.put("idProduct", ((Number) row[0]).longValue());
                productData.put("nameProduct", row[1]);
                productData.put("image", row[2]);
                productData.put("battery", row[3]);
                productData.put("scanFrequency", row[4]);
                productData.put("screenSize", row[5]);
                productData.put("screenResolution", row[6]);
                productData.put("screenTech", row[7]);
                productData.put("chipset", row[8]);
                productData.put("rearCamera", row[9]);
                productData.put("frontCamera", row[10]);
                productData.put("warrantyPeriod", row[11] != null ? ((Number) row[11]).intValue() : null);
                productData.put("stockQuantity", row[12] != null ? ((Number) row[12]).intValue() : null);
                productData.put("status", row[13] != null && ((Number) row[13]).byteValue() == 1);
                productData.put("originId", row[14] != null ? ((Number) row[14]).longValue() : null);
                productData.put("brandId", row[15] != null ? ((Number) row[15]).longValue() : null);
                productData.put("categoryId", row[16] != null ? ((Number) row[16]).longValue() : null);
                productData.put("operatingSystemId", row[17] != null ? ((Number) row[17]).longValue() : null);
                productData.put("warehouseAreaId", row[18] != null ? ((Number) row[18]).longValue() : null);
                
                return mapper.writeValueAsString(productData);
                
            } else if (entity instanceof Customer) {
                @SuppressWarnings("unchecked")
                List<Object[]> results = entityManager.createNativeQuery(
                    "SELECT customer_id, full_name, phone_number, email, gender, birth_date, address, " +
                    "create_at, update_at FROM customers WHERE customer_id = ?")
                    .setParameter(1, recordId)
                    .getResultList();
                
                if (results.isEmpty()) {
                    return null;
                }
                
                Object[] row = results.get(0);
                Map<String, Object> customerData = new HashMap<>();
                customerData.put("customerId", ((Number) row[0]).longValue());
                customerData.put("fullName", row[1]);
                customerData.put("phoneNumber", row[2]);
                customerData.put("email", row[3]);
                customerData.put("gender", row[4] != null && ((Number) row[4]).byteValue() == 1);
                customerData.put("birthDate", row[5] != null ? ((java.sql.Date) row[5]).toLocalDate().toString() : null);
                customerData.put("address", row[6]);
                customerData.put("createAt", row[7] != null ? ((java.sql.Timestamp) row[7]).toLocalDateTime().toString() : null);
                customerData.put("updateAt", row[8] != null ? ((java.sql.Timestamp) row[8]).toLocalDateTime().toString() : null);
                
                return mapper.writeValueAsString(customerData);
            }

            log.warn("Unsupported entity type for native query reload: {}", entityClass.getSimpleName());
            return null;
        } catch (Exception e) {
            log.error("Error reloading entity from database using native query: {}", entity.getClass().getSimpleName(), e);
            return null;
        }
    }

    /**
     * Save old entity state before update for comparison
     * Uses composite key "EntityClassName:recordId" to avoid conflicts
     * Can accept either an entity object or a JSON string
     */
    private void saveOldEntityState(Object entity) {
        try {
            String oldState;
            // If entity is already a String (JSON), use it directly
            if (entity instanceof String) {
                oldState = (String) entity;
            } else {
                // Otherwise serialize the entity
                oldState = serializeObject(entity);
            }
            
            Long recordId = getRecordIdUsingReflection(entity instanceof String ? null : entity);
            if (recordId == null && entity instanceof String) {
                // If we have JSON but no entity, try to extract ID from JSON
                try {
                    ObjectMapper mapper = ContextUtils.getObjectMapper();
                    Map<String, Object> data = mapper.readValue((String) entity, Map.class);
                    Object id = data.get("id") != null ? data.get("id") : 
                                data.get("orderId") != null ? data.get("orderId") :
                                data.get("customerId") != null ? data.get("customerId") :
                                data.get("idProduct") != null ? data.get("idProduct") : null;
                    if (id != null) {
                        recordId = id instanceof Number ? ((Number) id).longValue() : null;
                    }
                } catch (Exception e) {
                    log.warn("Could not extract ID from JSON string", e);
                }
            }
            
            if (recordId != null) {
                // Get entity class name from current entity being updated (passed separately)
                String entityClassName = entity instanceof String ? "Unknown" : entity.getClass().getSimpleName();
                String key = entityClassName + ":" + recordId;
                
                Map<String, String> stateMap = oldEntityState.get();
                if (stateMap == null) {
                    stateMap = new HashMap<>();
                    oldEntityState.set(stateMap);
                }
                stateMap.put(key, oldState);
                log.debug("Saved old state for entity: {} with ID: {}", entityClassName, recordId);
            }
        } catch (Exception e) {
            log.error("Error saving old entity state", e);
        }
    }
    
    /**
     * Save old entity state from JSON string (from native query)
     */
    private void saveOldEntityStateFromJson(String oldStateJson, String entityClassName, Long recordId) {
        try {
            if (oldStateJson != null && recordId != null) {
                String key = entityClassName + ":" + recordId;
                
                Map<String, String> stateMap = oldEntityState.get();
                if (stateMap == null) {
                    stateMap = new HashMap<>();
                    oldEntityState.set(stateMap);
                }
                stateMap.put(key, oldStateJson);
                log.debug("Saved old state (from JSON) for entity: {} with ID: {}", entityClassName, recordId);
            }
        } catch (Exception e) {
            log.error("Error saving old entity state from JSON", e);
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
                                // For UPDATE, get old state from ThreadLocal (saved in preUpdate)
                                // Then create diff with old and new states
                                changes = createUpdateDiff(entityRef, recordId, entityClassName);
                                log.debug("Created update diff for entity: {} with ID: {}", entityClassName, recordId);
                            } else if ("DELETE".equals(action)) {
                                // For DELETE, only save old state (entity is being deleted)
                                Map<String, String> oldStateMap = oldEntityState.get();
                                String key = entityClassName + ":" + recordId;
                                String oldStateJson = null;
                                if (oldStateMap != null) {
                                    oldStateJson = oldStateMap.get(key);
                                }
                                if (oldStateJson != null) {
                                    changes = oldStateJson;
                                } else {
                                    // Fallback: try to serialize current entity
                                    changes = serializeObject(entityRef);
                                }
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
                            // Clean up old state and snapshot after processing
                            try {
                                Map<String, String> stateMap = oldEntityState.get();
                                if (stateMap != null) {
                                    String key = entityClassName + ":" + recordId;
                                    stateMap.remove(key);
                                    // Only remove ThreadLocal if map is empty
                                    if (stateMap.isEmpty()) {
                                        oldEntityState.remove();
                                    }
                                } else {
                                    oldEntityState.remove();
                                }
                                
                                // Also cleanup snapshot after using it
                                Map<String, String> snapshots = entitySnapshots.get();
                                if (snapshots != null) {
                                    String key = entityClassName + ":" + recordId;
                                    snapshots.remove(key);
                                    // Update snapshot with new state for next update cycle
                                    String newStateJson = serializeObject(entityRef);
                                    snapshots.put(key, newStateJson);
                                    
                                    if (snapshots.isEmpty()) {
                                        entitySnapshots.remove();
                                    }
                                }
                            } catch (Exception cleanupEx) {
                                log.error("Error cleaning up ThreadLocal", cleanupEx);
                                // Force cleanup on error
                                oldEntityState.remove();
                                entitySnapshots.remove();
                            }
                        }
                    }
                });
            }
            else {
                log.debug("No active transaction, creating audit log immediately");
                
                final Long employeeId = getCurrentEmployeeId();
                if (employeeId == null) {
                    log.warn("Cannot create audit log: employeeId is null for action {} on entity {}", action, entity.getClass().getSimpleName());
                    return;
                }
                
                final Long recordId = getRecordIdUsingReflection(entity);
                if (recordId == null) {
                    log.warn("Cannot create audit log: recordId is null for action {} on entity {}", action, entity.getClass().getSimpleName());
                    return;
                }
                
                String entityClassName = entity.getClass().getSimpleName();
                String changes;
                if ("UPDATE".equals(action)) {
                    // For UPDATE, create diff object with old and new values
                    changes = createUpdateDiff(entity, recordId, entityClassName);
                } else if ("DELETE".equals(action)) {
                    // For DELETE, only save old state (entity is being deleted)
                    Map<String, String> oldStateMap = oldEntityState.get();
                    String key = entityClassName + ":" + recordId;
                    String oldStateJson = null;
                    if (oldStateMap != null) {
                        oldStateJson = oldStateMap.get(key);
                    }
                    if (oldStateJson != null) {
                        changes = oldStateJson;
                    } else {
                        // Fallback: try to serialize current entity
                        changes = serializeObject(entity);
                    }
                } else {
                    // For CREATE, just serialize the new entity
                    changes = serializeObject(entity);
                }
                
                AuditLog auditLog = AuditLog.builder()
                        .employeeId(employeeId)
                        .action(action)
                        .tableName(entity.getClass().getSimpleName())
                        .recordId(recordId)
                        .changes(changes)
                        .ipAddress(ContextUtils.getIpAddress())
                        .userAgent(ContextUtils.getUserAgent())
                        .build();
                
                if (auditLog != null) {
                    ContextUtils.getAuditLogService().saveAuditLog(auditLog);
                    log.debug("Audit log saved successfully");
                }
                
                // Clean up old state after processing
                if ("UPDATE".equals(action) || "DELETE".equals(action)) {
                    try {
                        Map<String, String> stateMap = oldEntityState.get();
                        if (stateMap != null) {
                            String key = entity.getClass().getSimpleName() + ":" + recordId;
                            stateMap.remove(key);
                            // Only remove ThreadLocal if map is empty
                            if (stateMap.isEmpty()) {
                                oldEntityState.remove();
                            }
                        } else {
                            oldEntityState.remove();
                        }
                    } catch (Exception cleanupEx) {
                        log.error("Error cleaning up ThreadLocal", cleanupEx);
                        // Force cleanup on error
                        oldEntityState.remove();
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error in scheduleAuditLogCreation", e);
            // Ensure cleanup even on error
            try {
                oldEntityState.remove();
            } catch (Exception cleanupEx) {
                log.error("Error cleaning up ThreadLocal on exception", cleanupEx);
            }
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

            // Try to find id field - handle different naming conventions
            Field[] fields = entityClass.getDeclaredFields();
            for (Field field : fields) {
                String fieldName = field.getName();
                // Check for common ID field names
                if (fieldName.equals("id") || fieldName.equals("idProduct") 
                        || fieldName.equals("orderId") || fieldName.equals("customerId")) {
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
            if (entity instanceof Product) {
                Long id = ((Product) entity).getIdProduct();
                return id != null ? id : null;
            }
            if (entity instanceof Order) {
                Integer id = ((Order) entity).getOrderId();
                return id != null ? id.longValue() : null;
            }
            if (entity instanceof Customer) {
                Long id = ((Customer) entity).getCustomerId();
                return id != null ? id : null;
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
    private String createUpdateDiff(Object newEntity, Long recordId, String entityClassName) {
        try {
            Map<String, Object> diff = new HashMap<>();
            
            // Get old state from ThreadLocal using composite key
            Map<String, String> oldStateMap = oldEntityState.get();
            String key = entityClassName + ":" + recordId;
            String oldStateJson = null;
            if (oldStateMap != null) {
                oldStateJson = oldStateMap.get(key);
            }
            
            if (oldStateJson == null) {
                log.warn("Old state not found for entity: {} with ID: {}, using new state only", entityClassName, recordId);
                // Fallback: create diff with empty old state
                String newStateJson = serializeObject(newEntity);
                ObjectMapper mapper = ContextUtils.getObjectMapper();
                Map<String, Object> newState = mapper.readValue(newStateJson, Map.class);
                diff.put("old", new HashMap<>());
                diff.put("new", newState);
                diff.put("changes", newState);
                return mapper.writeValueAsString(diff);
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
            
            for (String fieldKey : allKeys) {
                Object oldValue = oldState.get(fieldKey);
                Object newValue = newState.get(fieldKey);
                
                if (!Objects.equals(oldValue, newValue)) {
                    Map<String, Object> change = new HashMap<>();
                    change.put("old", oldValue);
                    change.put("new", newValue);
                    changes.put(fieldKey, change);
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