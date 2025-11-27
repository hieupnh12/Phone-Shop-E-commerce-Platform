package com.websales.handler;



import com.websales.service.CustomOAuth2User;
import com.websales.service.CustomerAuthenticationService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
@Component

public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    CustomerAuthenticationService customerAuthService;

    private final String FRONTEND_BASE_URL = "http://localhost:3000";

    private final String PROFILE_UPDATE_PATH = "/update";

    private final String MAIN_APP_CALLBACK_PATH = "/oauth-callback";



    @Autowired

    public void setCustomerAuthService(CustomerAuthenticationService customerAuthService) {

        this.customerAuthService = customerAuthService;

    }

    @Override

    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        if (!(authentication.getPrincipal() instanceof CustomOAuth2User)) {

            throw new IllegalStateException("Principal không phải là CustomOAuth2User.");

        }

        CustomOAuth2User customUser = (CustomOAuth2User) authentication.getPrincipal();

        if (customUser.isRequiresProfileUpdate()) {


            String tempToken = customerAuthService.generateTemporaryToken(customUser.getCustomerId());

            String redirectUrl = FRONTEND_BASE_URL + PROFILE_UPDATE_PATH + "?tempToken=" + tempToken;

            response.sendRedirect(redirectUrl);

        } else {

            String jwtToken = customerAuthService.generateCustomerToken(customUser.getCustomerId());

            String redirectUrl = FRONTEND_BASE_URL + "?token=" + jwtToken;

            response.sendRedirect(redirectUrl);

        }



    }



}