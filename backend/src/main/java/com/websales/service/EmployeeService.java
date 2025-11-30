package com.websales.service;

import com.websales.dto.request.EmployeeCreateRequest;
import com.websales.dto.request.EmployeeUpdateRequest;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

//    public List<EmployeeResponse> getAllEmployee() {
//        return employeeRepo.findAll()
//                .stream()
//                .map(employeeMapper::employeeToEmployeeResponse)
//                .collect(Collectors.toList());
//    }

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

    public Page<EmployeeResponse> getAllEmployees(int page, int size, String search) {
    Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
    Pageable pageable = PageRequest.of(page, size, sort);
    Page<Employee> employeePage;
    if (search != null && !search.trim().isEmpty()) {
        employeePage = employeeRepo.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable);
    } else {
        employeePage = employeeRepo.findAll(pageable);
    }
    return employeePage.map(employeeMapper::employeeToEmployeeResponse);
}

    public EmployeeResponse getEmployeeById(Long employeeId) {
    Employee employee = employeeRepo.findById(employeeId).orElseThrow(
            () -> new AppException(ErrorCode.ACCOUNT_NOT_EXIST));
    return employeeMapper.employeeToEmployeeResponse(employee);
}
    public EmployeeResponse updateEmployee(Long employeeId, EmployeeUpdateRequest request) {
        Employee employee = employeeRepo.findById(employeeId).orElseThrow(
                () -> new AppException(ErrorCode.ACCOUNT_NOT_EXIST));

        employee.setFullName(request.getFullName());
        employee.setIsActive(request.getIsActive());

        Set<Role> roles = new HashSet<>(roleRepo.findAllById(request.getRoleId()));
        employee.setEmployeeRoles(roles);

        employee = employeeRepo.save(employee);
        return employeeMapper.employeeToEmployeeResponse(employee);
    }

    public void deleteEmployee(Long employeeId) {
        Employee employee = employeeRepo.findById(employeeId).orElseThrow(
                () -> new AppException(ErrorCode.ACCOUNT_NOT_EXIST));

        if (!employee.getIsActive()) {
            throw new AppException(ErrorCode.ACCOUNT_INACTIVE);
        }

        employee.setIsActive(false);
        employeeRepo.save(employee);
    }

}
