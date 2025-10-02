package com.websales.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor

//Triggering the Update
public class StockQuantityInitializer implements CommandLineRunner {
    private final ProductService productService;


    /*String... args là cú pháp varargs trong Java, được giới thiệu từ Java 5. Nó cho phép một phương thức nhận số lượng tham số linh hoạt (0 hoặc nhiều) của kiểu được chỉ định (String trong trường hợp này).
Khi phương thức được gọi, các tham số được truyền vào sẽ được Java tự động đóng gói thành một mảng (String[]).*/
    @Override
    public void run(String... args) {
//        productService.updateAllProductStockQuantities();
    }
}