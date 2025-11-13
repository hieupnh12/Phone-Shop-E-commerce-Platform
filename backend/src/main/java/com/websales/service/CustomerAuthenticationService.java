package com.websales.service;

import com.websales.dto.request.SendOtpRequest;
import com.websales.entity.OtpRequest;
import com.websales.repository.CustomerRepo;
import com.websales.repository.OtpRepo;
import com.websales.validation.PhoneUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Log4j2
public class CustomerAuthenticationService {
    SmsServiceImpl smsService;
    CustomerRepo customerRepo;
    PasswordEncoder passwordEncoder;
    OtpRepo otpRepo;

    public void sendOtp(SendOtpRequest request) {
        String phone = PhoneUtils.normalize(request.getPhoneNumber());

        if (!PhoneUtils.isValidVietnamPhone(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Số điện thoại không hợp lệ: " + request.getPhoneNumber());
        }
        OtpRequest otpReq = otpRepo.findById(phone)
                .orElse(new OtpRequest(phone));


        String otp = String.valueOf((int)(Math.random() * 900000 + 100000));


        boolean sent = smsService.sendVerificationCode(request.getPhoneNumber(), otp);
        if(!sent) {
            throw new RuntimeException("Gửi OTP thất bại");
        }
        otpReq.setOtpHash(passwordEncoder.encode(otp));
        otpRepo.save(otpReq);
    }
}
