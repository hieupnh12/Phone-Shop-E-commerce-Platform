package com.websales.dto.response;

import com.websales.enums.RequestStatus;
import com.websales.enums.RequestType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReturnWarrantyRequestResponse {
    Integer requestId;
    Integer orderId;
    Long customerId;
    String customerName;
    Long employeeId;
    String employeeName;
    String productVersionId;
    String productName;
    RequestType type;
    String reason;
    RequestStatus status;
    String adminNote;
    LocalDateTime appointmentDate;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}

