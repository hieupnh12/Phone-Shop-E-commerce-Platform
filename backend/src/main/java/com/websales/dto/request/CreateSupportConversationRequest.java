package com.websales.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateSupportConversationRequest {
    @NotBlank
    @Size(max = 255)
    String subject;

    @NotBlank
    String content;
}
