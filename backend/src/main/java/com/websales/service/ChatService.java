package com.websales.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.websales.dto.response.*;
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

        return new RagResponse("Tôi không cho bạn biết đâu!", null, null, null);
    }


    private RagResponse chatGeneral(String message) {
        SystemMessage systemMessage = new SystemMessage("""
                    QUY TẮC NGÔN NGỮ (ƯU TIÊN CAO NHẤT):
                    - Tự động phát hiện ngôn ngữ của người dùng trong mỗi tin nhắn.
                    - Luôn trả lời đúng 100% bằng ngôn ngữ mà người dùng đang sử dụng.
                    - Nếu người dùng dùng tiếng Hàn, phải trả lời hoàn toàn bằng tiếng Hàn, văn phong tự nhiên.
                    - Tuyệt đối không được trả lời tiếng Việt nếu tin nhắn không phải tiếng Việt.
                
                    Vai trò:
                    Bạn là trợ lý AI của hệ thống quản lý bán điện thoại FShop.
                
                    Mục tiêu:
                    - Hỗ trợ tra cứu sản phẩm, giá, tồn kho.
                    - Gợi ý điện thoại phù hợp với nhu cầu khách hàng.
                    - Hỗ trợ nhân viên bán hàng và CSKH.
                    - Trả lời ngắn gọn, chuyên nghiệp, thân thiện.
                
                    Dữ liệu:
                    - Chỉ sử dụng dữ liệu được backend FShop cung cấp.
                    - Không tự tạo dữ liệu khi không có trong ngữ cảnh.
                
                    Khi không có dữ liệu, hãy trả lời:
                    "Xin lỗi, hiện tôi chưa có dữ liệu cho nội dung này. Và tư vấn không quá 3 câu về mua điện thoại tại FShop"
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
                                               "message": "tư vấn ngắn gọn về điện thoại trong ảnh (nếu xác định chính xác tên điện thoại có thể kèm theo tên) (không quá 3 câu) và cuối câu có thể gợi ý tùy theo mối liên quan của ảnh mà chọn mua 1 trong các sản phẩm ( Samsung, iPhone, Xiaomi ) từ cửa hàng của Fshop",
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

    /**
     * Phân tích ảnh và trả về thông tin sản phẩm ProductFULLResponse
     * AI sẽ phân tích ảnh, xác định xem có phải điện thoại không,
     * và nếu là điện thoại sẽ lấy thông tin chi tiết từ mạng
     * 
     * @param file Ảnh từ file upload
     * @param imageUrl URL của ảnh
     * @param productName Tên sản phẩm (optional) để giúp AI tìm chính xác hơn
     */
    public ProductImageAnalysisResponse analyzeProductImage(MultipartFile file, String imageUrl, String productName) {
        Media media;

        try {
            if (file != null && !file.isEmpty()) {
                media = Media.builder()
                        .mimeType(MimeTypeUtils.parseMimeType(file.getContentType()))
                        .data(file.getResource())
                        .build();
            } else if (imageUrl != null && !imageUrl.isBlank()) {
                URI uri = new URI(imageUrl);
                UrlResource resource = new UrlResource(uri.toURL());
                String mimeType = Files.probeContentType(Path.of(uri.getPath()));
                if (mimeType == null) {
                    mimeType = "image/jpeg";
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

        // Xây dựng user message với productName nếu có
        String userMessageText;
        if (productName != null && !productName.isBlank()) {
            userMessageText = String.format(
                "Hãy phân tích ảnh này và trả về thông tin chi tiết về điện thoại. Tên sản phẩm gợi ý: %s. " +
                "Hãy sử dụng tên này để tìm kiếm thông tin chính xác hơn từ kiến thức của bạn.",
                productName
            );
        } else {
            userMessageText = "Hãy phân tích ảnh này và trả về thông tin chi tiết về điện thoại nếu có.";
        }

        String answer = chatClient.prompt()
                .options(chatOptions)
                .system("""
                        Bạn là FShop AI, chuyên gia nhận diện và phân tích điện thoại dựa trên hình ảnh.
                        
                        QUY TẮC BẮT BUỘC:
                        1. Phân tích ảnh để xác định xem có phải điện thoại không.
                        2. Nếu người dùng cung cấp tên sản phẩm gợi ý, hãy ưu tiên sử dụng tên đó để tìm thông tin chính xác hơn.
                        3. Nếu là điện thoại, hãy lấy thông tin chi tiết từ kiến thức của bạn (từ mạng/internet).
                        4. Chỉ được trả về JSON trong các thuộc tính chỉ có giá trị vd ("battery": "5000 mAh) không ghi gì thêm nữa.
                        5. Nếu không phải điện thoại, trả về isPhone = false và message giải thích.
                        
                        YÊU CẦU OUTPUT (BẮT BUỘC):
                        Trả về duy nhất JSON theo đúng format:
                        
                        {
                          "isPhone": true/false,
                          "message": "Thông báo về kết quả phân tích",
                          "nameProduct": "Tên đầy đủ của điện thoại (ví dụ: iPhone 15 Pro Max, Samsung Galaxy S24 Ultra)",
                          "brandName": "Tên hãng (Samsung, iPhone, Xiaomi, Oppo, Vivo, Realme, Nokia...)",
                          "originName": "Xuất xứ",
                          "battery": "Dung lượng pin (ví dụ: 5000 mAh)",
                          "scanFrequency": "Tần số quét",
                          "screenSize": "Kích thước màn hình (ví dụ: 6.7 inch)",
                          "operatingSystemName": "Hệ điều hành (iOS, Android, ...)",
                          "screenResolution": "Độ phân giải màn hình (ví dụ: 1440 x 3200)",
                          "screenTech": "Công nghệ màn hình (ví dụ: AMOLED, OLED)",
                          "chipset": "Chip xử lý (ví dụ: Apple A17 Pro, Snapdragon 8 Gen 3)",
                          "rearCamera": "Camera sau (ví dụ: 200MP + 50MP + 10MP)",
                          "frontCamera": "Camera trước (ví dụ: 12MP)",
                          "warrantyPeriod": 12,
                          "categoryName": "Điện thoại",
                          "image": "URL ảnh hoặc mô tả"
                        }
                        
                        LƯU Ý:
                        - Nếu người dùng cung cấp tên sản phẩm, hãy ưu tiên sử dụng tên đó và tìm thông tin chính xác.
                        - nameProduct phải là tên đầy đủ và chính xác.
                        - brandName chỉ chứa tên hãng, không bao gồm model.
                        - warrantyPeriod tính bằng tháng (thường là 12 hoặc 24).
                        - KHÔNG được thêm bất cứ text nào ngoài JSON.
                        """)
                .user(promptUserSpec -> promptUserSpec.media(media).text(userMessageText))
                .call()
                .content();

        YSendChatBot.AiProductDetailResponse aiResponse = parseProductDetailResponse(answer);

        // Nếu không phải điện thoại
        if (!aiResponse.isPhone()) {
            return new ProductImageAnalysisResponse(
                    false,
                    aiResponse.message(),
                    null,
                    List.of()
            );
        }

        // Tạo ProductFULLResponse từ AI response
        ProductFULLResponse productInfo = ProductFULLResponse.builder()
                .nameProduct(aiResponse.nameProduct())
                .brandName(aiResponse.brandName())
                .originName(aiResponse.originName())
                .battery(aiResponse.battery())
                .scanFrequency(aiResponse.scanFrequency())
                .screenSize(aiResponse.screenSize())
                .operatingSystemName(aiResponse.operatingSystemName())
                .screenResolution(aiResponse.screenResolution())
                .screenTech(aiResponse.screenTech())
                .chipset(aiResponse.chipset())
                .rearCamera(aiResponse.rearCamera())
                .frontCamera(aiResponse.frontCamera())
                .warrantyPeriod(aiResponse.warrantyPeriod())
                .categoryName(aiResponse.categoryName())
                .image(aiResponse.image())
                .build();

        // Tìm sản phẩm tương tự trong database
        // Ưu tiên sử dụng productName từ tham số đầu vào nếu có, nếu không thì dùng từ AI response
        String searchProductName = (productName != null && !productName.isBlank()) 
                ? productName 
                : aiResponse.nameProduct();
        List<ProductFULLResponse> similarProducts = findSimilarProducts(aiResponse.brandName(), searchProductName);

        return new ProductImageAnalysisResponse(
                true,
                aiResponse.message(),
                productInfo,
                similarProducts
        );
    }

    private YSendChatBot.AiProductDetailResponse parseProductDetailResponse(String answer) {
        try {
            answer = answer.strip();
            if (answer.startsWith("```")) {
                answer = answer.substring(answer.indexOf('\n') + 1, answer.lastIndexOf("```"));
            }

            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(answer, YSendChatBot.AiProductDetailResponse.class);
        } catch (Exception e) {
            e.printStackTrace();
            return new YSendChatBot.AiProductDetailResponse(
                    false,
                    "Xin lỗi, tôi không thể phân tích ảnh này. Vui lòng gửi ảnh rõ ràng hơn.",
                    null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
            );
        }
    }

    private List<ProductFULLResponse> findSimilarProducts(String brandName, String productName) {
        try {
            // Nếu không có brandName và productName thì không tìm được
            if ((brandName == null || brandName.isBlank()) && (productName == null || productName.isBlank())) {
                return List.of();
            }

            Page<ProductFULLResponse> products = productService.SearchProduct(
                    brandName, // brandName
                    null, // warehouseAreaName
                    null, // originName
                    null, // operatingSystemName
                    productName, // productName - sử dụng để tìm chính xác hơn
                    null, // battery
                    null, // scanFrequency
                    null, // screenSize
                    null, // screenResolution
                    null, // screenTech
                    null, // chipset
                    null, // rearCamera
                    null, // frontCamera
                    null, // warrantyPeriod
                    true, // status (chỉ lấy sản phẩm đang active)
                    PageRequest.of(0, 5) // Lấy tối đa 5 sản phẩm
            );

            return products.getContent();
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }


}
