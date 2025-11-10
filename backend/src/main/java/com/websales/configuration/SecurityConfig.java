package com.websales.configuration;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authz -> authz
                        .anyRequest().permitAll()  // Cho phép TẤT CẢ yêu cầu (không cần auth)
                )
                .csrf(csrf -> csrf.disable())  // Tắt CSRF nếu không cần (tùy chọn, nhưng POST sẽ dễ hơn)
                .httpBasic(httpBasic -> httpBasic.disable())  // Tắt Basic Auth
                .formLogin(form -> form.disable());  // Tắt form login nếu có

        return http.build();
    }

}
