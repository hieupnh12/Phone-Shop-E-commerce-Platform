package com.websales.repository;

import com.websales.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

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
    @Query(value = "SELECT a FROM AuditLog a " +
           "LEFT JOIN a.employee e " +
           "WHERE (:employeeId IS NULL OR a.employeeId = :employeeId) " +
           "AND (:employeeName IS NULL OR :employeeName = '' OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :employeeName, '%'))) " +
           "AND (:tableName IS NULL OR :tableName = '' OR LOWER(a.tableName) = LOWER(:tableName)) " +
           "AND (:startDate IS NULL OR a.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR a.createdAt <= :endDate)")
    Page<AuditLog> findByFilters(
            @Param("employeeId") Long employeeId,
            @Param("employeeName") String employeeName,
            @Param("tableName") String tableName,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
    
    @EntityGraph(attributePaths = {"employee"})
    @Override
    Page<AuditLog> findAll(Pageable pageable);

    @Modifying
    @Transactional
    @Query("DELETE FROM AuditLog a WHERE a.createdAt < :threshold")
    int deleteOld(@Param("threshold") LocalDateTime threshold);
}
