package com.websales.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.websales.dto.request.CusAuthUpdateRequest;
import com.websales.dto.request.SendOtpRequest;
import com.websales.dto.request.VerifyOtpRequest;
import com.websales.dto.response.CompleteProfileResponse;
import com.websales.entity.Customer;
import com.websales.entity.CustomerAuth;
import com.websales.entity.OtpRequest;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.mapper.CustomerMapper;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Key;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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
    CustomerMapper customerMapper;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected   String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.expiration}")
    protected   Long VALID_DURATION;

    @NonFinal
    @Value("${jwt.temp-expiration}")
    protected Long TEMP_VALID_DURATION;



    public String sendOtp(SendOtpRequest request) {
        String phone = PhoneUtils.normalize(request.getPhoneNumber());

        // if (!PhoneUtils.isValidVietnamPhone(request.getPhoneNumber())) {
        //     throw new IllegalArgumentException("Số điện thoại không hợp lệ: " + request.getPhoneNumber());
        // }
        OtpRequest otpReq = otpRepo.findById(phone)
                .orElse(new OtpRequest(phone));


        String otp = String.valueOf((int)(Math.random() * 900000 + 100000));

        log.debug("Sending OTP request: " + otp);

        otpReq.setVerified(false);

        if (otpReq.getLastSentAt() != null &&
                otpReq.getLastSentAt().isAfter(LocalDateTime.now().minusSeconds(30))) {
            throw new AppException(ErrorCode.OTP_SEND_TOO_FAST);
        }

//        if (otpReq.getSentCount() >= 5 &&
//                otpReq.getLastSentAt().isAfter(LocalDateTime.now().minusMinutes(10))) {
//            throw new AppException(ErrorCode.OTP_SEND_LIMIT);
//        }

        boolean sent = speedSmsService.sendVerificationCode(phone, otp);
        if(!sent) {
            throw new RuntimeException("Gửi OTP thất bại");
        }
        otpReq.setOtpHash(passwordEncoder.encode(otp));
        otpReq.setExpiresAt(LocalDateTime.now().plusMinutes(1));
        otpReq.setLastSentAt(LocalDateTime.now());
        otpReq.incrementSentCount();
        otpReq.resetAttempt();
      var Rp = otpRepo.save(otpReq);
        return Rp.getExpiresAt().toString();
    }

    @Transactional
    public String verifyOtp(VerifyOtpRequest request) {
        String phone = PhoneUtils.normalize(request.getRawPhone());

        OtpRequest otpReq = otpRepo.findByPhoneNumber(phone)
                .orElseThrow(() -> new AppException(ErrorCode.OTP_WRONG));

        if (otpReq.getAttemptCount() >= 5) {
            throw new AppException(ErrorCode.OTP_TOO_MANY_ATTEMPTS);
        }

        if (otpReq.isExpired()) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        if (otpReq.isVerified()) {
            throw new AppException(ErrorCode.OTP_VERIFY);
        }

        boolean correct = passwordEncoder.matches(request.getOtpCode(), otpReq.getOtpHash());
        if (!correct) {
            otpReq.incrementAttempt();
            otpRepo.save(otpReq);
            throw new AppException(ErrorCode.OTP_WRONG);
        }
        otpReq.setVerified(true);
        otpReq.setExpiresAt(LocalDateTime.now());
        otpRepo.save(otpReq);

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
        return generateCustomerToken(customer.getCustomerId());
    }

    public String generateCustomerToken(Long customerId) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);

        String jwtId = UUID.randomUUID().toString();
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(customerId.toString())
                .issuer("PHONESHOP")
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(jwtId)
                .claim("role", "USER")
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(jwsHeader, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Cannot create customer token", e);
        }
    }

    public String generateTemporaryToken(Long customerId) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);

        String jwtId = UUID.randomUUID().toString();

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(customerId.toString())
                .issuer("PHONESHOP")
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now().plus(TEMP_VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(jwtId)
                .claim("role", "PROFILE_UPDATER")
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(jwsHeader, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Cannot create temporary token", e);
        }
    }

    public CompleteProfileResponse cusAuthUpdate(CusAuthUpdateRequest request) {
        var context = SecurityContextHolder.getContext();

        if (context.getAuthentication() == null || !context.getAuthentication().isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        Long customerId = Long.valueOf(context.getAuthentication().getName());

        var customer = customerRepo.findById(customerId).orElseThrow(
                () -> new AppException(ErrorCode.ACCOUNT_NOT_EXIST)
        );
        String normalizedPhone = PhoneUtils.normalize(request.getPhoneNumber());

        customer.setPhoneNumber(normalizedPhone);
        if (request.getFullName() != null) {
            customer.setFullName(request.getFullName());
        }
        if (request.getBirthDate() != null) {
            customer.setBirthDate(request.getBirthDate());
        }
      Customer cus =  customerRepo.save(customer);
        return CompleteProfileResponse.builder()
                .token(generateCustomerToken(customer.getCustomerId()))
                .customerResponse(customerMapper.toCustomerResponse(cus))
                .build();


    }

}
