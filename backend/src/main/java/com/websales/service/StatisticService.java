package com.websales.service;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

import com.websales.dto.request.RevenueStatisticRequest;
import com.websales.dto.response.RevenueStatisticResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.websales.dto.response.StatisticSummaryResponse;
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
                req.endDate().toString(),
                req.categoryId(),
                req.paymentMethodId()
        );

        // 2. Chart Data
        List<Object[]> chartRows = statisticRepository.getChartData(req.startDate(), req.endDate());
        List<RevenueStatisticResponse.ChartData> chartData = chartRows.stream()
                .map(row -> new RevenueStatisticResponse.ChartData((String) row[0], (BigDecimal) row[1], ((BigInteger) row[2]).longValue()))
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

        // Build Summary
        RevenueStatisticResponse.Summary summary = new RevenueStatisticResponse.Summary(
                (BigDecimal) summaryMap.get("totalRevenue"),
                ((BigInteger) summaryMap.get("totalOrders")).longValue(),
                (BigDecimal) summaryMap.get("totalProfit"),
                (String) summaryMap.get("bestSellerName"),
                ((BigInteger) summaryMap.get("bestSellerUnits")).longValue()
        );
        return new RevenueStatisticResponse(summary, chartData, paymentMethods, orders);
    }
}
