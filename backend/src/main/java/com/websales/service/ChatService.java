package com.websales.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.websales.dto.response.AiProductResponse;
import com.websales.dto.response.HotMarketResponse;
import com.websales.dto.response.ProductFULLResponse;
import com.websales.service.chatbot.RecommendService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.document.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.websales.dto.request.ChatRequest;
import com.websales.dto.response.RagResponse;
import com.websales.entity.Product;
import com.websales.enums.Intent;
import com.websales.repository.ProductRepository;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatService {
    
    ProductRepository productRepository;
    ChatClient chatClient;
    IntentClassifier intentClassifier;
    RecommendService recommendService;
    ProductService productService;

    public ChatService(ChatClient.Builder builder, ProductRepository productRepository, IntentClassifier intentClassifier, RecommendService recommendService, ProductService productService) {
        this.chatClient = builder.build();
        this.productRepository = productRepository;
        this.intentClassifier = intentClassifier;
        this.recommendService = recommendService;
        this.productService = productService;
    }

    public RagResponse ask(ChatRequest chatRequest) {
        Intent intent = intentClassifier.classify(chatRequest.message());
//        Intent intent = Intent.RECOMMEND;
        return switch (intent) {
            case PRODUCT_SEARCH -> searchProducts(chatRequest.message());
            case SALES_STATS -> chatSale(chatRequest.message());
            case RECOMMEND -> recommendService.recommend(chatRequest.message());
            case GENERAL -> chatGeneral(chatRequest.message());
        };
    }

    private RagResponse searchProducts(String q) {
        Page<ProductFULLResponse> listPhones = productService.listAllProducts(PageRequest.of(0, 20));
        Document document = new Document(listPhones.toString());
        String answer = chatClient.prompt()
                        .system("""
                                Bạn là trợ lý bán điện thoại WarePhone. Khi trả lời, luôn xuất ra JSON hợp lệ với cấu trúc:
                                
                                        - Khi khách hàng chưa cung cấp đủ thông tin về điện thoại:
                                        {
                                          "type": "clarify",
                                          "message": "string",    // câu hỏi tư vấn tự nhiên, gợi ý chọn lựa
                                          "productNames": []
                                        }
                                
                                        - Khi khách hàng đã xác định được sản phẩm:
                                        {
                                          "type": "result",
                                          "message": "string",    // trả lời tư vấn, dài hơn, giải thích, gợi ý, so sánh
                                          "productNames": [productName1, productName2, ...] // danh sách sản phẩm từ DB
                                        }
                                
                                        Luôn đảm bảo:
                                        - JSON hợp lệ, không thêm text ngoài JSON.
                                        - `message` nên đa dạng, tự nhiên, tư vấn khách hàng, có thể hỏi tiếp.
                                        - Không viết “chúng tôi có các sản phẩm” ngắn cộc.
                                        - Nếu không chắc chắn sản phẩm, trả `type` là "clarify" với gợi ý.
                                        - Nếu đã xác định, trả `type` là "result" với gợi ý chi tiết và sản phẩm thật.
                                
                                        Ví dụ:
                                
                                        Input: "Mình muốn điện thoại màn hình lớn, pin khỏe"
                                        Output:
                                        {
                                          "type": "clarify",
                                          "message": "Bạn đang tìm iPhone hay Samsung? Mình có thể gợi ý vài mẫu pin trâu và màn hình lớn cho bạn.",
                                          "productNames": []
                                        }
                                
                                        Input: "Mình muốn iPhone 14 hoặc iPhone 14 Pro"
                                        Output:
                                        {
                                          "type": "result",
                                          "message": "Dựa trên yêu cầu của bạn, mình tìm thấy iPhone 14 và iPhone 14 Pro với pin khỏe, RAM và camera phù hợp. Bạn có muốn mình so sánh chi tiết giữa hai mẫu không?",
                                          "productNames": ["iPhone 14", "iPhone 14 Pro"]
                                        }
                        """)
                        .user("Câu hỏi: " + q + "\nDanh sách sản phẩm:\n" + document)
                        .call()
                        .content();

        AiProductResponse aiResponse = parseAiJson(answer);

        if ("result".equals(aiResponse.getType())) {
            List<ProductFULLResponse> matched = matchProductsByNames(aiResponse.getProductNames(), listPhones.toList());
            return new RagResponse(aiResponse.getMessage(), matched, null, null);
        } else {
            return new RagResponse(aiResponse.getMessage(), null, null, null);
        }
    }

    private AiProductResponse parseAiJson(String answer) {
        try {
            String cleaned = answer.replaceAll("(?s)```json|```", "").trim();
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(cleaned, AiProductResponse.class);
        } catch (Exception e) {
            return new AiProductResponse(
                    "clarify",
                    "Bạn có thể mô tả kỹ hơn nhu cầu không ạ?",
                    Collections.emptyList()
            );
        }
    }

    private List<ProductFULLResponse> matchProductsByNames(List<String> aiNames,
                                                           List<ProductFULLResponse> databaseProducts) {
        if (aiNames == null || aiNames.isEmpty()) return Collections.emptyList();

        return databaseProducts.stream()
                .filter(db -> aiNames.stream()
                        .anyMatch(ai -> db.getNameProduct().toLowerCase().contains(ai.toLowerCase())))
                .collect(Collectors.toList());
    }



    private RagResponse chatSale(String q) {

        return new RagResponse("sale", null, null, null);
    }


    private RagResponse chatGeneral(String message) {
        SystemMessage systemMessage = new SystemMessage("""
    Bạn là trợ lý AI của hệ thống quản lý bán điện thoại WarePhone.

    Mục tiêu của bạn:
    - Hỗ trợ người dùng tra cứu thông tin về sản phẩm, giá, và tồn kho.
    - Gợi ý điện thoại phù hợp với nhu cầu khách hàng (dựa trên dữ liệu được cung cấp).
    - Hỗ trợ nhân viên trong quy trình bán hàng và chăm sóc khách hàng.
    - Trả lời ngắn gọn, chuyên nghiệp, thân thiện.

    Dữ liệu hệ thống được lấy từ cơ sở dữ liệu WarePhone (qua API backend).
    Bạn chỉ sử dụng dữ liệu được cung cấp trong ngữ cảnh truy vấn — 
    không tự tạo dữ liệu mới hoặc giả định ngoài dữ liệu có sẵn.

    Khi không có thông tin hoặc dữ liệu không đủ, hãy trả lời: 
    "Xin lỗi, hiện tôi chưa có dữ liệu cho nội dung này."
""");

        UserMessage userMessage = new UserMessage(message);
        Prompt prompt = new Prompt(systemMessage, userMessage);
        String answer = chatClient
                .prompt(prompt)
                .call()
                .content();

                return new RagResponse(answer, null, null, null);
    }


}
