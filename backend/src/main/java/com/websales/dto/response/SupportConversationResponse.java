package com.websales.dto.response;

import com.websales.enums.MessageSenderType;
import com.websales.enums.SupportConversationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SupportConversationResponse {
    Integer conversationId;
    Long customerId;
    String customerName;
    String customerEmail;
    String customerPhone;
    Long employeeId;
    String employeeName;
    String subject;
    SupportConversationStatus status;
    String lastMessage;
    LocalDateTime lastMessageAt;
    long unreadCount;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    List<SupportMessageResponse> messages;
}
