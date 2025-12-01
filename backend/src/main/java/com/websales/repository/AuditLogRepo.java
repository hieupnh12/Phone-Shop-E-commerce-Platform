package com.websales.repository;

import com.websales.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepo extends JpaRepository<AuditLog, Long> {

    @EntityGraph(attributePaths = {"employee"})
    @Query(value = "SELECT a FROM AuditLog a WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.tableName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.ipAddress) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.userAgent) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "CAST(a.employeeId AS string) LIKE CONCAT('%', :search, '%') OR " +
           "CAST(a.recordId AS string) LIKE CONCAT('%', :search, '%'))")
    Page<AuditLog> findBySearchTerm(@Param("search") String search, Pageable pageable);
    
    @EntityGraph(attributePaths = {"employee"})
    @Override
    Page<AuditLog> findAll(Pageable pageable);
}
