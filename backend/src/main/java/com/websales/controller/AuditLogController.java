package com.websales.controller;

import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.AuditLogResponse;
import com.websales.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
            @RequestParam(required = false) String search
    ) {
        return ApiResponse.<Page<AuditLogResponse>>builder()
                .result(auditLogService.getAllLogs(page, size, search))
                .build();
    }
}
