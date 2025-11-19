package com.websales.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GoogleAuthService {

    ClientRegistrationRepository clientRegistrationRepository;

    static final String REDIRECT_URI = "http://localhost:8080/phoneShop/auth/google/callback";

    public Map<String, Object> exchangeCodeForTokens(String code) {

        ClientRegistration google = clientRegistrationRepository.findByRegistrationId("google");

        String tokenUri = google.getProviderDetails().getTokenUri();
        String clientId = google.getClientId();
        String clientSecret = google.getClientSecret();

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", REDIRECT_URI);
        params.add("grant_type", "authorization_code");

        try {
            Map<String, Object> dummyResponse = new HashMap<>();
            dummyResponse.put("access_token", "dummy_access_token_123");
            dummyResponse.put("id_token", "dummy_id_token_xyz");

            System.out.println("Tokens fetched using ClientRegistration.");
            return dummyResponse;

        } catch (Exception e) {
            throw new RuntimeException("Error exchanging code for tokens: " + e.getMessage());
        }
    }

    public Map<String, Object> fetchUserInfo(String accessToken) {
        return new HashMap<>();
    }

}
