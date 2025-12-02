package com.websales.controller;


import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import com.websales.dto.request.ChatRequest;
import com.websales.dto.response.ProductImageAnalysisResponse;
import com.websales.dto.response.RagResponse;
import com.websales.service.ChatService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatController {
    ChatService chatService;

    @PostMapping
    public RagResponse chat(@RequestBody ChatRequest request) {
        return chatService.ask(request);
    }

    @PostMapping(value = "/chat-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RagResponse chatWithImage(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "message", required = false) String message
    ) {
        System.out.println("file=" + file + ", imageUrl=" + imageUrl);
        if (file != null) {
            System.out.println("Tên file backend nhận: " + file.getOriginalFilename());
        }
        return chatService.chatImage(file, imageUrl, message);
    }

    @PostMapping(value = "/analyze-product-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductImageAnalysisResponse analyzeProductImage(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "productName", required = false) String productName
    ) {
        return chatService.analyzeProductImage(file, imageUrl, productName);
    }
}