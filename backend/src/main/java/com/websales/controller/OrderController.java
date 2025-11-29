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
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {
    OrderService orderService;
    OrderMapper orderMapper;

    @GetMapping
    public ApiResponse<List<OrderResponse>> getAllOrders() {
        var orders = orderService.getAllOrders().stream()
                .map(orderMapper::toOrderResponse)
                .toList();
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orders)
                .build();
    }

    @GetMapping("/{orderId}")
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
    public ApiResponse<OrderResponse> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestBody OrderStatus status) {
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
    public ApiResponse<List<OrderResponse>> getOrdersByCustomer(@PathVariable Long customerId) {
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
