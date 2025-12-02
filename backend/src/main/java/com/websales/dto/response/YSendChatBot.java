package com.websales.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record YSendChatBot(
        Long idProduct,
        String nameProduct,
        String image,
        String brandName
) {
    public record YProduct(
            String type,
            String message,
            @JsonProperty("ySendChatBots")
            List<YSendChatBot>productNames
    ) {}
    public record AiImageResponse(
            String message,
            String nameProduct
    ) {}
    public record YProductResponse(
            Long idProduct,
            String nameProduct,
            String image
    ) {
    }
    
    /**
     * Response từ AI phân tích ảnh điện thoại chi tiết
     * Trả về thông tin sản phẩm từ mạng dạng ProductFULLResponse
     */
    public record AiProductDetailResponse(
            Boolean isPhone, // Có phải điện thoại không
            String message, // Thông báo
            // Thông tin sản phẩm từ mạng
            String nameProduct,
            String brandName,
            String originName,
            String battery,
            String scanFrequency,
            String screenSize,
            String operatingSystemName,
            String screenResolution,
            String screenTech,
            String chipset,
            String rearCamera,
            String frontCamera,
            Integer warrantyPeriod,
            String categoryName,
            String image
    ) {}
}





record YSearchProduct() {
}