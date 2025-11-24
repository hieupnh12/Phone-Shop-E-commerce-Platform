package com.websales.controller;

import com.cloudinary.Api;
import com.websales.dto.request.CustomerUpdateRequest;
import com.websales.dto.request.SendOtpRequest;
import com.websales.dto.request.VerifyOtpRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.request.CustomerCreateRequest;
import com.websales.dto.response.CustomerResponse;
import com.websales.mapper.CustomerMapper;
import com.websales.repository.CustomerRepo;
import com.websales.service.CustomerAuthenticationService;
import com.websales.service.CustomerService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomerController {
    CustomerService customerService;
    CustomerAuthenticationService cusAuthService;
    CustomerRepo customerRepo;
    CustomerMapper customerMapper;
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
    @PostMapping("/auth_verify_otp")
     public ApiResponse<String> verifyOtp(@RequestBody VerifyOtpRequest request) {
        return   ApiResponse.<String>builder()
                 .result(cusAuthService.verifyOtp(request))
                 .build();
     }
    @PutMapping("/update/{id}")
     public ApiResponse<CustomerResponse> updateCustomer(@PathVariable Long id, @Valid @RequestBody  CustomerUpdateRequest request) {
        return ApiResponse.<CustomerResponse>builder()
                .result(customerService.updateCustomer(id,request))
                .build();
     }

    // Lấy thông tin customer hiện tại từ JWT token
    @GetMapping("/me")
    public ApiResponse<CustomerResponse> getCurrentCustomer(@AuthenticationPrincipal Jwt jwt) {
        Long customerId = Long.valueOf(jwt.getSubject());
        return customerRepo.findById(customerId)
                .map(customer -> ApiResponse.<CustomerResponse>builder()
                        .result(customerMapper.toCustomerResponse(customer))
                        .build())
                .orElse(ApiResponse.<CustomerResponse>builder()
                        .code(404)
                        .message("Customer not found")
                        .build());
    }

}

