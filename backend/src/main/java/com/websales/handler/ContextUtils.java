package com.websales.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.websales.entity.Employee;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.repository.AuditLogRepo;
import com.websales.repository.EmployeeRepo;
import com.websales.service.AuditLogService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Optional;

@Slf4j
@Component
public class ContextUtils implements ApplicationContextAware {

    private static EmployeeRepo staticEmployeeRepo;

    private static ApplicationContext applicationContext;

    @Autowired
    public void setEmployeeRepo(EmployeeRepo employeeRepo) {
        ContextUtils.staticEmployeeRepo = employeeRepo;
    }

    @Override
    public void setApplicationContext(ApplicationContext context) {
        ContextUtils.applicationContext = context;
    }

    public static <T> T getBean(Class<T> beanClass) {
        if (applicationContext == null) return null;
        return applicationContext.getBean(beanClass);
    }

    public static AuditLogRepo getAuditLogRepository() {
        return getBean(AuditLogRepo.class);
    }

    public static ObjectMapper getObjectMapper() {
        return getBean(ObjectMapper.class);
    }

    public static Long getEmployeeId() {
        try {
        EmployeeRepo employeeRepo = getBean(EmployeeRepo.class);
        if (employeeRepo == null) {
            return null;
        }
        var context = SecurityContextHolder.getContext();
        if (context.getAuthentication() == null) {
            return null;
        }
        String name = context.getAuthentication().getName();
        Employee employee = employeeRepo.findByFullName(name).orElseThrow(
                () -> new AppException(ErrorCode.ACCOUNT_EXITED)
        );
        return employee.getId();
        } catch (Exception e) {
            log.warn("Cannot get employeeId for audit log: {}", e.getMessage());
            return null;
        }
    }

    private static Optional<HttpServletRequest> getCurrentHttpRequest() {
        try {
            ServletRequestAttributes sra = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            return Optional.of(sra.getRequest());
        } catch (IllegalStateException e) {
            return Optional.empty();
        }
    }

    public static String getIpAddress() {
        return getCurrentHttpRequest()
                .map(request -> request.getHeader("X-FORWARDED-FOR") != null ? request.getHeader("X-FORWARDED-FOR") : request.getRemoteAddr())
                .orElse("N/A");
    }

    public static String getUserAgent() {
        return getCurrentHttpRequest()
                .map(request -> request.getHeader("User-Agent"))
                .orElse("N/A");
    }

    public static AuditLogService getAuditLogService() {
        return getBean(AuditLogService.class);
    }
}
