package com.websales.service;

import com.websales.dto.request.CustomerAddressBookRequest;
import com.websales.dto.response.CustomerAddressBookResponse;
import com.websales.entity.Customer;
import com.websales.entity.CustomerAddressBook;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.repository.CustomerAddressBookRepository;
import com.websales.repository.CustomerRepo;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomerAddressBookService {
    CustomerAddressBookRepository addressBookRepository;
    CustomerRepo customerRepository;

    private Long getCurrentCustomerId() {
        var context = SecurityContextHolder.getContext();
        return Long.parseLong(context.getAuthentication().getName());
    }

    public List<CustomerAddressBookResponse> getAllAddresses() {
        Long customerId = getCurrentCustomerId();
        List<CustomerAddressBook> addresses = addressBookRepository
                .findByCustomer_CustomerIdOrderByAddressBookIdDesc(customerId);
        return addresses.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerAddressBookResponse createAddress(CustomerAddressBookRequest request) {
        Long customerId = getCurrentCustomerId();
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXIST));

        CustomerAddressBook addressBook = CustomerAddressBook.builder()
                .customer(customer)
                .address(request.getAddress())
                .build();

        CustomerAddressBook saved = addressBookRepository.save(addressBook);
        return toResponse(saved);
    }

    @Transactional
    public CustomerAddressBookResponse updateAddress(Long addressBookId, CustomerAddressBookRequest request) {
        Long customerId = getCurrentCustomerId();
        CustomerAddressBook addressBook = addressBookRepository
                .findByAddressBookIdAndCustomer_CustomerId(addressBookId, customerId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXIST));

        if (request.getAddress() != null) {
            addressBook.setAddress(request.getAddress());
        }

        CustomerAddressBook saved = addressBookRepository.save(addressBook);
        return toResponse(saved);
    }

    @Transactional
    public void deleteAddress(Long addressBookId) {
        Long customerId = getCurrentCustomerId();
        CustomerAddressBook addressBook = addressBookRepository
                .findByAddressBookIdAndCustomer_CustomerId(addressBookId, customerId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXIST));

        addressBookRepository.delete(addressBook);
    }

    private CustomerAddressBookResponse toResponse(CustomerAddressBook addressBook) {
        return CustomerAddressBookResponse.builder()
                .addressBookId(addressBook.getAddressBookId())
                .address(addressBook.getAddress())
                .build();
    }
}

