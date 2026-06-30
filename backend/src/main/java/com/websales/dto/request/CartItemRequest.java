package com.websales.dto.request;

import lombok.Data;

@Data
public class CartItemRequest {
    private String productVersionId;   // 👈 product_version_id từ cart_items table
    private int quantity;  // số lượng sản phẩm
}
