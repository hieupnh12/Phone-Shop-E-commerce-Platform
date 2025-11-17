package com.websales.service;

import com.websales.dto.request.CustomerCreateRequest;
import com.websales.dto.request.CustomerUpdateRequest;
import com.websales.dto.response.CustomerResponse;
import com.websales.entity.Customer;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.mapper.CustomerMapper;
import com.websales.repository.CustomerRepo;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomerService {
    CustomerRepo customerRepository;
    CustomerMapper customerMapper;

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

}
