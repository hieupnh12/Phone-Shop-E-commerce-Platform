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
}





record YSearchProduct() {
}