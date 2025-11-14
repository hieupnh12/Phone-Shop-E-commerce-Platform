package com.websales.service;

import com.websales.dto.request.PaymentTransactionRequest;
import com.websales.dto.response.PaymentTransactionResponse;
import com.websales.entity.PaymentMethod;
import com.websales.entity.PaymentTransaction;
import com.websales.enums.PaymentStatus;
import com.websales.enums.TransactionType;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.mapper.PaymentTransactionMapper;
import com.websales.repository.PaymentTransactionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.websales.entity.Order;
import com.websales.enums.OrderStatus;
import com.websales.repository.OrderRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentTransactionService {

    PaymentTransactionRepository paymentTransactionRepository;
    PaymentTransactionMapper paymentTransactionMapper;
    PaymentMethodService paymentMethodService;
    OrderRepository orderRepository;

    @Transactional
    public PaymentTransactionResponse createPaymentTransaction(PaymentTransactionRequest request) {
        log.info("Creating payment transaction for order: {}", request.getOrderId());
        log.info("Payment method ID from request: {}", request.getPaymentMethodId());
        
        // Generate transaction ID if not provided
        String transactionId = UUID.randomUUID().toString();
        
        // Check if transaction code already exists
        if (request.getTransactionCode() != null && 
            paymentTransactionRepository.findByTransactionCode(request.getTransactionCode()).isPresent()) {
            throw new AppException(ErrorCode.TRANSACTION_CODE_DUPLICATE);
        }
        
        // Get payment method
        PaymentMethod paymentMethod = null;
        if (request.getPaymentMethodId() != null) {
            try {
                paymentMethod = paymentMethodService.getPaymentMethodEntityById(request.getPaymentMethodId());
                log.info("Found payment method: id={}, type={}, provider={}", 
                    paymentMethod.getPaymentMethodId(), 
                    paymentMethod.getPaymentMethodType(), 
                    paymentMethod.getProvider());
            } catch (AppException e) {
                log.error("Payment method not found with id: {}", request.getPaymentMethodId());
                throw e;
            }
        } else {
            log.warn("Payment method ID is null in request");
        }
        
        // Create transaction
        PaymentTransaction transaction = paymentTransactionMapper.toPaymentTransaction(request);
        transaction.setTransactionId(transactionId);
        transaction.setPaymentMethod(paymentMethod);  // Set paymentMethod here
        transaction.setPaymentTime(LocalDateTime.now());
        
        log.info("Transaction before save - paymentMethodId: {}", 
            transaction.getPaymentMethod() != null ? transaction.getPaymentMethod().getPaymentMethodId() : "NULL");
        
        // Set default values if not provided
        if (transaction.getPaymentStatus() == null) {
            transaction.setPaymentStatus(PaymentStatus.PENDING);
        }
        if (transaction.getTransactionType() == null) {
            transaction.setTransactionType(TransactionType.PAYMENT);
        }
        
        PaymentTransaction savedTransaction = paymentTransactionRepository.save(transaction);
        
        log.info("Transaction after save - paymentMethodId: {}", 
            savedTransaction.getPaymentMethod() != null ? savedTransaction.getPaymentMethod().getPaymentMethodId() : "NULL");
        
        // Fetch lại transaction với paymentMethod để tránh LAZY loading issue
        PaymentTransaction transactionWithMethod = paymentTransactionRepository
            .findById(savedTransaction.getTransactionId())
            .orElse(savedTransaction);
        
        // Trigger LAZY load nếu cần
        if (transactionWithMethod.getPaymentMethod() != null) {
            transactionWithMethod.getPaymentMethod().getPaymentMethodId();
            transactionWithMethod.getPaymentMethod().getPaymentMethodType();
        }
        
        return paymentTransactionMapper.toPaymentTransactionResponse(transactionWithMethod);
    }

    public PaymentTransactionResponse getPaymentTransactionById(String transactionId) {
        log.info("Getting payment transaction by id: {}", transactionId);
        PaymentTransaction transaction = paymentTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));
        return paymentTransactionMapper.toPaymentTransactionResponse(transaction);
    }

    public PaymentTransactionResponse getPaymentTransactionByCode(String transactionCode) {
        log.info("Getting payment transaction by code: {}", transactionCode);
        PaymentTransaction transaction = paymentTransactionRepository.findByTransactionCode(transactionCode)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));
        return paymentTransactionMapper.toPaymentTransactionResponse(transaction);
    }

    public List<PaymentTransactionResponse> getPaymentTransactionsByOrderId(Integer orderId) {
        log.info("Getting payment transactions for order: {}", orderId);
        return paymentTransactionRepository.findByOrderIdOrderByPaymentTimeDesc(orderId).stream()
                .map(paymentTransactionMapper::toPaymentTransactionResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentTransactionResponse> getPaymentTransactionsByStatus(PaymentStatus status) {
        log.info("Getting payment transactions by status: {}", status);
        return paymentTransactionRepository.findByPaymentStatus(status).stream()
                .map(paymentTransactionMapper::toPaymentTransactionResponse)
                .collect(Collectors.toList());
    }

    public Page<PaymentTransactionResponse> getPaymentTransactionsByStatus(PaymentStatus status, Pageable pageable) {
        log.info("Getting payment transactions by status: {} with pagination", status);
        return paymentTransactionRepository.findByPaymentStatus(status, pageable)
                .map(paymentTransactionMapper::toPaymentTransactionResponse);
    }

    public Page<PaymentTransactionResponse> getPaymentTransactionsByOrderId(Integer orderId, Pageable pageable) {
        log.info("Getting payment transactions for order: {} with pagination", orderId);
        return paymentTransactionRepository.findByOrderId(orderId, pageable)
                .map(paymentTransactionMapper::toPaymentTransactionResponse);
    }

    @Transactional
    public PaymentTransactionResponse updatePaymentTransaction(String transactionId, PaymentTransactionRequest request) {
        log.info("Updating payment transaction: {}", transactionId);
        PaymentTransaction transaction = paymentTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));
        
        // Update payment method if provided
        if (request.getPaymentMethodId() != null) {
            PaymentMethod paymentMethod = paymentMethodService.getPaymentMethodEntityById(request.getPaymentMethodId());
            transaction.setPaymentMethod(paymentMethod);
        }
        
        paymentTransactionMapper.updatePaymentTransaction(request, transaction);
        PaymentTransaction updatedTransaction = paymentTransactionRepository.save(transaction);
        return paymentTransactionMapper.toPaymentTransactionResponse(updatedTransaction);
    }

    @Transactional
    public PaymentTransactionResponse updatePaymentStatus(String transactionId, PaymentStatus status, String responseMessage) {
        log.info("Updating payment status for transaction: {} to {}", transactionId, status);
        PaymentTransaction transaction = paymentTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));
        
        PaymentStatus oldStatus = transaction.getPaymentStatus();
        transaction.setPaymentStatus(status);
        if (responseMessage != null) {
            transaction.setResponseMessage(responseMessage);
        }
        
        PaymentTransaction updatedTransaction = paymentTransactionRepository.save(transaction);
        
        // Update Order status khi thanh toán thành công
        if (status == PaymentStatus.SUCCESS && oldStatus != PaymentStatus.SUCCESS && transaction.getOrderId() != null) {
            Order order = orderRepository.findById(transaction.getOrderId())
                    .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
            
            order.setStatus(OrderStatus.PAID);
            order.setIsPaid(true);
            order.setEndDatetime(LocalDateTime.now());
            orderRepository.save(order);
            
            log.info("Order {} status updated to PAID after successful payment", order.getOrderId());
        }
        
        return paymentTransactionMapper.toPaymentTransactionResponse(updatedTransaction);
    }

    public List<PaymentTransactionResponse> getPaymentTransactionsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting payment transactions from {} to {}", startDate, endDate);
        return paymentTransactionRepository.findByPaymentTimeBetween(startDate, endDate).stream()
                .map(paymentTransactionMapper::toPaymentTransactionResponse)
                .collect(Collectors.toList());
    }
}

