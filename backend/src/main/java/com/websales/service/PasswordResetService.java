package com.websales.service;

import com.websales.dto.request.ConfirmEmailRequest;
import com.websales.dto.request.PasswordResetRequest;
import com.websales.entity.Employee;
import com.websales.entity.PasswordResetToken;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.repository.EmployeeRepo;
import com.websales.repository.PasswordResetTokenRepo;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PasswordResetService {
    private static final long TOKEN_EXPIRY_SECONDS = 120;
    EmailService emailService;
    EmployeeRepo employeeRepo;
    PasswordResetTokenRepo tokenRepository;
    PasswordEncoder passwordEncoder;


    public void initiatePasswordReset(ConfirmEmailRequest request) {
        Employee employee = employeeRepo.findByEmail(request.getEmail()).orElseThrow(
                () -> new AppException(ErrorCode.ACCOUNT_NOT_EXIST)
        );


        tokenRepository.findByEmployee(employee).ifPresent(existingToken -> {
            if (existingToken.isValid()) {
                throw new AppException(ErrorCode.TOKEN_STILL_VALID);
            } else {
                tokenRepository.delete(existingToken);
            }
        });

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .employee(employee)
                .expiryTime(LocalDateTime.now().plusSeconds(TOKEN_EXPIRY_SECONDS))
                .build();
        tokenRepository.save(resetToken);


        String resetLink = "http://localhost:3000/set-password?token=" + token;
        emailService.sendPasswordResetEmail(request.getEmail(), resetLink);
    }

    public void sendMailResetPassword(String email) {
        Employee employee = employeeRepo.findByEmail(email).orElseThrow(
                () -> new AppException(ErrorCode.ACCOUNT_NOT_EXIST)
        );


        tokenRepository.findByEmployee(employee).ifPresent(existingToken -> {
            if (existingToken.isValid()) {
                throw new AppException(ErrorCode.TOKEN_STILL_VALID);
            } else {
                tokenRepository.delete(existingToken);
            }
        });

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .employee(employee)
                .expiryTime(LocalDateTime.now().plusSeconds(TOKEN_EXPIRY_SECONDS))
                .build();
        tokenRepository.save(resetToken);


        String resetLink = "http://localhost:3000/set-password?token=" + token;
        emailService.sendPasswordResetEmail(email, resetLink);
    }


    public void resetPassword(PasswordResetRequest request) throws AppException {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));

        if (!resetToken.isValid()) {
            tokenRepository.deleteById(resetToken.getId());
            throw new AppException(ErrorCode.EXPIRED_TOKEN);
        }

        Employee employee = resetToken.getEmployee();
        employee.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        employee.setIsActive(Boolean.TRUE);
        employeeRepo.save(employee);

        tokenRepository.deleteById(resetToken.getId());
    }
}
