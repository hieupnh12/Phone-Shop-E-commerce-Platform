package com.websales.enums;

public enum Intent {
    PRODUCT_SEARCH("Tìm kiếm thông tin sản phẩm: giá, RAM, camera, thương hiệu..."),
    SALES_STATS("Thống kê doanh thu, số lượng bán ra"),
    RECOMMEND("Gợi ý sản phẩm phù hợp, so sánh giữa các sản phẩm"),
    GENERAL("Câu hỏi chung, chào hỏi, không rõ ý định");

    private final String description;

    Intent(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
