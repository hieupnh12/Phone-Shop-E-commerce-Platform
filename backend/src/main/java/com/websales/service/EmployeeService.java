package com.websales.service;

import com.websales.dto.request.EmployeeCreateRequest;
import com.websales.dto.response.EmployeeResponse;
import com.websales.entity.Employee;
import com.websales.entity.Role;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.mapper.EmployeeMapper;
import com.websales.repository.EmployeeRepo;
import com.websales.repository.RoleRepo;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployeeService {
    EmployeeRepo employeeRepo;
    RoleRepo roleRepo;
    EmailService emailService;
    PasswordResetService passwordResetService;
    EmployeeMapper employeeMapper;

    public void createEmployee(EmployeeCreateRequest request) {
        if (employeeRepo.existsEmployeeByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.ACCOUNT_EXITED);
        }
        Set<Role> roles = new HashSet<>(roleRepo.findAllById(request.getRoleId()));
     employeeRepo.save(Employee.builder()
                .email(request.getEmail())
                .fullName(request.getFullName())
                .employeeRoles(roles)
                .build());

            passwordResetService.sendMailResetPassword(request.getEmail());
    }

    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepo.findAll()
                .stream()
                .map(employeeMapper::employeeToEmployeeResponse)
                .collect(Collectors.toList());
    }
    public Employee  getMyInfor() {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();
        Employee employee = employeeRepo.findByFullName(name).orElseThrow(
                () -> new AppException(ErrorCode.ACCOUNT_EXITED)
        );
        return employee;
    }

//    public StaffResponse getMyInfo() {
//        var context =  SecurityContextHolder.getContext();
//        String name = context.getAuthentication().getName();
//
//        Account account  =  accountRepository.findByUserName(name).orElseThrow(
//                () -> new AppException(ErrorCode.ACCOUNT_NOT_EXIST));
//        var staff = staffRepository.findById(account.getStaffId()).orElseThrow(() -> new AppException(ErrorCode.STAFF_NOT_EXIST));
//        return staffMapper.toStaffResponse(staff);
//    }

}
