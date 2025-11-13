package com.websales.service;

import com.websales.enums.Intent;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class IntentClassifier {
    ChatClient.Builder chatClient;

    private static final String CLASSIFICATION_PROMPT = """
        Bạn là một hệ thống phân loại intent cho chatbot bán điện thoại WarePhone.
        
        Nhiệm vụ: Phân loại câu hỏi người dùng vào đúng 1 intent duy nhất.
        
        Danh sách intent và mô tả:
        %s
        
        Quy tắc:
        - Chỉ trả về tên intent (viết hoa, có dấu gạch dưới).
        - Không giải thích, không thêm nội dung.
        - Nếu không chắc, chọn GENERAL.
        
        Câu hỏi: "%s"
        
        Intent:
        """;

    public Intent classify(String userMessage) {
        String intentDescriptions = Arrays.stream(Intent.values())
                .map(i -> "- " + i.name() + ": " + i.getDescription())
                .collect(Collectors.joining("\n"));

        String promptText = String.format(CLASSIFICATION_PROMPT, intentDescriptions, userMessage);

        String result = this.chatClient.build().prompt(promptText)
                .call()
                .content()
                .trim()
                .toUpperCase()
                .replace(" ", "_");

        return Arrays.stream(Intent.values())
                .filter(intent -> intent.name().equals(result))
                .findFirst()
                .orElse(Intent.GENERAL);
    }
}
