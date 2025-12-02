package com.websales.service;

import com.websales.entity.Customer;
import com.websales.entity.CustomerAuth;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.repository.AuthRepo;
import com.websales.repository.CustomerRepo;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GoogleAuthService extends DefaultOAuth2UserService {

    CustomerRepo customerRepo;
    AuthRepo authRepo;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String googleId = oauth2User.getName();
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String provider = userRequest.getClientRegistration().getRegistrationId(); // "google"

        var authOptional = authRepo.findByProviderAndProviderUserId(provider, googleId);

        var customerByEmailOptional = customerRepo.findCustomerByEmail(email);

        Customer customer;


        if (authOptional.isPresent()) {
            CustomerAuth customerAuth = authOptional.get();
            customer = customerRepo.findById(customerAuth.getCustomerId())
                    .orElseThrow(() -> new OAuth2AuthenticationException("Customer không tồn tại."));

        } else if (customerByEmailOptional.isPresent()) {
            customer = customerByEmailOptional.get();

            authRepo.save(CustomerAuth.builder()
                    .customerId(customer.getCustomerId())
                    .provider(provider)
                    .providerUserId(googleId)
                    .build());

        } else {
            // Không tạo customer với email nếu chưa có phoneNumber
            // Để tránh duplicate email khi merge với customer có số điện thoại
            // Chỉ tạo customer tạm thời với fullName, email sẽ được lưu khi complete profile
            customer = customerRepo.save(Customer.builder()
                    .fullName(name)
                    // KHÔNG lưu email ở đây để tránh duplicate khi merge
                    // Email sẽ được lưu trong cusAuthUpdate() sau khi complete profile
                    .build());

            authRepo.save(CustomerAuth.builder()
                    .customerId(customer.getCustomerId())
                    .provider(provider)
                    .providerUserId(googleId)
                    .build());
        }

        boolean requiresProfileUpdate = (customer.getPhoneNumber() == null || customer.getPhoneNumber().isEmpty());

        return new CustomOAuth2User(
                oauth2User.getAuthorities(),
                oauth2User.getAttributes(),
                "sub",
                customer.getCustomerId(),
                requiresProfileUpdate
        );
    }

}
