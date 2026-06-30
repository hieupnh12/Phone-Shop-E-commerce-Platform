package com.websales.dto.response;

import com.websales.enums.MessageSenderType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SupportMessageResponse {
    Long messageId;
    Integer conversationId;
    MessageSenderType senderType;
    Long senderId;
    String senderName;
    String content;
    LocalDateTime readAt;
    LocalDateTime createdAt;
}
