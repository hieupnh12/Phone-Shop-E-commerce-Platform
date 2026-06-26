package com.websales.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendSupportMessageRequest {
    @NotBlank
    String content;
}
