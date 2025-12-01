package com.websales.repository;

import com.websales.entity.Employee;
import com.websales.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
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

    @Query("SELECT e FROM Employee e JOIN e.employeeRoles r WHERE r.id = :roleId")
    List<Employee> findByRoleId(@Param("roleId") Integer roleId);
}
