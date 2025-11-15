package com.websales.controller;

import com.websales.dto.request.EmployeeAuthRequest;
import com.websales.dto.request.EmployeeCreateRequest;
import com.websales.dto.request.PasswordResetRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.AuthenticationResponse;
import com.websales.service.EmployeeAuthenticationService;
import com.websales.service.EmployeeService;
import com.websales.service.PasswordResetService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployeeController {
    EmployeeAuthenticationService employeeAuthenticationService;
    EmployeeService employeeService;
    PasswordResetService passwordResetService;

    @PostMapping("/auth")
    public ApiResponse<AuthenticationResponse> employeeLogin(@RequestBody EmployeeAuthRequest request) {
       return ApiResponse.<AuthenticationResponse>builder()
               .result(employeeAuthenticationService.authenticate(request))
               .build();
    }

    @PostMapping
    public ApiResponse<String> createEmployee(@RequestBody EmployeeCreateRequest request) {
        employeeService.createEmployee(request);
        return ApiResponse.<String>builder()
                .result("Employee created successfully")
                .build();
    }

    @PostMapping("/auth_set_password")
    public ApiResponse<String> setPasswordFirst(@RequestBody PasswordResetRequest request) {
        passwordResetService.resetPassword(request);
        return ApiResponse.<String>builder()
                .result("Dat Mat Khau Thanh Cong")
                .build();
    }
}
