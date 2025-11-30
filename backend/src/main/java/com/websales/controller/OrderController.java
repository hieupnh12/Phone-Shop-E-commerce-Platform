package com.websales.controller;

import com.websales.dto.request.OrderRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.OrderResponse;
import com.websales.entity.Order;
import com.websales.enums.OrderStatus;
import com.websales.mapper.OrderMapper;
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
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_ORDER_VIEW_ALL')")
    public ApiResponse<Page<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createDatetime,desc") String sort
    ) {
        // Parse sort parameter (format: "field,direction")
        String[] sortParts = sort.split(",");
        String sortField = sortParts[0].trim();
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].trim().equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        
        Sort sortObj = Sort.by(direction, sortField);
        Pageable pageable = PageRequest.of(page, size, sortObj);
        
        Page<Order> ordersPage = orderService.getAllOrders(pageable);
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
    public ApiResponse<OrderResponse> createOrder(@RequestBody @Valid OrderRequest request) {
        Order order = orderService.createOrder(request);
        return ApiResponse.<OrderResponse>builder()
                .result(orderMapper.toOrderResponse(order))
                .message("Order created successfully")
                .build();
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAuthority('SCOPE_ORDER_UPDATE_STATUS')")
    public ApiResponse<OrderResponse> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> request) {
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
        Optional<Order> orderOpt = orderService.updateOrderStatus(orderId, status);
        if (orderOpt.isPresent()) {
            return ApiResponse.<OrderResponse>builder()
                    .result(orderMapper.toOrderResponse(orderOpt.get()))
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
        // Resource-based authorization: Customer chỉ xem được đơn hàng của chính mình
        // Employee với ORDER_VIEW_ALL có thể xem tất cả
        boolean isEmployee = jwt.getClaims().containsKey("scopes") && 
            jwt.getClaims().get("scopes") != null &&
            ((List<?>) jwt.getClaims().get("scopes")).stream()
                .anyMatch(s -> s.toString().startsWith("ROLE_"));
        
        if (!isEmployee) {
            // Đây là customer token - chỉ cho phép xem đơn hàng của chính mình
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
        // Employee với ORDER_VIEW_ALL có thể xem tất cả, không cần check
        
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
