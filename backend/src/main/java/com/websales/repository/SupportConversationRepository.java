package com.websales.repository;

import com.websales.entity.SupportConversation;
import com.websales.enums.SupportConversationStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SupportConversationRepository extends JpaRepository<SupportConversation, Integer> {
    Page<SupportConversation> findByEmployee_Id(Long employeeId, Pageable pageable);

    @Query("""
            SELECT c FROM SupportConversation c
            WHERE c.employee.id = :employeeId
               OR (c.employee IS NULL AND c.status = com.websales.enums.SupportConversationStatus.OPEN)
            """)
    Page<SupportConversation> findAssignedOrOpen(@Param("employeeId") Long employeeId, Pageable pageable);

    List<SupportConversation> findByCustomer_CustomerIdOrderByUpdatedAtDesc(Long customerId);

    Page<SupportConversation> findByStatus(SupportConversationStatus status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM SupportConversation c WHERE c.conversationId = :conversationId")
    Optional<SupportConversation> findByIdForUpdate(@Param("conversationId") Integer conversationId);
}
