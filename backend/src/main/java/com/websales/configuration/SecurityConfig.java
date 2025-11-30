package com.websales.configuration;


import com.websales.handler.OAuth2LoginSuccessHandler;
import com.websales.service.GoogleAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.filter.CorsFilter;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true)
public class SecurityConfig {

    private final String[]  PUBLIC_ENDPOINTS =
            {"/employee/auth", "/customer/auth","/role", "/employee/auth_set_password","/employee/auth_refresh",
                    "/customer/auth_verify_otp", "/employee/auth_check_valid",
                    "/payment/success", "/payment/cancel", "/payment/payos/webhook",
                    "/customer/auth_verify_otp", "/employee/auth_check_valid", "/product", "/product/count",
                    "/customer/total_orders/{id}",
                    "/customer/order/{id}",
                    "/customer/order_detail/{id}",
                    "/index.html", "/*.js", "/*.css", "/*.ico", "/*.json", "/image/**", "/video/**",
                    "/api/chats",
                    "/api/chats/chat-image"
            };
//, "/customer/update/{id}"
    @Lazy
    private final OAuth2LoginSuccessHandler loginSuccessHandler;
    private final GoogleAuthService googleAuthService;
    CustomJwtDecoder customJwtDecoder;
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity)
            throws Exception {
        httpSecurity
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(requests ->
                            requests.requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                                    .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                                    .requestMatchers("/api/**").authenticated()  // All /api/** require authentication
                                .anyRequest().permitAll());  // Everything else is public (for React routing)

        httpSecurity.oauth2Login(oauth2 -> oauth2.loginPage("/customer-login")
                .successHandler(loginSuccessHandler)
                .failureUrl("/login?error")
                .userInfoEndpoint(userInfo -> userInfo.userService(googleAuthService)   )
        );

        httpSecurity.oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwtConfigurer -> jwtConfigurer.decoder(customJwtDecoder)
                                .jwtAuthenticationConverter(jwtConverter()))
                        .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
        );


        httpSecurity.csrf(AbstractHttpConfigurer::disable);

        return httpSecurity.build();

        //     .requestMatchers(HttpMethod.GET, "/users")
        //           .hasRole(Role.ADMIN.name())
    }


    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true); // <== QUAN TRỌNG nếu có gửi cookie/token
        config.addAllowedOrigin("http://localhost:3000"); // không có path
        config.addAllowedHeader("*"); // hoặc chi tiết: "Authorization", "Content-Type"
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }


    @Bean
    JwtAuthenticationConverter jwtConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthoritiesClaimName("scopes");
        grantedAuthoritiesConverter.setAuthorityPrefix("SCOPE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return converter;
    }


}




