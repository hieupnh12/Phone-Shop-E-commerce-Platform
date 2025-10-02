package com.websales.service;



import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CountQuantityOfAll {

//    AccountRepository accountRepository;
//    AccountService accountService;
//    ImportReceiptRepository importrepo;
//    ImportReceiptMapper importmapper;
//    ImportReceiptService importreceiptservice;
//    ImportReceiptDetailsService importReceiptDetailsService;
//    ExportReceiptRepository exportrepo;
//    SupplierService supplierService;
//    SuppliersRepository suppliersRepository;
//    ProductVersionRepository productVersionRepo;
//    ProductVersionRepository productVersionRepository;
//    ProductItemMapper productItemMapper;
//    ProductItemRepository productItemRepo;
//    ProductItemService productItemService;
//   CustomerRepository customerRepository;
//    private final StatisticsRepository statisticsRepository;
//
//
//    public Map<String, Object> calculateImeiStats() {
//        List<ProductItem> items = productItemRepo.findAll();
//        long verifiedCount = items.stream()
//                .filter(item -> item.getExport_id() != null)
//                .count();
//        int totalItems = items.size();
//        double accuracy = (verifiedCount > 0 && totalItems > 0)
//                ? (double) verifiedCount / totalItems * 100
//                : 0.0;
//        Map<String, Object> stats = new HashMap<>();
//        stats.put("verifiedCount", (int) verifiedCount);
//        stats.put("accuracy", accuracy);
//        return stats;
//    }
//
//
//
//
//    public Map<String, Object> getExportStats() {
//        // Lấy ngày hôm nay và hôm qua
//        LocalDate today = LocalDate.now(); // 23/07/2025
//        LocalDate yesterday = today.minusDays(1); // 22/07/2025
//
//        // Tạo range thời gian cho hôm nay (từ 00:00 đến 23:59)
//        LocalDateTime startOfToday = today.atStartOfDay();
//        LocalDateTime endOfToday = today.atTime(LocalTime.MAX);
//
//        // Tạo range thời gian cho hôm qua
//        LocalDateTime startOfYesterday = yesterday.atStartOfDay();
//        LocalDateTime endOfYesterday = yesterday.atTime(LocalTime.MAX);
//
//        // Đếm số đơn xuất hàng hôm nay
//        long todayCount = exportrepo.countByExportTimeBetween(startOfToday, endOfToday);
//
//        // Đếm số đơn xuất hàng hôm qua
//        long yesterdayCount = exportrepo.countByExportTimeBetween(startOfYesterday, endOfYesterday);
//
//        // Tính số đơn tăng và phần trăm tăng
//        long increaseCount = todayCount - yesterdayCount;
//        increaseCount = increaseCount < 0 ? 0 : increaseCount;
//        double percentageIncrease = (yesterdayCount > 0) ? ((double) (todayCount - yesterdayCount) / yesterdayCount) * 100 : 0.0;
//        percentageIncrease = percentageIncrease < 0 ? 0.0 : percentageIncrease;
//
//        // Trả về Map chứa kết quả
//        Map<String, Object> stats = new HashMap<>();
//        stats.put("todayCount", todayCount);
//        stats.put("yesterdayCount", yesterdayCount);
//        stats.put("increaseCount", increaseCount);
//        stats.put("percentageIncrease", percentageIncrease);
//
//        return stats;
//    }
//
//
//
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
//
//
//
//
//
//    public Map<String, Object> calculateCustomerStats() {
//        Map<String, Object> stats = new HashMap<>();
//        LocalDate today = LocalDate.now(); // 25/07/2025
//        LocalDate yesterday = today.minusDays(1); // 24/07/2025
//
//        // 1. Tổng số lượng khách hàng hiện có (status = true)
//        long totalCustomers = customerRepository.countActiveCustomers();
//        stats.put("totalCustomers", totalCustomers);
//
//        // 2. Số lượng khách hàng tăng (khách hàng mới trong ngày hôm nay)
//        long todayIncrease = customerRepository.countNewCustomersByDate(today) != null
//                ? customerRepository.countNewCustomersByDate(today) : 0L;
//        stats.put("todayIncrease", todayIncrease);
//
//        // 3. Tổng số lượng khách hàng đến hết ngày hôm qua
//        long yesterdayTotal = customerRepository.countCustomersUpToDate(yesterday) != null
//                ? customerRepository.countCustomersUpToDate(yesterday) : 0L;
//
//        // 4. Tính phần trăm tăng/giảm
//        double percentageIncrease = calculatePercentageIncrease(totalCustomers, yesterdayTotal);
//        stats.put("percentageIncrease", percentageIncrease);
//
//        return stats;
//    }
//
//
//
//
//    public Map<String, Object> calculateCurrentMonthRevenue(Long year) {
//        // Lấy tháng và năm hiện tại
//        LocalDate currentDate = LocalDate.now();
//        int currentMonth = currentDate.getMonthValue();
//        int currentYear = currentDate.getYear();
//
//        // Kiểm tra nếu năm yêu cầu không phải năm hiện tại
//        if (!year.equals((long) currentYear)) {
//            throw new IllegalArgumentException("Dữ liệu chỉ tính cho năm hiện tại: " + currentYear);
//        }
//
//        // Lấy dữ liệu từ repository
//        List<MonthInYearResponse> monthlyData = statisticsRepository.getAllMonthInYear2(year);
//
//        // Tạo Map để lưu doanh thu theo tháng
//        Map<Long, BigDecimal> revenueByMonth = new HashMap<>();
//        for (MonthInYearResponse data : monthlyData) {
//            revenueByMonth.put(data.getMonth(), data.getRevenues() != null ? data.getRevenues() : BigDecimal.ZERO);
//            System.out.println("Month: " + data.getMonth() + ", Revenue: " + (data.getRevenues() != null ? data.getRevenues() : BigDecimal.ZERO));
//        }
//
//        // Lấy doanh thu tháng hiện tại
//        BigDecimal currentRevenue = revenueByMonth.getOrDefault((long) currentMonth, BigDecimal.ZERO);
//        System.out.println("Revenue data current (Month " + currentMonth + "): " + currentRevenue);
//        // Lấy doanh thu tháng trước
//        BigDecimal previousRevenue = revenueByMonth.getOrDefault((long) (currentMonth - 1), BigDecimal.ZERO);
//        System.out.println("Revenue data before (Month " + (currentMonth - 1) + "): " + previousRevenue);
//
//        // Tính số tiền tăng
//        BigDecimal revenueIncrease = currentRevenue.subtract(previousRevenue);
//
//        // Tính phần trăm tăng trưởng
//        BigDecimal growthPercentage;
//        if (previousRevenue.compareTo(BigDecimal.ZERO) == 0) {
//            growthPercentage = BigDecimal.ZERO;
//        } else {
//            growthPercentage = currentRevenue.subtract(previousRevenue)
//                    .divide(previousRevenue, 4, RoundingMode.HALF_UP)
//                    .multiply(BigDecimal.valueOf(100));
//        }
//
//        // Tạo Map để trả về kết quả
//        Map<String, Object> result = new HashMap<>();
//        result.put("currentMonth", currentMonth);
//        result.put("year", year);
//        result.put("currentRevenue", currentRevenue);
//        result.put("revenueIncrease", revenueIncrease);
//        result.put("growthPercentage", growthPercentage.setScale(2, RoundingMode.HALF_UP));
//
//        return result;
//    }
//

}
