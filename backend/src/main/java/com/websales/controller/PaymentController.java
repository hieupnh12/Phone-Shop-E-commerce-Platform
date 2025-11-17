
package com.websales.controller;

import com.websales.dto.request.PaymentMethodRequest;
import com.websales.dto.request.PaymentTransactionRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.PaymentMethodResponse;
import com.websales.dto.response.PaymentTransactionResponse;
import com.websales.enums.PaymentStatus;
import com.websales.service.PaymentMethodService;
import com.websales.service.PaymentTransactionService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentController {

    PaymentMethodService paymentMethodService;
    PaymentTransactionService paymentTransactionService;

    // ========== Payment Method Endpoints ==========

    @PostMapping("/method")
    public ApiResponse<PaymentMethodResponse> createPaymentMethod(@RequestBody @Valid PaymentMethodRequest request) {
        return ApiResponse.<PaymentMethodResponse>builder()
                .result(paymentMethodService.createPaymentMethod(request))
                .message("Payment method created successfully")
                .build();
    }

    @GetMapping("/method")
    public ApiResponse<List<PaymentMethodResponse>> getAllPaymentMethods() {
        return ApiResponse.<List<PaymentMethodResponse>>builder()
                .result(paymentMethodService.getAllPaymentMethods())
                .build();
    }

    @GetMapping("/method/active")
    public ApiResponse<List<PaymentMethodResponse>> getActivePaymentMethods() {
        return ApiResponse.<List<PaymentMethodResponse>>builder()
                .result(paymentMethodService.getActivePaymentMethods())
                .build();
    }

    @GetMapping("/method/{id}")
    public ApiResponse<PaymentMethodResponse> getPaymentMethodById(@PathVariable Integer id) {
        return ApiResponse.<PaymentMethodResponse>builder()
                .result(paymentMethodService.getPaymentMethodById(id))
                .build();
    }

    @PutMapping("/method/{id}")
    public ApiResponse<PaymentMethodResponse> updatePaymentMethod(
            @PathVariable Integer id,
            @RequestBody @Valid PaymentMethodRequest request) {
        return ApiResponse.<PaymentMethodResponse>builder()
                .result(paymentMethodService.updatePaymentMethod(id, request))
                .message("Payment method updated successfully")
                .build();
    }

    @DeleteMapping("/method/{id}")
    public ApiResponse<Void> deletePaymentMethod(@PathVariable Integer id) {
        paymentMethodService.deletePaymentMethod(id);
        return ApiResponse.<Void>builder()
                .message("Payment method deleted successfully")
                .build();
    }

    // ========== Payment Transaction Endpoints ==========

    @PostMapping("/transaction")
    public ApiResponse<PaymentTransactionResponse> createPaymentTransaction(
            @RequestBody @Valid PaymentTransactionRequest request) {
        return ApiResponse.<PaymentTransactionResponse>builder()
                .result(paymentTransactionService.createPaymentTransaction(request))
                .message("Payment transaction created successfully")
                .build();
    }

    @GetMapping("/transaction/{transactionId}")
    public ApiResponse<PaymentTransactionResponse> getPaymentTransactionById(
            @PathVariable String transactionId) {
        return ApiResponse.<PaymentTransactionResponse>builder()
                .result(paymentTransactionService.getPaymentTransactionById(transactionId))
                .build();
    }

    @GetMapping("/transaction/code/{transactionCode}")
    public ApiResponse<PaymentTransactionResponse> getPaymentTransactionByCode(
            @PathVariable String transactionCode) {
        return ApiResponse.<PaymentTransactionResponse>builder()
                .result(paymentTransactionService.getPaymentTransactionByCode(transactionCode))
                .build();
    }

    @GetMapping("/transaction/order/{orderId}")
    public ApiResponse<List<PaymentTransactionResponse>> getPaymentTransactionsByOrderId(
            @PathVariable Integer orderId) {
        return ApiResponse.<List<PaymentTransactionResponse>>builder()
                .result(paymentTransactionService.getPaymentTransactionsByOrderId(orderId))
                .build();
    }

    @GetMapping("/transaction/status/{status}")
    public ApiResponse<List<PaymentTransactionResponse>> getPaymentTransactionsByStatus(
            @PathVariable PaymentStatus status) {
        return ApiResponse.<List<PaymentTransactionResponse>>builder()
                .result(paymentTransactionService.getPaymentTransactionsByStatus(status))
                .build();
    }

    @GetMapping("/transaction/status/{status}/page")
    public ApiResponse<Page<PaymentTransactionResponse>> getPaymentTransactionsByStatusWithPagination(
            @PathVariable PaymentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.<Page<PaymentTransactionResponse>>builder()
                .result(paymentTransactionService.getPaymentTransactionsByStatus(status, pageable))
                .build();
    }

    @GetMapping("/transaction/order/{orderId}/page")
    public ApiResponse<Page<PaymentTransactionResponse>> getPaymentTransactionsByOrderIdWithPagination(
            @PathVariable Integer orderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.<Page<PaymentTransactionResponse>>builder()
                .result(paymentTransactionService.getPaymentTransactionsByOrderId(orderId, pageable))
                .build();
    }

    @PutMapping("/transaction/{transactionId}")
    public ApiResponse<PaymentTransactionResponse> updatePaymentTransaction(
            @PathVariable String transactionId,
            @RequestBody @Valid PaymentTransactionRequest request) {
        return ApiResponse.<PaymentTransactionResponse>builder()
                .result(paymentTransactionService.updatePaymentTransaction(transactionId, request))
                .message("Payment transaction updated successfully")
                .build();
    }

    @PutMapping("/transaction/{transactionId}/status")
    public ApiResponse<PaymentTransactionResponse> updatePaymentStatus(
            @PathVariable String transactionId,
            @RequestParam PaymentStatus status,
            @RequestParam(required = false) String responseMessage) {
        return ApiResponse.<PaymentTransactionResponse>builder()
                .result(paymentTransactionService.updatePaymentStatus(transactionId, status, responseMessage))
                .message("Payment status updated successfully")
                .build();
    }

    @GetMapping("/transaction/date-range")
    public ApiResponse<List<PaymentTransactionResponse>> getPaymentTransactionsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        return ApiResponse.<List<PaymentTransactionResponse>>builder()
                .result(paymentTransactionService.getPaymentTransactionsByDateRange(start, end))
                .build();
    }
}

