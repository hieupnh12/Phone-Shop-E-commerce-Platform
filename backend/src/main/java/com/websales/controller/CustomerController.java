package com.websales.controller;

import com.websales.dto.request.SendOtpRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.request.CustomerCreateRequest;
import com.websales.dto.response.CustomerResponse;
import com.websales.service.CustomerAuthenticationService;
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
    CustomerAuthenticationService cusAuthService;
    @PostMapping
    public ApiResponse<CustomerResponse> createCustomer(@RequestBody CustomerCreateRequest request) {
        return ApiResponse.<CustomerResponse>builder()
                .result(customerService.createCustomer(request))
                .build();
    }
     @PostMapping("/auth")
    public ApiResponse<String> sendOtp(@RequestBody SendOtpRequest request ) {
         cusAuthService.sendOtp(request);
        return  ApiResponse.<String>builder()
                .result("Opt da gui thanh cong")
                .build();
     }
}

