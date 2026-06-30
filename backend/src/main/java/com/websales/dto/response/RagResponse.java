package com.websales.dto.response;

import java.util.List;

import org.springframework.data.domain.jaxb.SpringDataJaxb.OrderDto;

import com.websales.entity.Product;


public record RagResponse(String answer, List<YSendChatBot.YProductResponse> products, List<OrderDto> orders, List<YSendChatBot> ySendChatBots) {
    
}
