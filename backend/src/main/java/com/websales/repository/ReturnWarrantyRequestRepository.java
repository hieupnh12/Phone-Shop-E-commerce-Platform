package com.websales.repository;

import com.websales.entity.ReturnWarrantyRequest;
import com.websales.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReturnWarrantyRequestRepository extends JpaRepository<ReturnWarrantyRequest, Integer> {
    List<ReturnWarrantyRequest> findByCustomer_CustomerId(Long customerId);
    Page<ReturnWarrantyRequest> findByCustomer_CustomerId(Long customerId, Pageable pageable);
    Page<ReturnWarrantyRequest> findByStatus(RequestStatus status, Pageable pageable);
    List<ReturnWarrantyRequest> findByOrder_OrderId(Integer orderId);
    Page<ReturnWarrantyRequest> findByEmployee_Id(Long employeeId, Pageable pageable);
    
    // Filter by createdAt date range
    @Query("SELECT r FROM ReturnWarrantyRequest r WHERE " +
           "(:startDate IS NULL OR r.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR r.createdAt <= :endDate)")
    Page<ReturnWarrantyRequest> findByCreatedAtBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
    
    // Filter by status and createdAt date range
    @Query("SELECT r FROM ReturnWarrantyRequest r WHERE " +
           "r.status = :status AND " +
           "(:startDate IS NULL OR r.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR r.createdAt <= :endDate)")
    Page<ReturnWarrantyRequest> findByStatusAndCreatedAtBetween(
            @Param("status") RequestStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
}

