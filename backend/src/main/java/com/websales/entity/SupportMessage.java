package com.websales.entity;

import com.websales.converter.MessageSenderTypeConverter;
import com.websales.enums.MessageSenderType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "support_messages")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SupportMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    Long messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    SupportConversation conversation;

    @Convert(converter = MessageSenderTypeConverter.class)
    @Column(name = "sender_type", nullable = false, length = 20)
    MessageSenderType senderType;

    @Column(name = "sender_id", nullable = false)
    Long senderId;

    @Column(nullable = false, columnDefinition = "TEXT")
    String content;

    @Column(name = "read_at")
    LocalDateTime readAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
}
