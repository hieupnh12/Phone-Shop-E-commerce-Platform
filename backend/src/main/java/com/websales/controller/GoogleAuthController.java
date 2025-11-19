package com.websales.controller;

import com.websales.dto.response.ApiResponse;
import com.websales.service.GoogleAuthService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth/google")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GoogleAuthController {

    GoogleAuthService authService;


    @GetMapping("/callback")
    public ResponseEntity<?> googleCallback(@RequestParam("code") String code,
                                            @RequestParam(value = "state", required = false) String state) {

        // 1. Xử lý logic nghiệp vụ: Trao đổi code lấy tokens
        try {
            Map<String, Object> tokens = authService.exchangeCodeForTokens(code);

            String accessToken = (String) tokens.get("access_token");


            return ResponseEntity.ok("Google Login Successful. Access Token received: " + accessToken);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google Auth Failed: " + e.getMessage());
        }
    }
}
