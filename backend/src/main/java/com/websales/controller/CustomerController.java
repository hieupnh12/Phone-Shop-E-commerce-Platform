package com.websales.controller;

import com.cloudinary.Api;
import com.websales.dto.request.*;
import com.websales.dto.response.*;
import com.websales.entity.Customer;
import com.websales.service.CustomerAuthenticationService;
import com.websales.service.CustomerService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        return  ApiResponse.<String>builder()
                .result(cusAuthService.sendOtp(request))
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

     @GetMapping("/me")
     public ApiResponse<CustomerResponse> getCustomer() {
        return ApiResponse.<CustomerResponse>builder()
                .result(customerService.getCustomer())
                .build();
     }

     @PutMapping("/complete-profile")
    public ApiResponse<CompleteProfileResponse> cusAuthUpdate(@RequestBody @Valid CusAuthUpdateRequest request) {
        return ApiResponse.<CompleteProfileResponse>builder()
                .result(cusAuthService.cusAuthUpdate(request))
                .build();
     }

     @GetMapping("/total_orders/{id}")
    public ApiResponse<CustomerCountOrders> customerCountOrders(@PathVariable Long id) {
        return ApiResponse.<CustomerCountOrders>builder()
                .result(customerService.countCustomers(id))
                .build();
     }
     @GetMapping("/order/{id}")
     public ApiResponse<List<ListOrderResponse>> getALlOrders(@PathVariable Long id) {
        return ApiResponse.<List<ListOrderResponse>>builder()
                .result(customerService.findOrderByCustomerId(id))
                .build();
     }

     @GetMapping("/order_detail/{id}")
    public ApiResponse<List<ListOrderDetailResponse>> getAllOrders(@PathVariable Integer id) {
        return ApiResponse.<List<ListOrderDetailResponse>>builder()
                .result(customerService.getListOrderDetails(id))
                .build();
     }

    @GetMapping("/search")
    public ApiResponse<Page<CustomerResponse>> search(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<CustomerResponse> result = customerService.searchCustomers(keyword, page, size);

        return ApiResponse.<Page<CustomerResponse>>builder()
                .message("Search successfully")
                .result(result)
                .build();
    }
}

