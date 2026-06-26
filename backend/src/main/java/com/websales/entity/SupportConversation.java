package com.websales.entity;

import com.websales.converter.SupportConversationStatusConverter;
import com.websales.enums.SupportConversationStatus;
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
@Table(name = "support_conversations")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SupportConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "conversation_id")
    Integer conversationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    Employee employee;

    @Column(nullable = false)
    String subject;

    @Convert(converter = SupportConversationStatusConverter.class)
    @Column(nullable = false, length = 20)
    @Builder.Default
    SupportConversationStatus status = SupportConversationStatus.OPEN;

    @Column(name = "last_message", columnDefinition = "TEXT")
    String lastMessage;

    @Column(name = "last_message_at")
    LocalDateTime lastMessageAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}
