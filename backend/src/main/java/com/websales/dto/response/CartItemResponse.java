package com.websales.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CartItemResponse {
    private String imei;       // 👈 thêm
    private Long productId;
    private String productName;
    private String image;
    private double price;
    private int quantity;
}

