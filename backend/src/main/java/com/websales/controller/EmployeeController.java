package com.websales.controller;

import com.cloudinary.Api;
import com.nimbusds.jose.JOSEException;
import com.websales.dto.request.*;
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
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasAuthority('SCOPE_STAFF_CREATE_ALL')")
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

    @PostMapping("/forgot")
    public ApiResponse<String> initiatePasswordReset(@RequestBody ConfirmEmailRequest request) throws ParseException, JOSEException {
        passwordResetService.initiatePasswordReset(request);
        return ApiResponse.<String>builder()
                .message("Email khôi phục đã được gửi!")
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
//    @GetMapping
//    public ApiResponse<List<EmployeeResponse>> getAllEmployees() {
//        return ApiResponse.<List<EmployeeResponse>>builder()
//                .result(employeeService.getAllEmployee())
//                .build();
//    }


    @GetMapping
    public ApiResponse<Page<EmployeeResponse>> getAllEmployee(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search
    ) {
        return ApiResponse.<org.springframework.data.domain.Page<EmployeeResponse>>builder()
                .result(employeeService.getAllEmployees(page, size, search))
                .build();
    }

    @GetMapping("/{employeeId}")
    public ApiResponse<EmployeeResponse> getEmployeeById(@PathVariable Long employeeId) {
        return ApiResponse.<EmployeeResponse>builder()
                .result(employeeService.getEmployeeById(employeeId))
                .build();
    }

    @PutMapping("/{employeeId}")
    @PreAuthorize("hasAuthority('SCOPE_STAFF_UPDATE_BASIC')")
    public ApiResponse<EmployeeResponse> updateEmployee(
            @PathVariable Long employeeId,
            @RequestBody EmployeeUpdateRequest request) {
        return ApiResponse.<EmployeeResponse>builder()
                .result(employeeService.updateEmployee(employeeId, request))
                .build();
    }

    @DeleteMapping("/{employeeId}")
    public ApiResponse<Void> deleteEmployee(@PathVariable Long employeeId) {
        employeeService.deleteEmployee(employeeId);
        return ApiResponse.<Void>builder()
                .build();
    }

    @GetMapping("/get_infor")
    public ApiResponse<Employee> getMyInfor() {
        return ApiResponse.<Employee>builder()
                .result(employeeService.getMyInfor())
                .build();
    }
}
