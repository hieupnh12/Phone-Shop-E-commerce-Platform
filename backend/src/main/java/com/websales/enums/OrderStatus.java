package com.websales.enums;

public enum OrderStatus {
    PENDING,    // Chưa thanh toán / đang chờ
    PAID,       // Đã thanh toán
    SHIPPED,    // Đã giao hàng
    DELIVERED,  // Đã nhận hàng
    CANCELED,   // Đã hủy
    RETURNED,   // Đã trả / hoàn hàng
    COMPLETED;  // Đã hoàn thành (cho đơn hàng RETURNED)
}
