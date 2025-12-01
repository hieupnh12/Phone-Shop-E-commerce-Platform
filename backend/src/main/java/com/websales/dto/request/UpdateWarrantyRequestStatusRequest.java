package com.websales.dto.request;

import com.websales.enums.RequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateWarrantyRequestStatusRequest {
    @NotNull(message = "Status is required")
    RequestStatus status;

    String adminNote;

    LocalDateTime appointmentDate;
}

