package com.websales.controller;

import com.websales.dto.request.ReturnWarrantyRequestRequest;
import com.websales.dto.request.UpdateWarrantyRequestStatusRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.ReturnWarrantyRequestResponse;
import com.websales.enums.RequestStatus;
import com.websales.handler.ContextUtils;
import com.websales.service.ReturnWarrantyRequestService;
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
@RequestMapping("/return-warranty-requests")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReturnWarrantyRequestController {
    ReturnWarrantyRequestService requestService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ReturnWarrantyRequestResponse> createRequest(
            @RequestBody @Valid ReturnWarrantyRequestRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        Long customerId = Long.valueOf(jwt.getSubject());
        ReturnWarrantyRequestResponse response = requestService.createRequest(request, customerId);
        return ApiResponse.<ReturnWarrantyRequestResponse>builder()
                .result(response)
                .message("Yêu cầu bảo hành/đổi trả đã được tạo thành công")
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_WARRANTY_VIEW_ALL') or hasAuthority('SCOPE_WARRANTY_UPDATE_BASIC')")
    public ApiResponse<Page<ReturnWarrantyRequestResponse>> getAllRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "requestId,desc") String sort,
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            // Check if user has WARRANTY_VIEW_ALL permission
            boolean hasViewAllPermission = jwt.getClaims().containsKey("scopes") && 
                jwt.getClaims().get("scopes") != null &&
                ((List<?>) jwt.getClaims().get("scopes")).stream()
                    .anyMatch(s -> s.toString().equals("WARRANTY_VIEW_ALL"));
            
            // Get employeeId if user is an employee
            Long employeeId = null;
            try {
                employeeId = ContextUtils.getEmployeeId();
            } catch (Exception e) {
                // If not employee, employeeId will be null
            }
            
            // If not employee and no WARRANTY_VIEW_ALL, return 403
            if (!hasViewAllPermission && employeeId == null) {
                return ApiResponse.<Page<ReturnWarrantyRequestResponse>>builder()
                        .code(403)
                        .message("Bạn không có quyền xem danh sách yêu cầu bảo hành")
                        .build();
            }
            
            String[] sortParts = sort.split(",");
            String sortField = sortParts[0].trim();
            Sort.Direction direction = sortParts.length > 1 && sortParts[1].trim().equalsIgnoreCase("asc")
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
            
            // Map sort field name - đảm bảo dùng đúng tên field trong entity
            // Nếu sort field là "createdAt" nhưng có vấn đề, thử dùng "requestId" thay thế
            if (sortField.equalsIgnoreCase("createdAt") || sortField.equalsIgnoreCase("created_at")) {
                sortField = "createdAt";
            } else if (sortField.equalsIgnoreCase("updatedAt") || sortField.equalsIgnoreCase("updated_at")) {
                sortField = "updatedAt";
            } else {
                // Mặc định sort theo requestId
                sortField = "requestId";
            }
            
            Sort sortObj = Sort.by(direction, sortField);
            Pageable pageable = PageRequest.of(page, size, sortObj);
            
            Page<ReturnWarrantyRequestResponse> requests;
            
            // If has WARRANTY_VIEW_ALL, show all requests
            if (hasViewAllPermission) {
                // Parse status từ string sang enum, chỉ khi status không null và không empty
                if (status != null && !status.trim().isEmpty()) {
                    try {
                        RequestStatus statusEnum = RequestStatus.valueOf(status.toUpperCase());
                        requests = requestService.getRequestsByStatus(statusEnum, pageable);
                        System.out.println("Found " + requests.getTotalElements() + " requests with status: " + statusEnum);
                    } catch (IllegalArgumentException e) {
                        // Nếu status không hợp lệ, trả về tất cả requests
                        System.out.println("Invalid status: " + status + ", returning all requests");
                        requests = requestService.getAllRequests(pageable);
                    }
                } else {
                    requests = requestService.getAllRequests(pageable);
                    System.out.println("Found " + requests.getTotalElements() + " total requests");
                }
            } else {
                // If no WARRANTY_VIEW_ALL but is employee, show only assigned requests
                if (employeeId == null) {
                    return ApiResponse.<Page<ReturnWarrantyRequestResponse>>builder()
                            .code(403)
                            .message("Bạn không có quyền xem danh sách yêu cầu bảo hành")
                            .build();
                }
                requests = requestService.getRequestsByEmployee(employeeId, pageable);
                System.out.println("Found " + requests.getTotalElements() + " requests assigned to employee: " + employeeId);
            }
            
            System.out.println("Returning page with " + requests.getContent().size() + " items, total: " + requests.getTotalElements());
            
            return ApiResponse.<Page<ReturnWarrantyRequestResponse>>builder()
                    .result(requests)
                    .build();
        } catch (IllegalArgumentException e) {
            // Xử lý riêng cho lỗi parse enum
            System.err.println("IllegalArgumentException in getAllRequests: " + e.getMessage());
            e.printStackTrace();
            // Nếu là lỗi parse enum, thử lại không có filter status
            try {
                Sort sortObj = Sort.by(Sort.Direction.DESC, "requestId");
                Pageable pageable = PageRequest.of(page, size, sortObj);
                Page<ReturnWarrantyRequestResponse> requests = requestService.getAllRequests(pageable);
                return ApiResponse.<Page<ReturnWarrantyRequestResponse>>builder()
                        .result(requests)
                        .message("Đã bỏ qua filter status không hợp lệ và trả về tất cả requests")
                        .build();
            } catch (Exception retryException) {
                return ApiResponse.<Page<ReturnWarrantyRequestResponse>>builder()
                        .code(400)
                        .message("Lỗi khi lấy danh sách yêu cầu bảo hành: " + e.getMessage())
                        .build();
            }
        } catch (Exception e) {
            // Log lỗi để debug
            System.err.println("Error in getAllRequests: " + e.getMessage());
            System.err.println("Error class: " + e.getClass().getName());
            e.printStackTrace();
            return ApiResponse.<Page<ReturnWarrantyRequestResponse>>builder()
                    .code(400)
                    .message("Lỗi khi lấy danh sách yêu cầu bảo hành: " + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<ReturnWarrantyRequestResponse>> getMyRequests(
            @AuthenticationPrincipal Jwt jwt) {
        Long customerId = Long.valueOf(jwt.getSubject());
        List<ReturnWarrantyRequestResponse> requests = requestService.getRequestsByCustomer(customerId);
        return ApiResponse.<List<ReturnWarrantyRequestResponse>>builder()
                .result(requests)
                .build();
    }

    @GetMapping("/my-assigned")
    public ApiResponse<Page<ReturnWarrantyRequestResponse>> getMyAssignedRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "requestId,desc") String sort) {
        try {
            Long employeeId = ContextUtils.getEmployeeId();
            if (employeeId == null) {
                return ApiResponse.<Page<ReturnWarrantyRequestResponse>>builder()
                        .code(403)
                        .message("Chỉ nhân viên mới có thể xem danh sách yêu cầu được giao")
                        .build();
            }

            String[] sortParts = sort.split(",");
            String sortField = sortParts[0].trim();
            Sort.Direction direction = sortParts.length > 1 && sortParts[1].trim().equalsIgnoreCase("asc")
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
            
            if (sortField.equalsIgnoreCase("createdAt") || sortField.equalsIgnoreCase("created_at")) {
                sortField = "createdAt";
            } else if (sortField.equalsIgnoreCase("updatedAt") || sortField.equalsIgnoreCase("updated_at")) {
                sortField = "updatedAt";
            } else {
                sortField = "requestId";
            }
            
            Sort sortObj = Sort.by(direction, sortField);
            Pageable pageable = PageRequest.of(page, size, sortObj);
            
            Page<ReturnWarrantyRequestResponse> requests = requestService.getRequestsByEmployee(employeeId, pageable);
            
            return ApiResponse.<Page<ReturnWarrantyRequestResponse>>builder()
                    .result(requests)
                    .build();
        } catch (Exception e) {
            System.err.println("Error in getMyAssignedRequests: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.<Page<ReturnWarrantyRequestResponse>>builder()
                    .code(400)
                    .message("Lỗi khi lấy danh sách yêu cầu được giao: " + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/{requestId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ReturnWarrantyRequestResponse> getRequestById(@PathVariable Integer requestId) {
        return requestService.getRequestById(requestId)
                .map(request -> ApiResponse.<ReturnWarrantyRequestResponse>builder()
                        .result(request)
                        .build())
                .orElse(ApiResponse.<ReturnWarrantyRequestResponse>builder()
                        .code(404)
                        .message("Request not found")
                        .build());
    }

    @PutMapping("/{requestId}/status")
    @PreAuthorize("hasAuthority('SCOPE_WARRANTY_UPDATE_BASIC')")
    public ApiResponse<ReturnWarrantyRequestResponse> updateRequestStatus(
            @PathVariable Integer requestId,
            @RequestBody @Valid UpdateWarrantyRequestStatusRequest updateRequest,
            @AuthenticationPrincipal Jwt jwt) {
        Long employeeId = null;
        try {
            employeeId = ContextUtils.getEmployeeId();
        } catch (Exception e) {
            // If not employee, employeeId will be null
        }
        
        ReturnWarrantyRequestResponse response = requestService.updateRequestStatus(
                requestId, updateRequest, employeeId);
        return ApiResponse.<ReturnWarrantyRequestResponse>builder()
                .result(response)
                .message("Trạng thái yêu cầu đã được cập nhật thành công")
                .build();
    }

    @PutMapping("/{requestId}/unassign")
    @PreAuthorize("hasAuthority('SCOPE_WARRANTY_UPDATE_BASIC')")
    public ApiResponse<ReturnWarrantyRequestResponse> unassignRequest(
            @PathVariable Integer requestId) {
        Long employeeId = null;
        try {
            employeeId = ContextUtils.getEmployeeId();
        } catch (Exception e) {
            return ApiResponse.<ReturnWarrantyRequestResponse>builder()
                    .code(403)
                    .message("Chỉ nhân viên mới có thể thực hiện thao tác này")
                    .build();
        }
        
        ReturnWarrantyRequestResponse response = requestService.unassignRequest(requestId, employeeId);
        return ApiResponse.<ReturnWarrantyRequestResponse>builder()
                .result(response)
                .message("Đã hủy xử lý yêu cầu thành công")
                .build();
    }
}

