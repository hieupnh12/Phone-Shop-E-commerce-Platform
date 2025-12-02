package com.websales.dto.response;

import java.util.List;

/**
 * Response DTO cho API phân tích ảnh điện thoại
 * Trả về thông tin sản phẩm được AI phân tích từ ảnh
 */
public record ProductImageAnalysisResponse(
        Boolean isPhone, // Có phải điện thoại không
        String message, // Thông báo từ AI
        ProductFULLResponse productInfo, // Thông tin sản phẩm từ AI (nếu là điện thoại)
        List<ProductFULLResponse> similarProducts // Danh sách sản phẩm tương tự trong database
) {
    public ProductImageAnalysisResponse {
        if (similarProducts == null) {
            similarProducts = List.of();
        }
    }
}
