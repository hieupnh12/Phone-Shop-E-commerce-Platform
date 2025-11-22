package com.websales.controller;

import com.cloudinary.Api;
import com.websales.dto.request.*;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.CompleteProfileResponse;
import com.websales.dto.response.CustomerResponse;
import com.websales.service.CustomerAuthenticationService;
import com.websales.service.CustomerService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

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

     @PutMapping("/complete-profile")
    public ApiResponse<CompleteProfileResponse> cusAuthUpdate(@RequestBody @Valid CusAuthUpdateRequest request) {
        return ApiResponse.<CompleteProfileResponse>builder()
                .result(cusAuthService.cusAuthUpdate(request))
                .build();
     }

}

