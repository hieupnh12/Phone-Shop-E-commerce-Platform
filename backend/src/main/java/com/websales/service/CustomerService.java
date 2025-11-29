package com.websales.service;

import com.websales.dto.request.CustomerCreateRequest;
import com.websales.dto.request.CustomerUpdateRequest;
import com.websales.dto.response.*;
import com.websales.entity.Customer;
import com.websales.entity.Employee;
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
import org.springframework.data.jpa.repository.Query;
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
        List<ListOrderResponse> list = orderRepository.findByCustomerId(customer)
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
}


