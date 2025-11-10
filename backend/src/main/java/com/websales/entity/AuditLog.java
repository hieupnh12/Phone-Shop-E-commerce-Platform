package com.websales.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "audit_logs")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    Long employeeId;
    String action;
    String tableName;
    Long recordId;
    @Column(columnDefinition = "json")
    String changes;
    String ipAddress;
    String userAgent;
    @CreationTimestamp
    LocalDateTime createdAt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    Employee employee;


}
