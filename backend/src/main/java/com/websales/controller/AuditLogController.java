package com.websales.controller;

import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.AuditLogResponse;
import com.websales.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/audit-log")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_SYSTEM_VIEW_AUDIT')")
    public ApiResponse<Page<AuditLogResponse>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String employeeName,
            @RequestParam(required = false) String tableName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        // Nếu có filter params cụ thể, sử dụng method mới
        if (employeeId != null || 
            (employeeName != null && !employeeName.trim().isEmpty()) ||
            (tableName != null && !tableName.trim().isEmpty()) ||
            startDate != null || endDate != null) {
            return ApiResponse.<Page<AuditLogResponse>>builder()
                    .result(auditLogService.getAllLogsWithFilters(
                            page, size, employeeId, employeeName, tableName, startDate, endDate))
                    .build();
        }
        
        // Nếu không có filter cụ thể, sử dụng search chung như cũ
        return ApiResponse.<Page<AuditLogResponse>>builder()
                .result(auditLogService.getAllLogs(page, size, search))
                .build();
    }
}
