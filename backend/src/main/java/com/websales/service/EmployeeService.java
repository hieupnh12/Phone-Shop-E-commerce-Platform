package com.websales.service;

import com.websales.dto.request.EmployeeCreateRequest;
import com.websales.entity.Employee;
import com.websales.entity.Role;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.repository.EmployeeRepo;
import com.websales.repository.RoleRepo;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployeeService {
    EmployeeRepo employeeRepo;
    RoleRepo roleRepo;
    EmailService emailService;
    PasswordResetService passwordResetService;

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

}
