package com.websales.entity;

import com.websales.converter.RequestStatusConverter;
import com.websales.converter.RequestTypeConverter;
import com.websales.enums.RequestStatus;
import com.websales.enums.RequestType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "return_warranty_requests")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReturnWarrantyRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    Integer requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = true)
    Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = true)
    Employee employee;

    @Column(name = "product_version_id", nullable = false, length = 255)
    String productVersionId;

    @Convert(converter = RequestTypeConverter.class)
    @Column(name = "type", nullable = false, length = 20)
    RequestType type;

    @Column(name = "reason", columnDefinition = "TEXT")
    String reason;

    @Convert(converter = RequestStatusConverter.class)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    RequestStatus status = RequestStatus.PENDING;

    @Column(name = "admin_note", columnDefinition = "TEXT")
    String adminNote;

    @Column(name = "appointment_date")
    LocalDateTime appointmentDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}

