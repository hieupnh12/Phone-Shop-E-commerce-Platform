package com.websales.configuration;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.payos.PayOS;
import vn.payos.core.ClientOptions;

@Configuration
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PayOSConfig {

    @Value("${payos.client-id}")
    String clientId;

    @Value("${payos.api-key}")
    String apiKey;

    @Value("${payos.checksum-key}")
    String checksumKey;

    @Value("${payos.log-level:NONE}")
    String logLevel;

    @Bean
    public PayOS payOS() {
        ClientOptions.LogLevel level;
        try {
            level = ClientOptions.LogLevel.valueOf(logLevel.toUpperCase());
        } catch (IllegalArgumentException e) {
            level = ClientOptions.LogLevel.NONE;
        }

        ClientOptions options = ClientOptions.builder()
                .clientId(clientId)
                .apiKey(apiKey)
                .checksumKey(checksumKey)
                .logLevel(level)
                .build();

        return new PayOS(options);
    }
}

