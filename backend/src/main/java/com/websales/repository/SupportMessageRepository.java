package com.websales.repository;

import com.websales.entity.SupportMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {
    List<SupportMessage> findByConversation_ConversationIdOrderByCreatedAtAsc(Integer conversationId);

    long countByConversation_ConversationIdAndReadAtIsNullAndSenderType(
            Integer conversationId, com.websales.enums.MessageSenderType senderType);
}
