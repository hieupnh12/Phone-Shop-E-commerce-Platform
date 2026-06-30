package com.websales.repository;

import com.websales.entity.Employee;
import com.websales.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepo extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByEmployee(Employee employee);

    Optional<PasswordResetToken> findByToken(String token);
}
