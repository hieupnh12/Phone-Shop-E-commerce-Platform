package com.websales.service;

import org.springframework.stereotype.Service;

public interface SmsService {
    boolean sendVerificationCode(String phoneNumber, String code);

}
