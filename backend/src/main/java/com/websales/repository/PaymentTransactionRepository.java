package com.websales.repository;

import com.websales.entity.PaymentTransaction;
import com.websales.enums.PaymentStatus;
import com.websales.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, String> {
    Optional<PaymentTransaction> findByTransactionCode(String transactionCode);
    
    List<PaymentTransaction> findByOrderId(Integer orderId);
    
    List<PaymentTransaction> findByPaymentStatus(PaymentStatus paymentStatus);
    
    List<PaymentTransaction> findByTransactionType(TransactionType transactionType);
    
    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.paymentTime BETWEEN :startDate AND :endDate")
    List<PaymentTransaction> findByPaymentTimeBetween(@Param("startDate") LocalDateTime startDate, 
                                                       @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.orderId = :orderId ORDER BY pt.paymentTime DESC")
    List<PaymentTransaction> findByOrderIdOrderByPaymentTimeDesc(@Param("orderId") Integer orderId);
    
    Page<PaymentTransaction> findByPaymentStatus(PaymentStatus paymentStatus, Pageable pageable);
    
    Page<PaymentTransaction> findByOrderId(Integer orderId, Pageable pageable);
}

