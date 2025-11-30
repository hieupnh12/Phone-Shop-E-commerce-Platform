package com.websales.service;

import com.websales.validation.PhoneUtils;
import lombok.RequiredArgsConstructor;
import okhttp3.*;
import org.cloudinary.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class SpeedSmsService implements SmsService {

    @Value("${speedsms.access_token}")
    private String accessToken;

    private final OkHttpClient client = new OkHttpClient();

    @Override
    public boolean sendVerificationCode(String phoneNumber, String code) {

        SpeedSMSAPI api  = new SpeedSMSAPI(accessToken);
        String content = "Ma xua thuc PHONESHOP cua quy khach la " + code;
        try {
            String result = api.sendSMS(phoneNumber, content, 5, "b9c5665acad6c8a3");
            System.out.println(result);
        } catch (IOException e) {
            e.printStackTrace();
        }
      return true;
    }


}
