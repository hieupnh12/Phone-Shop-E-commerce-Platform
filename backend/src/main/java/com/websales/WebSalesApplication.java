package com.websales;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WebSalesApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebSalesApplication.class, args);
    }

}