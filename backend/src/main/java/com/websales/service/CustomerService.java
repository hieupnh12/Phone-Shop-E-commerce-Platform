package com.websales.service;

import com.websales.dto.request.CustomerCreateRequest;
import com.websales.dto.response.CustomerResponse;
import com.websales.entity.Customer;
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

    public Customer createNewCustomer(String phone) {
        Customer customer = new Customer();
        customer.setPhoneNumber(phone);
        return customerRepository.save(customer);
    }

}
