package com.websales.dto.request;

import com.websales.enums.RequestType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReturnWarrantyRequestRequest {
    @NotNull(message = "Order ID is required")
    Integer orderId;

    @NotBlank(message = "Product version ID is required")
    String productVersionId;

    @NotNull(message = "Request type is required")
    RequestType type;

    String reason;

    LocalDateTime appointmentDate;
}

