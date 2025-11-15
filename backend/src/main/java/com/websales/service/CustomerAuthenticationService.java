package com.websales.service;

import com.websales.dto.request.SendOtpRequest;
import com.websales.dto.request.VerifyOtpRequest;
import com.websales.entity.Customer;
import com.websales.entity.CustomerAuth;
import com.websales.entity.OtpRequest;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.repository.AuthRepo;
import com.websales.repository.CustomerRepo;
import com.websales.repository.OtpRepo;
import com.websales.validation.PhoneUtils;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Key;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Log4j2
public class CustomerAuthenticationService {
    SpeedSmsService speedSmsService;
    CustomerRepo customerRepo;
    PasswordEncoder passwordEncoder;
    OtpRepo otpRepo;
    AuthRepo authRepo;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected   String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.expiration}")
    protected   Long VALID_DURATION;



    public void sendOtp(SendOtpRequest request) {
        String phone = PhoneUtils.normalize(request.getPhoneNumber());

        if (!PhoneUtils.isValidVietnamPhone(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Số điện thoại không hợp lệ: " + request.getPhoneNumber());
        }
        OtpRequest otpReq = otpRepo.findById(phone)
                .orElse(new OtpRequest(phone));


        String otp = String.valueOf((int)(Math.random() * 900000 + 100000));


        boolean sent = speedSmsService.sendVerificationCode(phone, otp);
        if(!sent) {
            throw new RuntimeException("Gửi OTP thất bại");
        }
        otpReq.setOtpHash(passwordEncoder.encode(otp));
        otpReq.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otpReq.setLastSentAt(LocalDateTime.now());
        otpRepo.save(otpReq);
    }

    @Transactional
    public String verifyOtp(VerifyOtpRequest request) {
        String phone = PhoneUtils.normalize(request.getRawPhone());

        OtpRequest otpReq = otpRepo.findByPhoneNumber(phone)
                .orElseThrow(() -> new AppException(ErrorCode.OTP_WRONG));

        if (otpReq.isExpired()) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        if (otpReq.isVerified()) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        boolean correct = passwordEncoder.matches(request.getOtpCode(), otpReq.getOtpHash());
        if (!correct) {
            otpReq.incrementAttempt();
            otpRepo.save(otpReq);
            throw new AppException(ErrorCode.OTP_WRONG);
        }
        otpReq.setVerified(true);
        otpReq.setExpiresAt(LocalDateTime.now());


        Customer customer = customerRepo.getCustomerByPhoneNumber(phone)
                .orElseGet(()
                        -> customerRepo.save(Customer.builder()
                        .phoneNumber(phone)
                        .build()));
       if (!authRepo.existsByCustomerIdAndProvider(customer.getCustomerId(), "phone")) {
           authRepo.save(CustomerAuth.builder()
                   .customerId(customer.getCustomerId())
                           .provider("phone")
                   .build());
       }

        return generate(customer.getCustomerId());
    }


    public String generate(Long customerId) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(VALID_DURATION);

        return Jwts.builder()
                .setIssuer("PHONESHOP")
                .setSubject(customerId.toString())
                .claim("role", "USER")
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(SIGNER_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

}
