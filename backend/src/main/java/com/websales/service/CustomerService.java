package com.websales.service;

import com.websales.dto.request.CustomerCreateRequest;
import com.websales.dto.request.CustomerUpdateRequest;
import com.websales.dto.response.*;
import com.websales.entity.Customer;
import com.websales.entity.Order;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.mapper.CustomerMapper;
import com.websales.repository.CustomerRepo;
import com.websales.repository.OrderDetailRepo;
import com.websales.repository.OrderRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomerService {
    CustomerRepo customerRepository;
    CustomerMapper customerMapper;
    OrderRepository orderRepository;
    OrderDetailRepo orderDetailRepo;

    public CustomerResponse createCustomer(CustomerCreateRequest request) {

        Customer customer = customerMapper.toCustomer(request);
        var c = customerRepository.save(customer);

        return customerMapper.toCustomerResponse(c);

    }

    public CustomerResponse updateCustomer(Long id, CustomerUpdateRequest request) {
        var customer = customerRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.ACCOUNT_NOT_EXIST)
        );

        if (request.getFullName() != null) {
            customer.setFullName(request.getFullName());
        }
        if (request.getGender() != null) {
            customer.setGender(request.getGender());
        }
        if (request.getBirthDate() != null) {
            customer.setBirthDate(request.getBirthDate());
        }
        if (request.getEmail() != null) {
            customer.setEmail(request.getEmail());
        }

        if (request.getAddress() != null) {
            customer.setAddress(request.getAddress());
        }

        customerRepository.save(customer);

        return customerMapper.toCustomerResponse(customer);
    }
    public CustomerResponse getCustomer() {
        var context = SecurityContextHolder.getContext();
        Long customerId = Long.parseLong(context.getAuthentication().getName());
        var c = customerRepository.findById(customerId).orElseThrow(
                () -> new AppException(ErrorCode.ACCOUNT_NOT_EXIST)
        );
        return customerMapper.toCustomerResponse(c);
    }

    public CustomerCountOrders countCustomers(Long customerId) {

        return customerRepository.getCustomerCountOrders(customerId);

    }

    public List<ListOrderResponse> findOrderByCustomerId(Long customerId) {
     
     Customer customer = customerRepository.findById(customerId).orElseThrow(
                () -> new AppException(ErrorCode.ACCOUNT_NOT_EXIST)
        );

        Sort sortByCreationDate = Sort.by(Sort.Direction.DESC, "createDatetime");
        List<Order> orders = orderRepository.findByCustomerId(customer, sortByCreationDate);

        List<ListOrderResponse> list = orders
                .stream().map(o -> {
                    DetailResponse preview = orderDetailRepo.getOrderPreview(o.getOrderId());
                    return  ListOrderResponse.builder()
                            .orderId(o.getOrderId())
                            .createDatetime(o.getCreateDatetime())
                            .totalAmount(o.getTotalAmount())
                            .status(o.getStatus())
                            .endDateTime(o.getEndDatetime())
                            .orderDetail(preview)
                            .build();
                }).collect(Collectors.toList());
        return list;
    }

    public List<ListOrderDetailResponse> getListOrderDetails(Integer orderId) {
        return orderDetailRepo.
                getListOrderDetailByOrderId(orderId);
    }

    public Page<CustomerResponse> searchCustomers(String keyword, int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createAt"); // đúng tên field trong entity
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Customer> customerPage;

        if (keyword != null && !keyword.trim().isEmpty()) {
            customerPage = customerRepository.findCustomerByEmail(keyword, pageable);
        } else {
            customerPage = customerRepository.findAll(pageable);
        }

        return customerPage.map(customerMapper::toCustomerResponse);
    }

    // Method mới để tìm kiếm theo số điện thoại hoặc email (KHÔNG ảnh hưởng method cũ)
    public Page<CustomerResponse> searchCustomersByPhoneOrEmail(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        String trimmedKeyword = keyword != null ? keyword.trim() : "";
        
        if (trimmedKeyword.isEmpty()) {
            Page<Customer> emptyPage = Page.empty(pageable);
            return emptyPage.map(customerMapper::toCustomerResponse);
        }
        
        // Tìm với keyword gốc trước
        Page<Customer> customerPage = customerRepository.searchCustomersByPhoneOrEmail(trimmedKeyword, pageable);
        
        // Nếu keyword là số điện thoại (chỉ chứa số và +) và chưa tìm thấy, thử các format khác
        if (customerPage.getContent().isEmpty() && trimmedKeyword.matches("^[0-9+]+$")) {
            // Nếu bắt đầu bằng 0, thử tìm với format 84
            if (trimmedKeyword.startsWith("0") && trimmedKeyword.length() > 1) {
                String keyword84 = "84" + trimmedKeyword.substring(1);
                customerPage = customerRepository.searchCustomersByPhoneOrEmail(keyword84, pageable);
            }
            
            // Nếu vẫn không tìm thấy và bắt đầu bằng 84, thử tìm với format 0
            if (customerPage.getContent().isEmpty() && trimmedKeyword.startsWith("84") && trimmedKeyword.length() > 2) {
                String keyword0 = "0" + trimmedKeyword.substring(2);
                customerPage = customerRepository.searchCustomersByPhoneOrEmail(keyword0, pageable);
            }
            
            // Nếu vẫn không tìm thấy và bắt đầu bằng +84, thử tìm với format 0 và 84
            if (customerPage.getContent().isEmpty() && trimmedKeyword.startsWith("+84") && trimmedKeyword.length() > 3) {
                String keyword0 = "0" + trimmedKeyword.substring(3);
                customerPage = customerRepository.searchCustomersByPhoneOrEmail(keyword0, pageable);
                if (customerPage.getContent().isEmpty()) {
                    String keyword84 = "84" + trimmedKeyword.substring(3);
                    customerPage = customerRepository.searchCustomersByPhoneOrEmail(keyword84, pageable);
                }
            }
        }
        
        return customerPage.map(customerMapper::toCustomerResponse);
    }

    // Method để lấy gợi ý khách hàng khi gõ 4 số đầu của số điện thoại
    public List<CustomerResponse> getCustomerSuggestionsByPhonePrefix(String phonePrefix) {
        if (phonePrefix == null || phonePrefix.trim().length() < 4) {
            return List.of();
        }
        Pageable pageable = PageRequest.of(0, 10);
        List<Customer> customers = customerRepository.findCustomersByPhonePrefix(phonePrefix.trim(), pageable);
        return customers.stream()
                .map(customerMapper::toCustomerResponse)
                .collect(Collectors.toList());
    }
}


