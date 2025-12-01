package com.websales.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.websales.dto.response.AuditLogResponse;
import com.websales.entity.AuditLog;
import com.websales.mapper.AuditLogMapper;
import com.websales.repository.AuditLogRepo;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepo auditLogRepository;
    private final AuditLogMapper auditLogMapper;
    private final EntityManager entityManager;
    private final ObjectMapper objectMapper;

    public Page<AuditLogResponse> getAllLogs(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<AuditLog> logPage;

        if (search != null && !search.trim().isEmpty()) {
            logPage = auditLogRepository.findBySearchTerm(search, pageable);
        } else {
            logPage = auditLogRepository.findAll(pageable);
        }

        return logPage.map(auditLogMapper::toResponse);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveAuditLog(AuditLog log) {
        auditLogRepository.save(log);
    }


    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public String reloadOldStateFromDatabase(String entityClassName, Long recordId) {
        try {
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
                
                return objectMapper.writeValueAsString(roleData);
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
                
                return objectMapper.writeValueAsString(orderData);
            }
            // Add other entity types as needed
            
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void cleanOldData() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(10);
        int rows = auditLogRepository.deleteOld(threshold);
        System.out.println("Đã xóa " + rows + " dòng.");
    }
}