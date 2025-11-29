package com.websales.repository;

import com.websales.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepo extends JpaRepository<AuditLog, Long> {

    @Query(value = "SELECT * FROM audit_logs a WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.table_name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.ip_address) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.user_agent) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "CAST(a.employee_id AS CHAR) LIKE CONCAT('%', :search, '%') OR " +
           "CAST(a.record_id AS CHAR) LIKE CONCAT('%', :search, '%'))",
           nativeQuery = true,
           countQuery = "SELECT COUNT(*) FROM audit_logs a WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.table_name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.ip_address) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.user_agent) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "CAST(a.employee_id AS CHAR) LIKE CONCAT('%', :search, '%') OR " +
           "CAST(a.record_id AS CHAR) LIKE CONCAT('%', :search, '%'))")
    Page<AuditLog> findBySearchTerm(@Param("search") String search, Pageable pageable);
}
