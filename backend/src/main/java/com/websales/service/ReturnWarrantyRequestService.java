package com.websales.service;

import com.websales.dto.request.ReturnWarrantyRequestRequest;
import com.websales.dto.request.UpdateWarrantyRequestStatusRequest;
import com.websales.dto.response.ReturnWarrantyRequestResponse;
import com.websales.entity.Customer;
import com.websales.entity.Employee;
import com.websales.entity.Order;
import com.websales.entity.ReturnWarrantyRequest;
import com.websales.enums.OrderStatus;
import com.websales.enums.RequestStatus;
import com.websales.repository.CustomerRepo;
import com.websales.repository.EmployeeRepo;
import com.websales.repository.OrderRepository;
import com.websales.repository.ReturnWarrantyRequestRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReturnWarrantyRequestService {
    ReturnWarrantyRequestRepository requestRepository;
    OrderRepository orderRepository;
    CustomerRepo customerRepo;
    EmployeeRepo employeeRepo;

    @Transactional
    public ReturnWarrantyRequestResponse createRequest(ReturnWarrantyRequestRequest request, Long customerId) {
        // Validate order exists and is DELIVERED
        Order order = orderRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + request.getOrderId()));

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Chỉ có thể tạo yêu cầu bảo hành/đổi trả cho đơn hàng đã được giao (DELIVERED)");
        }

        // Validate customer owns the order
        if (order.getCustomerId() == null || !order.getCustomerId().getCustomerId().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền tạo yêu cầu cho đơn hàng này");
        }

        // Validate product is in the order
        boolean productInOrder = order.getOrderDetails().stream()
                .anyMatch(detail -> detail.getProductVersion() != null 
                    && detail.getProductVersion().getIdVersion() != null
                    && detail.getProductVersion().getIdVersion().equals(request.getProductVersionId()));
        
        if (!productInOrder) {
            throw new RuntimeException("Sản phẩm không có trong đơn hàng này");
        }

        Customer customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + customerId));

        ReturnWarrantyRequest warrantyRequest = ReturnWarrantyRequest.builder()
                .order(order)
                .customer(customer)
                .productVersionId(request.getProductVersionId())
                .type(request.getType())
                .reason(request.getReason())
                .status(RequestStatus.PENDING)
                .appointmentDate(request.getAppointmentDate())
                .build();

        ReturnWarrantyRequest saved = requestRepository.save(warrantyRequest);
        return toResponse(saved);
    }

    public Page<ReturnWarrantyRequestResponse> getAllRequests(Pageable pageable) {
        log.info("Getting all warranty requests with pageable: page={}, size={}, sort={}", 
                pageable.getPageNumber(), pageable.getPageSize(), pageable.getSort());
        Page<ReturnWarrantyRequest> entityPage = requestRepository.findAll(pageable);
        log.info("Found {} total warranty requests in repository", entityPage.getTotalElements());
        Page<ReturnWarrantyRequestResponse> responsePage = entityPage.map(this::toResponse);
        log.info("Mapped to {} response objects", responsePage.getContent().size());
        return responsePage;
    }

    public Page<ReturnWarrantyRequestResponse> getRequestsByCustomer(Long customerId, Pageable pageable) {
        return requestRepository.findByCustomer_CustomerId(customerId, pageable).map(this::toResponse);
    }

    public List<ReturnWarrantyRequestResponse> getRequestsByCustomer(Long customerId) {
        return requestRepository.findByCustomer_CustomerId(customerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Page<ReturnWarrantyRequestResponse> getRequestsByStatus(RequestStatus status, Pageable pageable) {
        return requestRepository.findByStatus(status, pageable).map(this::toResponse);
    }

    public Optional<ReturnWarrantyRequestResponse> getRequestById(Integer requestId) {
        return requestRepository.findById(requestId).map(this::toResponse);
    }

    @Transactional
    public ReturnWarrantyRequestResponse updateRequestStatus(
            Integer requestId,
            UpdateWarrantyRequestStatusRequest updateRequest,
            Long employeeId) {
        ReturnWarrantyRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found: " + requestId));

        Employee employee = null;
        if (employeeId != null) {
            employee = employeeRepo.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));
        }

        request.setStatus(updateRequest.getStatus());
        request.setAdminNote(updateRequest.getAdminNote());
        request.setEmployee(employee);
        if (updateRequest.getAppointmentDate() != null) {
            request.setAppointmentDate(updateRequest.getAppointmentDate());
        }

        ReturnWarrantyRequest saved = requestRepository.save(request);
        return toResponse(saved);
    }

    private ReturnWarrantyRequestResponse toResponse(ReturnWarrantyRequest request) {
        return ReturnWarrantyRequestResponse.builder()
                .requestId(request.getRequestId())
                .orderId(request.getOrder() != null ? request.getOrder().getOrderId() : null)
                .customerId(request.getCustomer() != null ? request.getCustomer().getCustomerId() : null)
                .customerName(request.getCustomer() != null ? request.getCustomer().getFullName() : null)
                .employeeId(request.getEmployee() != null ? request.getEmployee().getId() : null)
                .employeeName(request.getEmployee() != null ? request.getEmployee().getFullName() : null)
                .productVersionId(request.getProductVersionId())
                .productName(null) // Can be populated from ProductVersion if needed
                .type(request.getType())
                .reason(request.getReason())
                .status(request.getStatus())
                .adminNote(request.getAdminNote())
                .appointmentDate(request.getAppointmentDate())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}

