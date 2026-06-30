package com.websales.controller;

import com.websales.dto.request.CustomerAddressBookRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.CustomerAddressBookResponse;
import com.websales.service.CustomerAddressBookService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/customer/address-book")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomerAddressBookController {
    CustomerAddressBookService addressBookService;

    @GetMapping
    public ApiResponse<List<CustomerAddressBookResponse>> getAllAddresses() {
        log.info("GET /customer/address-book - Getting all addresses");
        List<CustomerAddressBookResponse> addresses = addressBookService.getAllAddresses();
        log.info("Found {} addresses", addresses.size());
        return ApiResponse.<List<CustomerAddressBookResponse>>builder()
                .result(addresses)
                .build();
    }

    @PostMapping
    public ApiResponse<CustomerAddressBookResponse> createAddress(
            @Valid @RequestBody CustomerAddressBookRequest request) {
        log.info("POST /customer/address-book - Creating address: {}", request.getAddress());
        CustomerAddressBookResponse response = addressBookService.createAddress(request);
        log.info("Address created successfully with ID: {}", response.getAddressBookId());
        return ApiResponse.<CustomerAddressBookResponse>builder()
                .result(response)
                .build();
    }

    @PutMapping("/{addressBookId}")
    public ApiResponse<CustomerAddressBookResponse> updateAddress(
            @PathVariable Long addressBookId,
            @Valid @RequestBody CustomerAddressBookRequest request) {
        return ApiResponse.<CustomerAddressBookResponse>builder()
                .result(addressBookService.updateAddress(addressBookId, request))
                .build();
    }

    @DeleteMapping("/{addressBookId}")
    public ApiResponse<String> deleteAddress(@PathVariable Long addressBookId) {
        addressBookService.deleteAddress(addressBookId);
        return ApiResponse.<String>builder()
                .result("Địa chỉ đã được xóa thành công")
                .build();
    }
}

