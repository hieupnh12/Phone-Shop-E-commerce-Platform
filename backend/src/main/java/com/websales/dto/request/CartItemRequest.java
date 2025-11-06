package com.websales.dto.request;

import lombok.Data;

@Data
public class CartItemRequest {
    private String imei;   // 👈 thay cho productId
    private int quantity;  // sẽ ép >=1, nhưng IMEI là đơn chiếc → dùng =1
}
