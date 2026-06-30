package com.websales.controller;

import com.websales.dto.request.CreateSupportConversationRequest;
import com.websales.dto.request.SendSupportMessageRequest;
import com.websales.dto.request.UpdateSupportConversationRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.SupportConversationResponse;
import com.websales.dto.response.SupportMessageResponse;
import com.websales.enums.MessageSenderType;
import com.websales.handler.ContextUtils;
import com.websales.service.SupportConversationService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/support-conversations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SupportConversationController {

    SupportConversationService supportConversationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<SupportConversationResponse> createConversation(
            @RequestBody @Valid CreateSupportConversationRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        Long customerId = Long.valueOf(jwt.getSubject());
        return ApiResponse.<SupportConversationResponse>builder()
                .result(supportConversationService.createConversation(request, customerId))
                .message("Đã gửi tin nhắn hỗ trợ thành công")
                .build();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<SupportConversationResponse>> getMyConversations(@AuthenticationPrincipal Jwt jwt) {
        Long customerId = Long.valueOf(jwt.getSubject());
        return ApiResponse.<List<SupportConversationResponse>>builder()
                .result(supportConversationService.getConversationsByCustomer(customerId))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_MESSAGE_VIEW_ALL') or hasAuthority('SCOPE_MESSAGE_REPLY_BASIC')")
    public ApiResponse<Page<SupportConversationResponse>> getConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal Jwt jwt) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        boolean canViewAll = hasScope(jwt, "MESSAGE_VIEW_ALL");

        Page<SupportConversationResponse> result;
        if (canViewAll) {
            result = supportConversationService.getAllConversations(pageable);
        } else {
            Long employeeId = ContextUtils.getEmployeeId();
            if (employeeId == null) {
                return ApiResponse.<Page<SupportConversationResponse>>builder()
                        .code(403)
                        .message("Chỉ nhân viên mới có thể xem tin nhắn")
                        .build();
            }
            result = supportConversationService.getConversationsForEmployee(employeeId, pageable);
        }

        return ApiResponse.<Page<SupportConversationResponse>>builder().result(result).build();
    }

    @GetMapping("/{conversationId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<SupportConversationResponse> getConversationDetail(
            @PathVariable Integer conversationId,
            @AuthenticationPrincipal Jwt jwt) {

        SupportConversationResponse detail = supportConversationService.getConversationDetail(conversationId, true);
        if (!canAccessConversation(detail, jwt)) {
            return ApiResponse.<SupportConversationResponse>builder()
                    .code(403)
                    .message("Bạn không có quyền xem cuộc hội thoại này")
                    .build();
        }

        MessageSenderType readerType = isEmployee(jwt) ? MessageSenderType.EMPLOYEE : MessageSenderType.CUSTOMER;
        supportConversationService.markMessagesAsRead(conversationId, readerType);
        detail = supportConversationService.getConversationDetail(conversationId, true);

        return ApiResponse.<SupportConversationResponse>builder().result(detail).build();
    }

    @PostMapping("/{conversationId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<SupportMessageResponse> sendMessage(
            @PathVariable Integer conversationId,
            @RequestBody @Valid SendSupportMessageRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        SupportConversationResponse detail = supportConversationService.getConversationDetail(conversationId, false);
        if (!canAccessConversation(detail, jwt)) {
            return ApiResponse.<SupportMessageResponse>builder()
                    .code(403)
                    .message("Bạn không có quyền gửi tin nhắn trong cuộc hội thoại này")
                    .build();
        }

        MessageSenderType senderType;
        Long senderId;
        if (isEmployee(jwt)) {
            senderType = MessageSenderType.EMPLOYEE;
            senderId = ContextUtils.getEmployeeId();
            if (senderId == null) {
                return ApiResponse.<SupportMessageResponse>builder()
                        .code(403)
                        .message("Không xác định được nhân viên")
                        .build();
            }
            if (detail.getEmployeeId() == null || !senderId.equals(detail.getEmployeeId())) {
                return ApiResponse.<SupportMessageResponse>builder()
                        .code(403)
                        .message("Bạn cần nhận xử lý cuộc hội thoại trước khi phản hồi")
                        .build();
            }
        } else {
            senderType = MessageSenderType.CUSTOMER;
            senderId = Long.valueOf(jwt.getSubject());
        }

        SupportMessageResponse message = supportConversationService.sendMessage(
                conversationId, request, senderType, senderId);
        return ApiResponse.<SupportMessageResponse>builder()
                .result(message)
                .message("Đã gửi tin nhắn")
                .build();
    }

    @PostMapping("/{conversationId}/claim")
    @PreAuthorize("hasAuthority('SCOPE_MESSAGE_REPLY_BASIC')")
    public ApiResponse<SupportConversationResponse> claimConversation(
            @PathVariable Integer conversationId,
            @AuthenticationPrincipal Jwt jwt) {

        Long employeeId = ContextUtils.getEmployeeId();
        if (employeeId == null) {
            return ApiResponse.<SupportConversationResponse>builder()
                    .code(403)
                    .message("Chỉ nhân viên mới có thể nhận xử lý")
                    .build();
        }

        SupportConversationResponse detail = supportConversationService.getConversationDetail(conversationId, false);
        if (!canAccessConversation(detail, jwt)) {
            return ApiResponse.<SupportConversationResponse>builder()
                    .code(403)
                    .message("Bạn không có quyền xem cuộc hội thoại này")
                    .build();
        }

        SupportConversationResponse claimed = supportConversationService.claimConversation(conversationId, employeeId);
        return ApiResponse.<SupportConversationResponse>builder()
                .result(claimed)
                .message("Đã nhận xử lý cuộc hội thoại")
                .build();
    }

    @PutMapping("/{conversationId}")
    @PreAuthorize("hasAuthority('SCOPE_MESSAGE_VIEW_ALL') or hasAuthority('SCOPE_MESSAGE_REPLY_BASIC')")
    public ApiResponse<SupportConversationResponse> updateConversation(
            @PathVariable Integer conversationId,
            @RequestBody UpdateSupportConversationRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        Long employeeId = null;
        try {
            employeeId = ContextUtils.getEmployeeId();
        } catch (Exception ignored) {
        }

        boolean canViewAll = hasScope(jwt, "MESSAGE_VIEW_ALL");
        if (request.getStatus() == com.websales.enums.SupportConversationStatus.CLOSED && !canViewAll) {
            SupportConversationResponse detail = supportConversationService.getConversationDetail(conversationId, false);
            if (detail.getEmployeeId() == null || !detail.getEmployeeId().equals(employeeId)) {
                return ApiResponse.<SupportConversationResponse>builder()
                        .code(403)
                        .message("Chỉ nhân viên đang xử lý mới có thể đóng cuộc hội thoại")
                        .build();
            }
        }

        SupportConversationResponse updated = supportConversationService.updateConversation(
                conversationId, request, employeeId, canViewAll);
        return ApiResponse.<SupportConversationResponse>builder()
                .result(updated)
                .message("Đã cập nhật cuộc hội thoại")
                .build();
    }

    private boolean canAccessConversation(SupportConversationResponse detail, Jwt jwt) {
        if (hasScope(jwt, "MESSAGE_VIEW_ALL")) {
            return true;
        }
        if (isEmployee(jwt)) {
            Long employeeId = ContextUtils.getEmployeeId();
            if (employeeId == null) {
                return false;
            }
            if (detail.getEmployeeId() == null && detail.getStatus() == com.websales.enums.SupportConversationStatus.OPEN) {
                return hasScope(jwt, "MESSAGE_REPLY_BASIC") || hasScope(jwt, "MESSAGE_VIEW_ALL");
            }
            return employeeId.equals(detail.getEmployeeId());
        }
        Long customerId = Long.valueOf(jwt.getSubject());
        return customerId.equals(detail.getCustomerId());
    }

    private boolean isEmployee(Jwt jwt) {
        return hasScope(jwt, "MESSAGE_VIEW_ALL")
                || hasScope(jwt, "MESSAGE_REPLY_BASIC")
                || getScopes(jwt).stream().anyMatch(s -> s.startsWith("ROLE_"));
    }

    private boolean hasScope(Jwt jwt, String scope) {
        return getScopes(jwt).contains(scope);
    }

    @SuppressWarnings("unchecked")
    private List<String> getScopes(Jwt jwt) {
        Object scopes = jwt.getClaims().get("scopes");
        if (scopes instanceof List<?> list) {
            return list.stream().map(Object::toString).toList();
        }
        return List.of();
    }
}
