package com.websales.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;


public class CustomOAuth2User extends DefaultOAuth2User {

    private final Long customerId;
    private final boolean requiresProfileUpdate;

    public CustomOAuth2User(
            Collection<? extends GrantedAuthority> authorities,
            Map<String, Object> attributes,
            String nameAttributeKey,
            Long customerId,
            boolean requiresProfileUpdate) {

        super(authorities, attributes, nameAttributeKey);
        this.customerId = customerId;
        this.requiresProfileUpdate = requiresProfileUpdate;
    }


    public Long getCustomerId() {
        return customerId;
    }

    public boolean isRequiresProfileUpdate() {
        return requiresProfileUpdate;
    }

    public String getEmail() {
        return getAttribute("email");
    }

    public String getFullName() {
        return getAttribute("name");
    }
}
