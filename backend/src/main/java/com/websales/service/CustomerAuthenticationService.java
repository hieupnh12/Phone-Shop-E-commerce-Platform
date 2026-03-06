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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.List;
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

        List<String> scopes = new ArrayList<>();
        scopes.add("CUSTOMER_UPDATE_BASIC");
        
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(customerId.toString())
                .issuer("PHONESHOP")
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(jwtId)
                .claim("role", "USER")
                .claim("scopes", Arrays.asList("CUSTOMER_UPDATE_BASIC")) // Thêm scope để có quyền update thông tin
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

    @Transactional
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

        var existingCustomerWithPhone = customerRepo.getCustomerByPhoneNumber(normalizedPhone);
        
        Long targetCustomerId = customerId; // Customer ID cuối cùng sẽ được sử dụng
        boolean isMerged = false;
        
        if (existingCustomerWithPhone.isPresent()) {
            Customer existingCustomer = existingCustomerWithPhone.get();
            
            if (existingCustomer.getCustomerId().equals(customerId)) {
            }
            else {
                boolean hasGoogleAuth = authRepo.existsByCustomerIdAndProvider(
                    existingCustomer.getCustomerId(), "google");
                
                if (hasGoogleAuth) {
                    throw new AppException(ErrorCode.PHONE_ALREADY_LINKED_TO_GOOGLE);
                } else {
                    var googleAuthOptional = authRepo.findByCustomerIdAndProvider(customerId, "google");
                    
                    if (googleAuthOptional.isPresent()) {
                        CustomerAuth googleAuth = googleAuthOptional.get();
                        
                        googleAuth.setCustomerId(existingCustomer.getCustomerId());
                        authRepo.save(googleAuth);
                        
                        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
                            existingCustomer.setFullName(request.getFullName());
                        }
                        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() &&
                            (existingCustomer.getEmail() == null || existingCustomer.getEmail().isEmpty())) {
                            var emailOwner = customerRepo.findCustomerByEmail(request.getEmail().trim().toLowerCase());
                            if (emailOwner.isEmpty() || emailOwner.get().getCustomerId().equals(customerId)) {
                                existingCustomer.setEmail(request.getEmail().trim().toLowerCase());
                            }
                        }
                        if (request.getBirthDate() != null) {
                            existingCustomer.setBirthDate(request.getBirthDate());
                        }
                        
                        customerRepo.save(existingCustomer);
                        
                        var otherAuths = authRepo.findByCustomerIdAndProvider(customerId, "phone");
                        if (otherAuths.isEmpty()) {
                            customerRepo.deleteById(customerId);
                            log.info("Deleted Google customer (customerId: {}) after merging with phone account", customerId);
                        }
                        
                        targetCustomerId = existingCustomer.getCustomerId();
                        isMerged = true;
                        
                        log.info("Merged Google account (customerId: {}) with phone account (customerId: {})", 
                                customerId, existingCustomer.getCustomerId());
                    } else {
                        customer.setPhoneNumber(normalizedPhone);
                        if (request.getFullName() != null) {
                            customer.setFullName(request.getFullName());
                        }
                        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() &&
                            (customer.getEmail() == null || customer.getEmail().isEmpty())) {
                            var emailOwner = customerRepo.findCustomerByEmail(request.getEmail().trim().toLowerCase());
                            if (emailOwner.isEmpty()) {
                                customer.setEmail(request.getEmail().trim().toLowerCase());
                            }
                        }
                        if (request.getBirthDate() != null) {
                            customer.setBirthDate(request.getBirthDate());
                        }
                        customerRepo.save(customer);
                        targetCustomerId = customerId;
                    }
                }
            }
        }
        
        if (!isMerged) {
            customer.setPhoneNumber(normalizedPhone);
            if (request.getFullName() != null) {
                customer.setFullName(request.getFullName());
            }
            if (request.getEmail() != null && !request.getEmail().trim().isEmpty() &&
                (customer.getEmail() == null || customer.getEmail().isEmpty())) {
                var emailOwner = customerRepo.findCustomerByEmail(request.getEmail().trim().toLowerCase());
                if (emailOwner.isEmpty()) {
                    customer.setEmail(request.getEmail().trim().toLowerCase());
                }
            }
            if (request.getBirthDate() != null) {
                customer.setBirthDate(request.getBirthDate());
            }
            customerRepo.save(customer);
        }
        
        Customer finalCustomer = customerRepo.findById(targetCustomerId).orElseThrow(
                () -> new AppException(ErrorCode.ACCOUNT_NOT_EXIST)
        );
        
        return CompleteProfileResponse.builder()
                .token(generateCustomerToken(targetCustomerId))
                .customerResponse(customerMapper.toCustomerResponse(finalCustomer))
                .build();
    }

}
