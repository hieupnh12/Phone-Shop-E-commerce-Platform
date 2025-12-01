package com.websales.repository;

import com.websales.entity.ReturnWarrantyRequest;
import com.websales.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnWarrantyRequestRepository extends JpaRepository<ReturnWarrantyRequest, Integer> {
    List<ReturnWarrantyRequest> findByCustomer_CustomerId(Long customerId);
    Page<ReturnWarrantyRequest> findByCustomer_CustomerId(Long customerId, Pageable pageable);
    Page<ReturnWarrantyRequest> findByStatus(RequestStatus status, Pageable pageable);
    List<ReturnWarrantyRequest> findByOrder_OrderId(Integer orderId);
}

