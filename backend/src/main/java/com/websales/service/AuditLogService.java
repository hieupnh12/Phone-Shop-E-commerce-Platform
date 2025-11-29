package com.websales.service;

import com.websales.dto.response.AuditLogResponse;
import com.websales.entity.AuditLog;
import com.websales.mapper.AuditLogMapper;
import com.websales.repository.AuditLogRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepo auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    public Page<AuditLogResponse> getAllLogs(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<AuditLog> logPage;

        if (search != null && !search.trim().isEmpty()) {
            logPage = auditLogRepository.findBySearchTerm(search, pageable);
        } else {
            logPage = auditLogRepository.findAll(pageable);
        }

        return logPage.map(auditLogMapper::toResponse);
    }
}