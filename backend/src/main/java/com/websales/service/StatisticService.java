package com.websales.service;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.websales.dto.request.RevenueStatisticRequest;
import com.websales.dto.response.*;
import com.websales.entity.ProductVersion;
import com.websales.repository.SummaryCardRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.websales.repository.StatisticRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StatisticService {
    StatisticRepository statisticRepository;
    SummaryCardRepository summaryCardRepository;

     @Transactional
    public List<StatisticSummaryResponse> getStatisticsLastDays(int days) {
        if (days <= 0 || days > 360) {
            throw new IllegalArgumentException("days must be between 1 and 360");
        }
        return statisticRepository.getSaleReportByDays(days);
    }

    public RevenueStatisticResponse getRevenueStatistics(RevenueStatisticRequest req) {

        // 1. Summary
        Map<String, Object> summaryMap = statisticRepository.getSummary(
                req.startDate(),
                req.endDate()
        );

        // 2. Chart Data (có rangeType)
        List<Object[]> chartRows = statisticRepository.getChartData(
                req.startDate(),
                req.endDate(),
                req.search(),
                req.rangeType()
        );

        List<RevenueStatisticResponse.ChartData> chartData = chartRows.stream()
                .map(row -> new RevenueStatisticResponse.ChartData(
                        (String) row[0],             // date key (day, month...)
                        (BigDecimal) row[1],         // revenue
                        ((Long) row[2]) // orders (some DB return BigInteger)
                ))
                .toList();

        // 3. Payment Method Statistics
        List<Object[]> payRows = statisticRepository.getPaymentMethodStats(
                req.startDate(),
                req.endDate(),
                req.paymentMethodId()
        );

        BigDecimal totalRevenue = (BigDecimal) summaryMap.get("totalRevenue");

        List<RevenueStatisticResponse.PaymentMethodDto> paymentMethods = payRows.stream()
                .map(row -> {
                    BigDecimal revenue = (BigDecimal) row[1];
                    double percent = totalRevenue.compareTo(BigDecimal.ZERO) == 0 ? 0.0 :
                            revenue.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100))
                                    .doubleValue();

                    return new RevenueStatisticResponse.PaymentMethodDto(
                            (String) row[0],   // payment method name
                            revenue,
                            percent
                    );
                }).toList();

        // 4. Orders Pagination + Search + Sort
        Sort sort = Sort.by(
                req.sort().contains(",desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                req.sort().split(",")[0]
        );

        Pageable pageable = PageRequest.of(req.page(), req.size(), sort);

        Page<Object[]> orderPage = statisticRepository.getOrderDetailsPage(
                req.startDate(),
                req.endDate(),
                req.search(),
                req.rangeType(),
                pageable
        );

        Page<RevenueStatisticResponse.OrderDetailDto> orders =
                orderPage.map(row -> new RevenueStatisticResponse.OrderDetailDto(
                        String.valueOf(row[0]),      // orderId
                        (String) row[1],             // date (end_datetime formatted)
                        (String) row[2],             // product
                        (Integer) row[3],            // quantity
                        (BigDecimal) row[4],         // importPrice
                        (BigDecimal) row[5],         // unitPrice (unit_price_after)
                        (BigDecimal) row[6],         // revenue (totalPrice)
                        (BigDecimal) row[7],         // profit
                        (String) row[8],             // status
                        row[9] != null ? (String) row[9] : "N/A"  // paymentMethodType
                ));

        return new RevenueStatisticResponse(chartData, paymentMethods, orders);
    }

    private Long toLong(Object obj) {
        if (obj == null) return 0L;
        if (obj instanceof Number n) return n.longValue();
        return 0L;
    }

    public SummaryDashboardResponse getSummaryCardDashboard() {
        LocalDate today = LocalDate.now();
        LocalDate startOfThisWeek = today.with(DayOfWeek.MONDAY);
        LocalDate startOfNextWeek = startOfThisWeek.plusDays(7);

        String fromDateThisWeek = startOfThisWeek.toString();
        String toDateThisWeek   = startOfNextWeek.toString();

        String revenueFrom = startOfThisWeek.atStartOfDay().toString();
        String revenueTo   = startOfNextWeek.atStartOfDay().toString();

        LocalDate startOfLastWeek = startOfThisWeek.minusWeeks(1);
        LocalDate startOfNextLastWeek = startOfLastWeek.plusDays(7);
        String fromDateLastWeek = startOfLastWeek.toString();
        String toDateLastWeek   = startOfNextLastWeek.toString();
        String revenueFromLastWeek = startOfLastWeek.atStartOfDay().toString();
        String revenueToLastWeek   = startOfNextLastWeek.atStartOfDay().toString();

        // Top product - nếu getTopProductAsArray expects date-only, use date strings:
        Map<String, Object> result = summaryCardRepository.getTopProductAsArray(fromDateThisWeek, toDateThisWeek);
        String topProduct = (String) result.get("bestSellerName");

        // Revenue (use datetime-range if repo expects datetimes)
        Long revenue = summaryCardRepository.getRevenue(revenueFrom, revenueTo);
        Long revenuePrev = summaryCardRepository.getRevenue(revenueFromLastWeek, revenueToLastWeek);

        // Orders and profit (use date-only range if SQL uses DATE(...) comparators)
        Long orderCount = summaryCardRepository.getOrderCount(fromDateThisWeek, toDateThisWeek);
        Long ordersPrev = summaryCardRepository.getOrderCount(fromDateLastWeek, toDateLastWeek);

        Long profit = summaryCardRepository.getProfit(revenueFrom, revenueTo);
        Long profitPrev = summaryCardRepository.getProfit(revenueFromLastWeek, revenueToLastWeek);

        return new SummaryDashboardResponse(
                new SummaryDashboardResponse.ValueSummary(revenue.toString(), calcPercent(revenue, revenuePrev)),
                new SummaryDashboardResponse.ValueSummary(topProduct, ""),
                new SummaryDashboardResponse.ValueSummary(orderCount.toString(), calcPercent(orderCount, ordersPrev)),
                new SummaryDashboardResponse.ValueSummary(profit.toString(), calcPercent(profit, profitPrev))
        );
    }

    private String calcPercent(Long current, Long previous) {
        if (previous == 0 && current == 0) {
            return "0%";
        }
        if (previous == 0) {
            return "+100%"; // hoặc "+∞%" tùy bạn muốn hiển thị
        }

        double percent = ((double)(current - previous) / previous) * 100;

        // Xử lý -0.0%
        if (percent == 0) {
            percent = 0;
        }

        return String.format("%+.1f%%", percent);
    }

    public SummaryOrderResponse getSummaryOrder(LocalDate fromDate, LocalDate toDate) {
        String from = (fromDate != null) ? fromDate.toString() : null;
        String to   = (toDate != null)   ? toDate.toString()   : null;
        Object[] result = (Object[]) summaryCardRepository.getSumOrderCount(from, to);

        return new SummaryOrderResponse(
                ((Number) result[0]).longValue(),  // pendingOrders
                ((Number) result[1]).longValue(),  // paidOrders
                ((Number) result[2]).longValue(),  // shippedOrders
                ((Number) result[3]).longValue(),  // deliveredOrders
                ((Number) result[4]).longValue(),  // canceledOrders
                ((Number) result[5]).longValue()   // returnedOrders
        );
    }

    public SummaryRevenueResponse getSummaryRevenue() {
        // 1. Summary + Best Seller
        Map<String, Object> summaryMap = statisticRepository.getSummary(
                "2000-11-01",
                "3000-11-01"
        );
         return new SummaryRevenueResponse(
                 (BigDecimal) summaryMap.get("totalRevenue"),
                 toLong(summaryMap.get("totalOrders")),
                 (BigDecimal) summaryMap.get("totalProfit"),
                 (String) summaryMap.get("bestSellerName"),
                 toLong(summaryMap.get("bestSellerUnits"))
         );
    }

    @Transactional(readOnly = true)
    public List<StatisticOrderResponse> getTimelineAnalytics(
            String fromDate,
            String toDate,
            String rangeType,
            String orderStatus,
            String search,
            String searchStaff
    ) {
        if (rangeType == null || rangeType.isEmpty()) {
            rangeType = "day";
        }
        if (orderStatus == null || orderStatus.isEmpty()) {
            orderStatus = "all";
        }

        List<Object[]> rows = summaryCardRepository.getRevenueAndOrdersByRange(
                fromDate,
                toDate,
                rangeType,
                orderStatus,
                search,
                searchStaff
        );

        return rows.stream()
                .map(r -> new StatisticOrderResponse(
                        r[0].toString(),                   // time_group
                        (BigDecimal) r[1],                 // revenue
                        ((Number) r[2]).longValue()        // total_orders
                ))
                .toList();
    }

    private boolean isDateOnly(String value) {
        return value.matches("\\d{4}-\\d{2}-\\d{2}");
    }
    public StatisticProductResponse getStatisticProduct(String from, String to) {

        // Top sản phẩm
        Object topProductResult = summaryCardRepository.getTopProduct(from, to);
        StatisticProductResponse.ProductInfoDTO topProduct;
        if (topProductResult != null) {
            Object[] topArr = (Object[]) topProductResult;
            topProduct = new StatisticProductResponse.ProductInfoDTO(
                    topArr[0] != null ? (String) topArr[0] : "",
                    topArr[1] != null ? ((Number) topArr[1]).longValue() : 0L,
                    topArr[2] != null ? ((Number) topArr[2]).longValue() : 0L
            );
        } else {
            // Trả về giá trị mặc định nếu không có dữ liệu
            topProduct = new StatisticProductResponse.ProductInfoDTO(
                    "",
                    0L,
                    0L
            );
        }

        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(30);

// Xử lý from
        String fromDate;
        if (from == null || from.isEmpty()) {
            fromDate = thirtyDaysAgo.atStartOfDay().toString();  // default 00:00
        } else if (isDateOnly(from)) {
            fromDate = LocalDate.parse(from).atStartOfDay().toString(); // thêm 00:00:00
        } else {
            fromDate = LocalDateTime.parse(from).toString(); // giữ nguyên nếu đã có giờ
        }

// Xử lý to
        String toDate;
        if (to == null || to.isEmpty()) {
            toDate = today.atTime(23, 59, 59).toString(); // default 23:59:59
        } else if (isDateOnly(to)) {
            toDate = LocalDate.parse(to).atTime(23, 59, 59).toString(); // thêm 23:59:59
        } else {
            toDate = LocalDateTime.parse(to).toString(); // giữ nguyên nếu đã có giờ
        }

        // Top 10 sản phẩm
        List<Object[]> topProductsRaw = summaryCardRepository.getTopProducts(fromDate, toDate);
        List<StatisticProductResponse.ProductInfoDTO> topProducts = (topProductsRaw != null ? topProductsRaw : java.util.Collections.emptyList())
                .stream()
                .map(o -> {
                    Object[] arr = (Object[]) o;
                    return new StatisticProductResponse.ProductInfoDTO(
                            arr[0] != null ? (String) arr[0] : "",
                            arr[1] != null ? ((Number) arr[1]).longValue() : 0L,
                            arr[2] != null ? ((Number) arr[2]).longValue() : 0L
                    );
                })
                .toList();

        // Tổng số lượng
        Long totalQuantity = summaryCardRepository.getTotalQuantity(from, to);
        if (totalQuantity == null) totalQuantity = 0L;

        // Sản phẩm tồn kho
        Object inventoryResult = summaryCardRepository.getInventoryProduct();
        StatisticProductResponse.ProductInfoDTO inventoryProduct;
        if (inventoryResult != null) {
            Object[] invArr = (Object[]) inventoryResult;
            inventoryProduct = new StatisticProductResponse.ProductInfoDTO(
                    invArr[0] != null ? (String) invArr[0] : "",
                    0L,
                    invArr[1] != null ? ((Number) invArr[1]).longValue() : 0L
            );
        } else {
            // Trả về giá trị mặc định nếu không có dữ liệu
            inventoryProduct = new StatisticProductResponse.ProductInfoDTO(
                    "",
                    0L,
                    0L
            );
        }

        List<Object[]> byBrandRaw = summaryCardRepository.getByBrand(from, to);
        List<StatisticProductResponse.BrandRevenueDTO> byBrand = (byBrandRaw != null ? byBrandRaw : java.util.Collections.emptyList())
                .stream()
                .map(o -> {
                    Object[] arr = (Object[]) o;
                    return new StatisticProductResponse.BrandRevenueDTO(
                            arr[0] != null ? (String) arr[0] : "",                   // brand name
                            arr[1] != null ? ((Number) arr[1]).longValue() : 0L // tổng số lượng bán
                    );
                })
                .toList();

        return new StatisticProductResponse(
                topProduct,
                totalQuantity,
                inventoryProduct,
                topProducts,
                byBrand
        );
    }

    public List<ProductVersion> getLowStockProducts(int alertThreshold) {
        return statisticRepository.findLowStockProducts(alertThreshold);
    }
}
