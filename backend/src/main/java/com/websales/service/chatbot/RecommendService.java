package com.websales.service.chatbot;

import com.websales.dto.response.HotMarketResponse;
import com.websales.dto.response.ProductFULLResponse;
import com.websales.dto.response.RagResponse;
import com.websales.entity.Product;
import com.websales.repository.ProductRepository;
import com.websales.service.ProductService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RecommendService {
    ChatClient.Builder chatClientBuilder;
    ProductRepository productRepository;
    ProductService productService;

    public RagResponse recommend(String message) {
        // DÙNG OBJECT TỪ AI
        HotMarketResponse hot = getHotPhonesAsObject();
        Page<ProductFULLResponse> listPhones = productService.listAllProducts(PageRequest.of(0, 20));
//         SO SÁNH VỚI DB
//        Page<ProductFULLResponse> shopProducts = hot.hotPhones().stream()
//                .flatMap(name -> productRepository.findProductsWithRelations().stream())
//                .distinct()
//                .sorted(Comparator.comparingDouble(Product::getRating).reversed())
//                .limit(5)
//                .toList();
//
//        if (shopProducts.isEmpty()) {
//            shopProducts = productRepository.findTop5ByOrderByRatingDesc();
//        }
        String response = generateFinalResponse(message, hot, listPhones);
        return new RagResponse(response, null, null);
    }

    private HotMarketResponse getHotPhonesAsObject() {
        int year = LocalDate.now().getYear();
//        String prompt = String.format("""
//        Liệt kê 6 điện thoại HOT NHẤT %d (CNET, PCMag, The Verge).
//        Chỉ trả về JSON dạng:
//        {
//          "hotPhones": ["iPhone 17", "Galaxy S25 Ultra", ...],
//          "reasons": ["camera đỉnh", "Android cao cấp", ...]
//        }
//        """, year);
        String prompt = String.format("""
Liệt kê 6 điện thoại HOT NHẤT %d (CNET, PCMag, The Verge) bằng **văn bản dễ đọc** cho khách hàng.
- Liệt kê tên điện thoại + lý do nổi bật (ví dụ: camera, màn hình, pin…).
- Nếu người dùng có hỏi so sánh, hãy bổ sung phân tích so sánh giữa các sản phẩm theo phong cách chuyên gia.
- Không trả về JSON, chỉ là văn bản.
- Trình bày gọn gàng, dễ đọc, dùng dấu • hoặc số thứ tự cho từng điện thoại.
""", year);
        return chatClientBuilder.build()
                .prompt(prompt)
                .system("Bạn là chuyên gia phân tích thị trường điện thoại, chỉ trả về JSON đúng format.")
                .call()
                .entity(HotMarketResponse.class);
    }

    private String generateFinalResponse(String message, HotMarketResponse hot, Page<ProductFULLResponse> products) {
        String hotList = IntStream.range(0, hot.hotPhones().size())
                .mapToObj(i -> "• " + hot.hotPhones().get(i) + " (" + hot.reasons().get(i) + ")")
                .collect(Collectors.joining("\n"));

//        String shopList = products.stream()
//                .map(p -> "• " + p.getNameProduct() + " (image " + p.getImage() + "đ, origin " + p.getOriginName() + ")")
//                .collect(Collectors.joining("\n"));

        return """
            Chào bạn! Các điện thoại hot trên thị trường hiện nay là:
            %s
            
//            Và cửa hàng chúng tôi cũng có:
//            %s
            
            Bạn quan tâm mẫu nào? Ghé shop ngay nhé! 🔥
            """.formatted(hotList, null);
    }
}
