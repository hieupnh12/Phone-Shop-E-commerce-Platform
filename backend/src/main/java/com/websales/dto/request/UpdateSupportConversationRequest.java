package com.websales.dto.request;

import com.websales.enums.SupportConversationStatus;
import lombok.Data;

@Data
public class UpdateSupportConversationRequest {
    SupportConversationStatus status;
    Long employeeId;
}
