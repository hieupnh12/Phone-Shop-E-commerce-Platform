package com.websales.repository;

import com.websales.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepo extends JpaRepository<Employee, Long> {
   Optional<Employee> findEmployeeByEmail(String email);

   Optional<Employee> findByFullName(String username);
}
