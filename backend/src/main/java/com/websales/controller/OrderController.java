package com.websales.controller;

import com.websales.dto.request.OrderRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.OrderResponse;
import com.websales.entity.Employee;
import com.websales.entity.Order;
import com.websales.enums.OrderStatus;
import com.websales.exception.AppException;
import com.websales.handler.ContextUtils;
import com.websales.mapper.OrderMapper;
import com.websales.repository.EmployeeRepo;
import com.websales.service.OrderService;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {
    OrderService orderService;
    OrderMapper orderMapper;
    EmployeeRepo employeeRepo;

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_ORDER_VIEW_ALL') or hasAuthority('SCOPE_ORDER_VIEW_DETAIL') or hasAuthority('SCOPE_ORDER_CREATE_ALL')")
    public ApiResponse<Page<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createDatetime,desc") String sort,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String[] sortParts = sort.split(",");
        String sortField = sortParts[0].trim();
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].trim().equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        
        Sort sortObj = Sort.by(direction, sortField);
        Pageable pageable = PageRequest.of(page, size, sortObj);
        
        boolean isEmployee = jwt.getClaims().containsKey("scopes") &&
            jwt.getClaims().get("scopes") != null &&
            ((List<?>) jwt.getClaims().get("scopes")).stream()
                .anyMatch(s -> s.toString().startsWith("ROLE_"));
        
        if (!isEmployee) {
            return ApiResponse.<Page<OrderResponse>>builder()
                    .code(403)
                    .message("Chỉ nhân viên mới có thể truy cập endpoint này")
                    .build();
        }
        
        List<?> scopes = jwt.getClaims().containsKey("scopes") && jwt.getClaims().get("scopes") != null
            ? (List<?>) jwt.getClaims().get("scopes")
            : new ArrayList<>();
        
        boolean hasViewAllPermission = scopes.stream()
                .anyMatch(s -> s.toString().equals("ORDER_VIEW_ALL"));
        
        Page<Order> ordersPage;
        
        if (hasViewAllPermission) {
            ordersPage = orderService.getAllOrders(pageable);
        } else {
            try {
                String fullName = jwt.getSubject();
                if (fullName == null || fullName.trim().isEmpty()) {
                    return ApiResponse.<Page<OrderResponse>>builder()
                            .code(403)
                            .message("Không thể xác định nhân viên từ token. Vui lòng đăng nhập lại.")
                            .build();
                }
                
                var context = SecurityContextHolder.getContext();
                String  name = context.getAuthentication().getName();

                Optional<Employee> employeeOpt = employeeRepo.findByFullName(name);
                
                if (employeeOpt.isEmpty()) {
                    return ApiResponse.<Page<OrderResponse>>builder()
                            .code(403)
                            .message("Không tìm thấy thông tin nhân viên với tên: " + fullName + ". Vui lòng liên hệ quản trị viên.")
                            .build();
                }
                
                Long employeeId = employeeOpt.get().getId();
                ordersPage = orderService.getOrdersByEmployee(employeeId, pageable);
            } catch (AppException e) {
                // Nếu là AppException, trả về message từ exception
                return ApiResponse.<Page<OrderResponse>>builder()
                        .code(403)
                        .message(e.getMessage() != null ? e.getMessage() : "Không thể xác định nhân viên.")
                        .build();
            } catch (Exception e) {
                // Log lỗi để debug
                System.err.println("Error getting employeeId: " + e.getMessage());
                e.printStackTrace();
                return ApiResponse.<Page<OrderResponse>>builder()
                        .code(500)
                        .message("Lỗi hệ thống khi xác định nhân viên: " + e.getMessage())
                        .build();
            }
        }
        
        Page<OrderResponse> responsePage = ordersPage.map(orderMapper::toOrderResponse);
        
        return ApiResponse.<Page<OrderResponse>>builder()
                .result(responsePage)
                .build();
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAuthority('SCOPE_ORDER_VIEW_DETAIL') or hasAuthority('SCOPE_ORDER_VIEW_ALL')")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable Integer orderId) {
        Optional<Order> orderOpt = orderService.getOrderById(orderId);
        if (orderOpt.isPresent()) {
            return ApiResponse.<OrderResponse>builder()
                    .result(orderMapper.toOrderResponse(orderOpt.get()))
                    .build();
        } else {
            return ApiResponse.<OrderResponse>builder()
                    .code(404)
                    .message("Order not found")
                    .build();
        }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('SCOPE_ORDER_CREATE_ALL') or isAuthenticated()")
    public ApiResponse<OrderResponse> createOrder(
            @RequestBody @Valid OrderRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        // Kiểm tra permission: chỉ employee với ORDER_CREATE_ALL mới được tạo đơn tại cửa hàng
        // Customer vẫn có thể tạo đơn hàng online (không cần permission này)
        boolean isEmployee = jwt.getClaims().containsKey("scopes") && 
            jwt.getClaims().get("scopes") != null &&
            ((List<?>) jwt.getClaims().get("scopes")).stream()
                .anyMatch(s -> s.toString().startsWith("ROLE_"));
        
        // Lưu ý: Trong JWT, scope được lưu KHÔNG có prefix "SCOPE_"
        boolean hasCreatePermission = jwt.getClaims().containsKey("scopes") && 
            jwt.getClaims().get("scopes") != null &&
            ((List<?>) jwt.getClaims().get("scopes")).stream()
                .anyMatch(s -> s.toString().equals("ORDER_CREATE_ALL"));
        
        // Nếu là employee nhưng không có ORDER_CREATE_ALL permission, từ chối
        if (isEmployee && !hasCreatePermission) {
            return ApiResponse.<OrderResponse>builder()
                    .code(403)
                    .message("Bạn không có quyền tạo đơn hàng tại cửa hàng")
                    .build();
        }
        
        Order order = orderService.createOrder(request);
        return ApiResponse.<OrderResponse>builder()
                .result(orderMapper.toOrderResponse(order))
                .message("Order created successfully")
                .build();
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAuthority('SCOPE_ORDER_UPDATE_STATUS') or isAuthenticated()")
    public ApiResponse<OrderResponse> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal Jwt jwt) {
        String statusStr = request.get("status");
        if (statusStr == null) {
            return ApiResponse.<OrderResponse>builder()
                    .code(400)
                    .message("Status is required")
                    .build();
        }
        OrderStatus status;
        try {
            status = OrderStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ApiResponse.<OrderResponse>builder()
                    .code(400)
                    .message("Invalid status: " + statusStr)
                    .build();
        }

        // Resource-based authorization: Kiểm tra quyền truy cập
        Optional<Order> orderOpt = orderService.getOrderById(orderId);
        if (orderOpt.isEmpty()) {
            return ApiResponse.<OrderResponse>builder()
                    .code(404)
                    .message("Order not found")
                    .build();
        }

        Order order = orderOpt.get();

        // Kiểm tra xem user có phải là employee không
        boolean isEmployee = jwt.getClaims().containsKey("scopes") &&
            jwt.getClaims().get("scopes") != null &&
            ((List<?>) jwt.getClaims().get("scopes")).stream()
                .anyMatch(s -> s.toString().startsWith("ROLE_"));

        // Lưu ý: Trong JWT, scope được lưu KHÔNG có prefix "SCOPE_"
        boolean hasUpdateStatusPermission = jwt.getClaims().containsKey("scopes") &&
            jwt.getClaims().get("scopes") != null &&
            ((List<?>) jwt.getClaims().get("scopes")).stream()
                .anyMatch(s -> s.toString().equals("ORDER_UPDATE_STATUS"));

        // Nếu không phải employee hoặc không có ORDER_UPDATE_STATUS permission
        if (!isEmployee || !hasUpdateStatusPermission) {
            // Đây là customer - chỉ cho phép hủy đơn hàng của chính mình
            try {
                Long jwtCustomerId = Long.valueOf(jwt.getSubject());

                // Kiểm tra order thuộc về customer này
                if (order.getCustomerId() == null || !jwtCustomerId.equals(order.getCustomerId().getCustomerId())) {
                    return ApiResponse.<OrderResponse>builder()
                            .code(403)
                            .message("Bạn chỉ có thể hủy đơn hàng của chính mình")
                            .build();
                }

                // Customer chỉ có thể hủy (CANCELED) hoặc hoàn trả (RETURNED)
                // Không cho phép cập nhật sang status khác
                if (status != OrderStatus.CANCELED && status != OrderStatus.RETURNED) {
                    return ApiResponse.<OrderResponse>builder()
                            .code(403)
                            .message("Bạn chỉ có thể hủy hoặc hoàn trả đơn hàng, không thể cập nhật sang trạng thái khác")
                            .build();
                }

                // Kiểm tra đơn hàng có thể hủy không (chỉ PENDING hoặc PAID mới hủy được)
                OrderStatus currentStatus = order.getStatus();
                if (currentStatus != OrderStatus.PENDING && currentStatus != OrderStatus.PAID) {
                    return ApiResponse.<OrderResponse>builder()
                            .code(400)
                            .message("Chỉ có thể hủy đơn hàng ở trạng thái 'Đang xử lý' hoặc 'Đã thanh toán'")
                            .build();
                }
            } catch (NumberFormatException e) {
                return ApiResponse.<OrderResponse>builder()
                        .code(403)
                        .message("Không thể xác định quyền truy cập")
                        .build();
            }
        }
        // Employee với ORDER_UPDATE_STATUS có thể cập nhật bất kỳ status nào, không cần check

        Optional<Order> updatedOrderOpt = orderService.updateOrderStatus(orderId, status);
        if (updatedOrderOpt.isPresent()) {
            return ApiResponse.<OrderResponse>builder()
                    .result(orderMapper.toOrderResponse(updatedOrderOpt.get()))
                    .message("Order status updated successfully")
                    .build();
        } else {
            return ApiResponse.<OrderResponse>builder()
                    .code(404)
                    .message("Order not found")
                    .build();
        }
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAuthority('SCOPE_ORDER_VIEW_ALL') or hasAuthority('SCOPE_ORDER_VIEW_DETAIL')")
    public ApiResponse<List<OrderResponse>> getOrdersByCustomer(
            @PathVariable Long customerId,
            @AuthenticationPrincipal Jwt jwt) {
        // Employee với ORDER_VIEW_ALL có thể xem tất cả
        boolean isEmployee = jwt.getClaims().containsKey("scopes") && 
            jwt.getClaims().get("scopes") != null &&
            ((List<?>) jwt.getClaims().get("scopes")).stream()
                .anyMatch(s -> s.toString().startsWith("ROLE_"));
        
        if (!isEmployee) {
            try {
                Long jwtCustomerId = Long.valueOf(jwt.getSubject());
                if (!jwtCustomerId.equals(customerId)) {
                    return ApiResponse.<List<OrderResponse>>builder()
                            .code(403)
                            .message("Bạn chỉ có thể xem đơn hàng của chính mình")
                            .build();
                }
            } catch (NumberFormatException e) {
                return ApiResponse.<List<OrderResponse>>builder()
                        .code(403)
                        .message("Không thể xác định quyền truy cập")
                        .build();
            }
        }

        var orders = orderService.getOrdersByCustomer(customerId).stream()
                .map(orderMapper::toOrderResponse)
                .toList();
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orders)
                .build();
    }

    @GetMapping("/me")
    public ApiResponse<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal Jwt jwt) {
        Long customerId = Long.valueOf(jwt.getSubject()); // subject chính là customerId trong token customer
        var orders = orderService.getOrdersByCustomer(customerId).stream()
                .map(orderMapper::toOrderResponse)
                .toList();
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orders)
                .build();
    }
}
