package com.websales.controller;

import com.cloudinary.Api;
import com.nimbusds.jose.JOSEException;
import com.websales.dto.request.CheckTokenRequest;
import com.websales.dto.request.EmployeeAuthRequest;
import com.websales.dto.request.EmployeeCreateRequest;
import com.websales.dto.request.PasswordResetRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.AuthenticationResponse;
import com.websales.dto.response.CheckTokenResponse;
import com.websales.dto.response.EmployeeResponse;
import com.websales.entity.Employee;
import com.websales.service.EmployeeAuthenticationService;
import com.websales.service.EmployeeService;
import com.websales.service.PasswordResetService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.List;

@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployeeController {
    EmployeeAuthenticationService employeeAutService;
    EmployeeService employeeService;
    PasswordResetService passwordResetService;

    @PostMapping("/auth")
    public ApiResponse<AuthenticationResponse> employeeLogin(@RequestBody EmployeeAuthRequest request) {
       return ApiResponse.<AuthenticationResponse>builder()
               .result(employeeAutService.authenticate(request))
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
    @PostMapping("/auth_logout")
    public ApiResponse<Void> logoutEmployee(@RequestBody CheckTokenRequest request) throws ParseException, JOSEException {
        employeeAutService.logout(request);
        return ApiResponse.<Void>builder()
                .build();
    }
    @PostMapping("/auth_check_valid")
    public ApiResponse<CheckTokenResponse> checkToken(@RequestBody CheckTokenRequest request) throws ParseException, JOSEException {
        return ApiResponse.<CheckTokenResponse>builder()
                .result(employeeAutService.checkTokenValid(request))
                .build();
    }

    @PostMapping("/auth_refresh")
    public ApiResponse<AuthenticationResponse> refreshToken(@RequestBody CheckTokenRequest request) throws ParseException, JOSEException {
        return ApiResponse.<AuthenticationResponse>builder()
                .result(employeeAutService.refreshToken(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<EmployeeResponse>> getAllEmployee() {
        return ApiResponse.<List<EmployeeResponse>>builder()
                .result(employeeService.getAllEmployees())
                .build();
    }
    @GetMapping("/get_infor")
    public ApiResponse<Employee> getMyInfor() {
        return ApiResponse.<Employee>builder()
                .result(employeeService.getMyInfor())
                .build();
    }
}
