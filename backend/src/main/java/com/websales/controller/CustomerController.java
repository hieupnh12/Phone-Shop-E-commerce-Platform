package com.websales.controller;

import com.websales.dto.request.SendOtpRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.request.CustomerCreateRequest;
import com.websales.dto.response.CustomerResponse;
import com.websales.dto.response.SendOtpResponse;
import com.websales.service.CustomerService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomerController {
    CustomerService customerService;

    @PostMapping
    public ApiResponse<CustomerResponse> createCustomer(@RequestBody CustomerCreateRequest request) {
        return ApiResponse.<CustomerResponse>builder()
                .result(customerService.createCustomer(request))
                .build();
    }
//     @PostMapping("/auth")
//    public ApiResponse<SendOtpResponse> sendOtp(@RequestBody SendOtpRequest request ) {
//        return  ApiResponse.<SendOtpResponse>builder()
//                .result(cusAuthService.sendOtp(request))
//                .build();
//     }
}

