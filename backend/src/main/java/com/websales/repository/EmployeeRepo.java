package com.websales.repository;

import com.websales.entity.Employee;
import com.websales.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface EmployeeRepo extends JpaRepository<Employee, Long> {
   Optional<Employee> findEmployeeByEmail(String email);

   Optional<Employee> findByFullName(String username);

    boolean existsEmployeeByEmail(String email);

    Optional<Employee> findByEmail(String email);

    boolean existsByEmployeeRolesContains(Role employeeRoles);

    Page<Employee> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String search, String search1, Pageable pageable);
}
