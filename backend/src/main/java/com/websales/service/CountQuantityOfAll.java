package com.websales.service;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CountQuantityOfAll {




//    public Map<String, Object> calculateProductStats() {
//        Map<String, Object> stats = new HashMap<>();
//        LocalDate today = LocalDate.now(); // 25/07/2025
//        LocalDate yesterday = today.minusDays(1); // 24/07/2025
//
//        // 1. Tổng số lượng sản phẩm hiện có
//        long totalProducts = productItemRepo.countActiveProducts();
//        stats.put("totalProducts", totalProducts);
//
//        // 2. Số lượng sản phẩm tăng (từ phiếu nhập hôm nay)
//        long todayIncrease = importrepo.sumQuantityByImportDate(today) != null
//                ? importrepo.sumQuantityByImportDate(today) : 0L;
//        stats.put("todayIncrease", todayIncrease);
//
//        // 3. Tổng số lượng sản phẩm ngày hôm qua
//        long yesterdayTotal = importrepo.sumQuantityUpToDate(yesterday) != null
//                ? importrepo.sumQuantityUpToDate(yesterday) : 0L;
//
//        // 4. Tính phần trăm tăng/giảm
//        double percentageIncrease = calculatePercentageIncrease(totalProducts, yesterdayTotal);
//        stats.put("percentageIncrease", percentageIncrease);
//
//        return stats;
//    }
//
//    private double calculatePercentageIncrease(long todayTotal, long yesterdayTotal) {
//        if (yesterdayTotal == 0) {
//            return todayTotal > 0 ? 100.0 : 0.0; // Nếu hôm qua không có, hôm nay có thì 100%
//        }
//        double change = ((double) (todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
//        return change < 0 ? 0.0 : change; // Nếu giảm, trả về 0
//    }

}