package com.websales.handler;

import com.websales.service.CustomOAuth2User;
import com.websales.service.CustomerAuthenticationService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    CustomerAuthenticationService customerAuthService;

    @Value("${app.public-url:http://localhost:3000}")
    private String frontendBaseUrl;

    private static final String PROFILE_UPDATE_PATH = "/update";

    @Autowired
    public void setCustomerAuthService(CustomerAuthenticationService customerAuthService) {
        this.customerAuthService = customerAuthService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        if (!(authentication.getPrincipal() instanceof CustomOAuth2User customUser)) {
            throw new IllegalStateException("Principal không phải là CustomOAuth2User.");
        }

        String base = frontendBaseUrl.replaceAll("/$", "");

        if (customUser.isRequiresProfileUpdate()) {
            String tempToken = customerAuthService.generateTemporaryToken(customUser.getCustomerId());
            response.sendRedirect(base + PROFILE_UPDATE_PATH + "?tempToken=" + tempToken);
        } else {
            String jwtToken = customerAuthService.generateCustomerToken(customUser.getCustomerId());
            response.sendRedirect(base + "/?token=" + jwtToken);
        }
    }
}
