package com.websales.service.chatbot;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.websales.dto.response.AiProductResponse;
import com.websales.dto.response.ProductFULLResponse;
import com.websales.dto.response.RagResponse;
import com.websales.dto.response.YSendChatBot;
import com.websales.repository.ProductRepository;
import com.websales.service.ProductService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RecommendService {
    ChatClient.Builder chatClientBuilder;
    ProductRepository productRepository;
    ProductService productService;

    public RagResponse recommend(String message) {
        // DÙNG OBJECT TỪ AI
        Page<ProductFULLResponse> listPhones = productService.listAllProducts(PageRequest.of(0, 20));

        String prompt = buildRecommendPrompt(message, listPhones);

        // Gọi AI
        String aiResponse = chatClientBuilder.build()
                .prompt(prompt)
                .system("Bạn là chuyên gia tư vấn điện thoại, trả về JSON chuẩn chatbot.")
                .call()
                .content();

        YSendChatBot.YProduct yProduct = parseAiJson(aiResponse);
        if ("result".equals(yProduct.type())) {
//            List<ProductFULLResponse> matched = matchProductsByNames(yProduct.getProductNames(), listPhones.toList());
            return new RagResponse(yProduct.message(), null, null, yProduct.productNames());
        } else {
            return new RagResponse(yProduct.message(), null, null, null);
        }
    }

    private YSendChatBot.YProduct parseAiJson(String answer) {
        try {
            String cleaned = answer.replaceAll("(?s)```json|```", "").trim();
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(cleaned, YSendChatBot.YProduct.class);
        } catch (Exception e) {
            return new YSendChatBot.YProduct(
                    "clarify",
                    "Bạn có thể mô tả kỹ hơn nhu cầu không ạ?",
                    Collections.emptyList()
            );
        }
    }

    private String buildRecommendPrompt(String userMessage, Page<ProductFULLResponse> products) {
        // 1. Tạo danh sách sản phẩm top hot
        NumberFormat vnFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

        String productList = products.stream()
                .map(p -> {
                    // Lấy danh sách version dạng string
                    String versions = p.getProductVersionResponses().stream()
                            .map(v -> String.format(
                                    "[%s, %s/%s, Giá: %s VND]",
                                    v.getColorName(),
                                    v.getRamName(),
                                    v.getRomName(),
                                    vnFormat.format(v.getExportPrice())
                            ))
                            .collect(Collectors.joining("; ")); // nối các version bằng ;

                    // Chuỗi main product
                    return String.format(
                            "%s - Brand: %s, Pin: %s, Camera: %s/%s, Màn hình: %s (%s), Chipset: %s, OS: %s, Origin: %s, Versions: %s",
                            p.getNameProduct(),
                            p.getBrandName(),
                            p.getBattery(),
                            p.getRearCamera(),
                            p.getFrontCamera(),
                            p.getScreenSize(),
                            p.getScreenResolution(),
                            p.getChipset(),
                            p.getImage(),
                            p.getOperatingSystemName(),
                            p.getOriginName(),
                            versions
                    );
                })
                .collect(Collectors.joining("\n"));

        // 2. Prompt hướng dẫn AI
        String prompt = String.format("""
                Bạn là trợ lý bán điện thoại WarePhone. Nhiệm vụ của bạn:
                - Người dùng muốn gợi ý sản phẩm phù hợp hoặc so sánh sản phẩm.
                - Luôn trả JSON hợp lệ, định dạng:
                {
                  "type": "clarify" | "result",
                  "message": "string", 
                  "ySendChatBots": [
                                    {
                                       "idProduct": 0,
                                       "nameProduct": "string",
                                       "image": "string",
                                       "brandName": "string"
                                    }
                ]
                
                Hướng dẫn chi tiết:
                1. Nếu khách chưa xác định sản phẩm, trả "clarify" và hỏi thêm, kèm gợi ý một số sản phẩm.
                2. Nếu khách đã xác định sản phẩm hoặc hỏi so sánh, trả "result" kèm phân tích ưu/nhược điểm, so sánh.
                3. Nhấn mạnh RAM, pin, camera, màn hình, thương hiệu, giá.
                4. Không thêm text ngoài JSON.
                5. Danh sách sản phẩm hiện có:
                %s
                
                Câu hỏi của khách hàng: "%s"
                """, productList, userMessage);

        return prompt;
    }

}
