package com.websales.service;

import okhttp3.*;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsServiceImpl implements SmsService {

    @Value("${esms.apiKey}")
    private String apiKey;

    @Value("${esms.secretKey}")
    private String secretKey;

    @Value("${esms.url}")
    private String apiUrl;

    @Value("${esms.brandname}")
    private String brandname;

    @Override
    public boolean sendVerificationCode(String phoneNumber, String code) {
        try {
            OkHttpClient client = new OkHttpClient();

            String content = code + " là mã xác minh đăng ký Baotrixemay của bạn";

            MediaType mediaType = MediaType.parse("application/json");
            String json = "{"
                    + "\"ApiKey\":\"" + apiKey + "\","
                    + "\"SecretKey\":\"" + secretKey + "\","
                    + "\"Content\":\"" + content + "\","
                    + "\"Phone\":\"" + phoneNumber + "\","
                    + "\"Brandname\":\"" + brandname + "\","
                    + "\"SmsType\":\"2\","
                    + "\"IsUnicode\":\"0\""
                    + "}";

            RequestBody body = RequestBody.create(mediaType, json);
            Request request = new Request.Builder()
                    .url(apiUrl)
                    .post(body)
                    .addHeader("Content-Type", "application/json")
                    .build();

            Response response = client.newCall(request).execute();
            String responseBody = response.body().string();

            System.out.println("SMS API Response: " + responseBody);

            return response.isSuccessful();

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

}