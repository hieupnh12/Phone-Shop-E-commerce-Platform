package com.websales.service;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.websales.dto.request.RevenueStatisticRequest;
import com.websales.dto.response.*;
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
        // 1. Summary + Best Seller
        Map<String, Object> summaryMap = statisticRepository.getSummary(
                req.startDate().toString(),
                req.endDate().toString()
        );

        // 2. Chart Data
        List<Object[]> chartRows = statisticRepository.getChartData(req.startDate(), req.endDate());
        List<RevenueStatisticResponse.ChartData> chartData = chartRows.stream()
                .map(row -> new RevenueStatisticResponse.ChartData((String) row[0], (BigDecimal) row[1], ((Long) row[2])))
                .toList();

        // 4. Payment Methods Stats
        List<Object[]> payRows = statisticRepository.getPaymentMethodStats(req.startDate(), req.endDate(), req.paymentMethodId());
        BigDecimal totalRevenue = (BigDecimal) summaryMap.get("totalRevenue");
        List<RevenueStatisticResponse.PaymentMethodDto> paymentMethods = payRows.stream()
                .map(row -> {
                    BigDecimal rev = (BigDecimal) row[1];
                    double percent = totalRevenue.compareTo(BigDecimal.ZERO) == 0 ? 0.0 :
                            rev.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100)).doubleValue();
                    return new RevenueStatisticResponse.PaymentMethodDto((String) row[0], rev, percent);
                })
                .toList();

        // 5. Orders Page (phân trang + tìm kiếm + sort)
        Sort sort = Sort.by(req.sort().contains(",desc") ?
                        Sort.Direction.DESC : Sort.Direction.ASC,
                req.sort().split(",")[0]);
        Pageable pageable = PageRequest.of(req.page(), req.size(), sort);

        Page<Object[]> orderPage = statisticRepository.getOrderDetailsPage(
                req.startDate(), req.endDate(), req.search(), pageable);

        Page<RevenueStatisticResponse.OrderDetailDto> orders = orderPage.map(row -> new RevenueStatisticResponse.OrderDetailDto(
                String.valueOf(row[0]),           // order_id
                (String) row[1],                  // date formatted
                (String) row[2],                  // product name + config
                (Integer) row[3],                 // quantity
                (BigDecimal) row[4],              // unit_price_after
                (BigDecimal) row[5],              // revenue
                (BigDecimal) row[6],              // profit
                (String) row[7],                  // status
                (String) row[8]                   // payment_method_type
        ));

        return new RevenueStatisticResponse(chartData, paymentMethods, orders);
    }

    private Long toLong(Object obj) {
        if (obj == null) return 0L;
        if (obj instanceof Number n) return n.longValue();
        return 0L;
    }

    public SummaryDashboardResponse getSummaryCardDashboard() {
        LocalDateTime prevFrom = LocalDate.now().minusDays(1).atStartOfDay();
        LocalDateTime prevTo = LocalDate.now().minusDays(1).atTime(LocalTime.MAX);
        Map<String, Object> result = summaryCardRepository.getTopProductAsArray(LocalDate.now().with(DayOfWeek.MONDAY).toString(), LocalDate.now().toString());
        String topProduct = (String) result.get("bestSellerName");;


        Long revenue = summaryCardRepository.getRevenue(LocalDate.now().atStartOfDay().toString(), LocalDate.now().atTime(LocalTime.MAX).toString());
        Long orderCount = summaryCardRepository.getOrderCount(LocalDate.now().with(DayOfWeek.MONDAY).toString(), LocalDate.now().toString());
        Long profit = summaryCardRepository.getProfit(LocalDate.now().with(DayOfWeek.MONDAY).toString(), LocalDate.now().toString());

        Long revenuePrev = summaryCardRepository.getRevenue(prevFrom.toString(), prevTo.toString());
        Long profitPrev = summaryCardRepository.getProfit(LocalDate.now().with(DayOfWeek.MONDAY).minusWeeks(1).toString(), LocalDate.now().with(DayOfWeek.SUNDAY).atTime(LocalTime.MAX).minusWeeks(1).toString());
        Long ordersPrev = summaryCardRepository.getOrderCount(LocalDate.now().with(DayOfWeek.MONDAY).minusWeeks(1).toString(), LocalDate.now().with(DayOfWeek.SUNDAY).atTime(LocalTime.MAX).minusWeeks(1).toString());

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
            String searchEmail,
            String searchStaff
    ) {
        if (rangeType == null || rangeType.isEmpty()) {
            rangeType = "week";
        }
        if (orderStatus == null || orderStatus.isEmpty()) {
            orderStatus = "all";
        }

        List<Object[]> rows = summaryCardRepository.getRevenueAndOrdersByRange(
                fromDate,
                toDate,
                rangeType,
                orderStatus,
                searchEmail,
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

    public StatisticProductResponse getStatisticProduct(String from, String to) {

        // Top sản phẩm
        Object[] topArr = (Object[]) summaryCardRepository.getTopProduct(from, to);
        StatisticProductResponse.ProductInfoDTO topProduct = new StatisticProductResponse.ProductInfoDTO(
                topArr[0] != null ? (String) topArr[0] : "",
                ((Number) topArr[1]).longValue(),
                ((Number) topArr[2]).longValue()
        );

        // Top 10 sản phẩm
        List<StatisticProductResponse.ProductInfoDTO> topProducts = summaryCardRepository.getTopProducts(from, to).stream().map(o -> {
            Object[] arr = (Object[]) o;
            return new StatisticProductResponse.ProductInfoDTO(
                    (String) arr[0],
                    ((Number) arr[1]).longValue(),
                    ((Number) arr[2]).longValue()
            );
        }).toList();

        // Tổng số lượng
        Long totalQuantity = summaryCardRepository.getTotalQuantity(from, to);
        if (totalQuantity == null) totalQuantity = 0L;

        // Sản phẩm tồn kho
        Object[] invArr = (Object[]) summaryCardRepository.getInventoryProduct();
        StatisticProductResponse.ProductInfoDTO inventoryProduct = new StatisticProductResponse.ProductInfoDTO(
                (String) invArr[0],
                0L,
                ((Number) invArr[1]).longValue()
        );

        List<StatisticProductResponse.BrandRevenueDTO> byBrand = summaryCardRepository.getByBrand(from, to).stream().map(o -> {
            Object[] arr = (Object[]) o;
            return new StatisticProductResponse.BrandRevenueDTO(
                    (String) arr[0],                   // brand name
                    (((Number) arr[1]).longValue()) // tổng số lượng bán
            );
        }).toList();

        return new StatisticProductResponse(
                topProduct,
                totalQuantity,
                inventoryProduct,
                topProducts,
                byBrand
        );
    }
}
