package com.websales.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.websales.dto.response.*;
import com.websales.entity.Product;
import com.websales.mapper.ProductMapper;
import com.websales.service.chatbot.RecommendService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.NumberFormat;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.content.Media;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.websales.dto.request.ChatRequest;
import com.websales.enums.Intent;
import com.websales.repository.ProductRepository;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatService {

    ProductRepository productRepository;
    ChatClient chatClient;
    IntentClassifier intentClassifier;
    RecommendService recommendService;
    ProductService productService;
    private final ProductMapper productMapper;

    public ChatService(ChatClient.Builder builder, ProductRepository productRepository, IntentClassifier intentClassifier, RecommendService recommendService, ProductService productService, ProductMapper productMapper) {
        this.chatClient = builder.build();
        this.productRepository = productRepository;
        this.intentClassifier = intentClassifier;
        this.recommendService = recommendService;
        this.productService = productService;
        this.productMapper = productMapper;
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
        NumberFormat vnFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

        String productList = listPhones.stream()
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
                            "idProduct %s, Brand: %s, Pin: %s, Camera: %s/%s, Màn hình: %s (%s), Chipset: %s, OS: %s, Origin: %s, Versions: %s",
                            p.getIdProduct(),
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
        String answer = chatClient.prompt()
                .system("""
                                        Bạn là trợ lý bán điện thoại WarePhone. Khi trả lời, luôn xuất ra JSON hợp lệ với cấu trúc:
                        
                                                - Khi khách hàng chưa cung cấp đủ thông tin về điện thoại:
                                                {
                                                  "type": "clarify",
                                                  "message": "string",    // câu hỏi tư vấn tự nhiên, gợi ý chọn lựa
                                                  "ySendChatBots": []
                                                }
                        
                                                - Khi khách hàng đã xác định được sản phẩm:
                                                {
                                                  "type": "result",
                                                  "message": "string",    // trả lời tư vấn, dài hơn, giải thích, gợi ý, so sánh
                                                  "ySendChatBots": [
                                            {
                                               "idProduct": 0,
                                               "nameProduct": "string",
                                               "image": "string",
                                               "brandName": "string"
                                            }
                        ]
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
                                                  "ySendChatBots": []
                                                }
                        
                                                Input: "Mình muốn iPhone 14 hoặc iPhone 14 Pro"
                                                Output:
                                                {
                                                  "type": "result",
                                                  "message": "Dựa trên yêu cầu của bạn, mình tìm thấy iPhone 14 và iPhone 14 Pro với pin khỏe, RAM và camera phù hợp. Bạn có muốn mình so sánh chi tiết giữa hai mẫu không?",
                                                  "ySendChatBots": [
                                            {
                                               "idProduct": 0,
                                               "nameProduct": "string",
                                               "image": "string",
                                               "brandName": "string"
                                            }
                        ]
                                                }
                        """)
                .user("Câu hỏi: " + q + "\nDanh sách sản phẩm:\n" + productList)
                .call()
                .content();

        YSendChatBot.YProduct aiResponse = parseAiJson(answer);

        if ("result".equals(aiResponse.type())) {
            return new RagResponse(aiResponse.message(), null, null, aiResponse.productNames());
        } else {
            return new RagResponse(aiResponse.message(), null, null, null);
        }
    }

    private AiProductResponse parseAiJsons(String answer) {
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

    private YSendChatBot.YProduct parseAiJson(String answer) {
        try {
            // loại bỏ ``` nếu có
            answer = answer.strip();
            if (answer.startsWith("```")) {
                answer = answer.substring(answer.indexOf('\n') + 1, answer.lastIndexOf("```"));
            }

            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(answer, YSendChatBot.YProduct.class);
        } catch (Exception e) {
            e.printStackTrace(); // xem lỗi thực tế
            return new YSendChatBot.YProduct(
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
                    Bạn là trợ lý AI của hệ thống quản lý bán điện thoại FShop.
                
                    Mục tiêu của bạn:
                    - Hỗ trợ người dùng tra cứu thông tin về sản phẩm, giá, và tồn kho.
                    - Gợi ý điện thoại phù hợp với nhu cầu khách hàng (dựa trên dữ liệu được cung cấp).
                    - Hỗ trợ nhân viên trong quy trình bán hàng và chăm sóc khách hàng.
                    - Trả lời ngắn gọn, chuyên nghiệp, thân thiện.
                
                    Dữ liệu hệ thống được lấy từ cơ sở dữ liệu FShop (qua API backend).
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


    public RagResponse chatImage(MultipartFile file, String imageUrl, String message) {
        Media media;

        try {
            if (file != null && !file.isEmpty()) {
                // Khi người dùng gửi file
                media = Media.builder()
                        .mimeType(MimeTypeUtils.parseMimeType(file.getContentType()))
                        .data(file.getResource())
                        .build();

            } else if (imageUrl != null && !imageUrl.isBlank()) {
                // Khi người dùng gửi URL ảnh
                URI uri = new URI(imageUrl);

                UrlResource resource = new UrlResource(uri.toURL());

                // Tự đoán MIME theo phần mở rộng
                String mimeType = Files.probeContentType(Path.of(uri.getPath()));
                if (mimeType == null) {
                    mimeType = "image/jpeg"; // fallback
                }

                media = Media.builder()
                        .mimeType(MimeTypeUtils.parseMimeType(mimeType))
                        .data(resource)
                        .build();

            } else {
                throw new IllegalArgumentException("Phải gửi file hoặc imageUrl");
            }

        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo media để xử lý ảnh", e);
        }


        ChatOptions chatOptions = ChatOptions.builder()
                .temperature(0D)
                .build();

        String answer = chatClient.prompt()
                .options(chatOptions)
                .system("""
                        Bạn là FShop AI, chuyên gia nhận diện và tư vấn điện thoại dựa trên hình ảnh khách hàng gửi.
                        
                                             QUY TẮC BẮT BUỘC:
                                             1. Chỉ phân tích điện thoại trong ảnh.
                                             2. Chỉ nói về điện thoại, không nói các chủ đề khác.
                                             3. Không giải thích bạn là AI, không mô tả quy trình phân tích.
                                             4. Không thêm bình luận ngoài yêu cầu.
                                             5. Không đưa ra thông tin không có trong ảnh.
                                             6. Chỉ được trả về JSON, không được trả về nội dung khác.
                        
                                             YÊU CẦU OUTPUT (BẮT BUỘC):
                                             Trả về duy nhất JSON theo đúng format:
                        
                                             {
                                               "message": "tư vấn ngắn gọn về điện thoại trong ảnh (không quá 2 câu)",
                                               "nameProduct": "tên hãng điện thoại nhận diện được từ ảnh (Samsung, iPhone, Xiaomi, Oppo, Vivo, Realme, Nokia...)"
                                             }
                        
                                             LƯU Ý:
                                             - Nếu không chắc chắn 100%, hãy chọn hãng gần đúng nhất.
                                             - Không được trả về các từ sai chính tả như 'Samsum', 'Ipone'.
                                             - nameProduct chỉ được chứa tên hãng, không bao gồm model.
                                             - KHÔNG được thêm bất cứ text nào ngoài JSON.
                        
                        """)
                .user(promptUserSpec -> promptUserSpec.media(media).text(message))
                .call()
                .content();

        YSendChatBot.AiImageResponse aiResponse = parseAiResponse(answer);

        List<YSendChatBot> products = productRepository.findProductAsChatBot(aiResponse.nameProduct());

        return new RagResponse(aiResponse.message(), null, null, products);
    }

    private YSendChatBot.AiImageResponse parseAiResponse(String answer) {
        try {
            // loại bỏ ``` nếu có
            answer = answer.strip();
            if (answer.startsWith("```")) {
                answer = answer.substring(answer.indexOf('\n') + 1, answer.lastIndexOf("```"));
            }

            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(answer, YSendChatBot.AiImageResponse.class);
        } catch (Exception e) {
            e.printStackTrace(); // xem lỗi thực tế
            return new YSendChatBot.AiImageResponse(
                    "Xin lỗi, tôi chưa thể nhận diện sản phẩm bạn có thể cung cấp thông tin về điện thoại không.",
                    null
            );
        }
    }


}
