package com.websales.service;

import com.websales.dto.request.PaymentMethodRequest;
import com.websales.dto.response.PaymentMethodResponse;
import com.websales.entity.PaymentMethod;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.mapper.PaymentMethodMapper;
import com.websales.repository.PaymentMethodRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentMethodService {

    PaymentMethodRepository paymentMethodRepository;
    PaymentMethodMapper paymentMethodMapper;

    @Transactional
    public PaymentMethodResponse createPaymentMethod(PaymentMethodRequest request) {
        log.info("Creating payment method: {}", request.getPaymentMethodType());
        PaymentMethod paymentMethod = paymentMethodMapper.toPaymentMethod(request);
        PaymentMethod savedPaymentMethod = paymentMethodRepository.save(paymentMethod);
        return paymentMethodMapper.toPaymentMethodResponse(savedPaymentMethod);
    }

    public List<PaymentMethodResponse> getAllPaymentMethods() {
        log.info("Getting all payment methods");
        return paymentMethodRepository.findAll().stream()
                .map(paymentMethodMapper::toPaymentMethodResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentMethodResponse> getActivePaymentMethods() {
        log.info("Getting active payment methods");
        return paymentMethodRepository.findByStatus(true).stream()
                .map(paymentMethodMapper::toPaymentMethodResponse)
                .collect(Collectors.toList());
    }

    public PaymentMethodResponse getPaymentMethodById(Integer id) {
        log.info("Getting payment method by id: {}", id);
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_METHOD_NOT_FOUND));
        return paymentMethodMapper.toPaymentMethodResponse(paymentMethod);
    }

    @Transactional
    public PaymentMethodResponse updatePaymentMethod(Integer id, PaymentMethodRequest request) {
        log.info("Updating payment method with id: {}", id);
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_METHOD_NOT_FOUND));
        
        paymentMethodMapper.updatePaymentMethod(request, paymentMethod);
        PaymentMethod updatedPaymentMethod = paymentMethodRepository.save(paymentMethod);
        return paymentMethodMapper.toPaymentMethodResponse(updatedPaymentMethod);
    }

    @Transactional
    public void deletePaymentMethod(Integer id) {
        log.info("Deleting payment method with id: {}", id);
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_METHOD_NOT_FOUND));
        paymentMethodRepository.delete(paymentMethod);
    }

    public PaymentMethod getPaymentMethodEntityById(Integer id) {
        return paymentMethodRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_METHOD_NOT_FOUND));
    }
}

