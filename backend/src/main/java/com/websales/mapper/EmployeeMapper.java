package com.websales.mapper;

import com.websales.dto.response.EmployeeResponse;
import com.websales.entity.Employee;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {
    EmployeeResponse employeeToEmployeeResponse(Employee employee);
}
