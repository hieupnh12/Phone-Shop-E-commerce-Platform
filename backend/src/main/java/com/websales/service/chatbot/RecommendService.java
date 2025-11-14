package com.websales.service.chatbot;

import com.websales.dto.response.HotMarketResponse;
import com.websales.dto.response.RagResponse;
import com.websales.entity.Product;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RecommendService {
    ChatClient.Builder chatClientBuilder;

    public RagResponse recommend(String message) {
        // DÙNG OBJECT TỪ AI
        HotMarketResponse hot = getHotPhonesAsObject();

        // SO SÁNH VỚI DB
//        List<Product> shopProducts = hot.hotPhones().stream()
//                .flatMap(name -> productRepository.findByNameContainingIgnoreCase(name).stream())
//                .distinct()
//                .sorted(Comparator.comparingDouble(Product::getRating).reversed())
//                .limit(5)
//                .toList();
//
//        if (shopProducts.isEmpty()) {
//            shopProducts = productRepository.findTop5ByOrderByRatingDesc();
//        }
        String response = generateFinalResponse(message, hot, null);
        return new RagResponse(response, null, null);
    }

    private HotMarketResponse getHotPhonesAsObject() {
        int year = LocalDate.now().getYear();
        String prompt = String.format("""
        Liệt kê 6 điện thoại HOT NHẤT %d (CNET, PCMag, The Verge).
        Chỉ trả về JSON dạng:
        {
          "hotPhones": ["iPhone 17", "Galaxy S25 Ultra", ...],
          "reasons": ["camera đỉnh", "Android cao cấp", ...]
        }
        """, year);
        return chatClientBuilder.build()
                .prompt(prompt)
                .system("Bạn là chuyên gia phân tích thị trường điện thoại, chỉ trả về JSON đúng format.")
                .call()
                .entity(HotMarketResponse.class);
    }

    private String generateFinalResponse(String message, HotMarketResponse hot, List<Product> products) {
        String hotList = IntStream.range(0, hot.hotPhones().size())
                .mapToObj(i -> "• " + hot.hotPhones().get(i) + " (" + hot.reasons().get(i) + ")")
                .collect(Collectors.joining("\n"));

        String shopList = products.stream()
                .map(p -> "• " + p.getNameProduct() + " (giá " + p.getBrand() + "đ, rating " + p.getScanFrequency() + ")")
                .collect(Collectors.joining("\n"));

        return """
            Chào bạn! Các điện thoại hot trên thị trường hiện nay là:
            %s
            
            Và cửa hàng chúng tôi cũng có:
            %s
            
            Bạn quan tâm mẫu nào? Ghé shop ngay nhé! 🔥
            """.formatted(hotList, shopList);
    }
}
