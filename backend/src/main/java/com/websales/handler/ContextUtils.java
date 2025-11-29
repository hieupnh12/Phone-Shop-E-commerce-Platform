package com.websales.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.websales.repository.AuditLogRepo;
import com.websales.repository.EmployeeRepo;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Optional;

@Component
public class ContextUtils implements ApplicationContextAware {

    private static ApplicationContext applicationContext;

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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof JwtAuthenticationToken jwtToken) {
            try {
                String subject = jwtToken.getToken().getSubject();
                return Long.parseLong(subject);
            } catch (NumberFormatException | NullPointerException e) {
                return null;
            }
        }
        return null;
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
}
