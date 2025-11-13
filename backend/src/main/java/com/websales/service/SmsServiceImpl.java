package com.websales.service;

import com.google.gson.Gson;
import com.websales.dto.request.SmsRequest;
import okhttp3.*;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

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

    private final Gson gson = new Gson();
    private final OkHttpClient client = new OkHttpClient();

    @Override
    public boolean sendVerificationCode(String phoneNumber, String code) {

        SmsRequest smsRequest =  SmsRequest.builder()
                .ApiKey(apiKey)
                .SecretKey(secretKey)
                .Content("Ma xac thuc PHONESHOP cua quy khach la " + code)
                .Phone(phoneNumber)
                .Brandname(brandname)
                .SmsType("2")
                .IsUnicode("0")
                .build();

        String json = gson.toJson(smsRequest);

        RequestBody body = RequestBody.create(
                MediaType.parse("application/json"), json);

        Request request = new Request.Builder()
                .url(apiUrl)
                .post(body)
                .addHeader("Content-Type", "application/json")
                .build();

        try (Response response = client.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";
            System.out.println("SMS API Response: " + responseBody);

            return response.isSuccessful();
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

}