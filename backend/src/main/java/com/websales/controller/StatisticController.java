package com.websales.controller;

import java.time.LocalDate;
import java.util.List;

import com.websales.dto.request.RevenueStatisticRequest;
import com.websales.dto.response.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.websales.service.StatisticService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/statistic")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class StatisticController {
    StatisticService statisticService;


    @GetMapping
    public ApiResponse<List<StatisticSummaryResponse>> getStatisticSummary(@RequestParam(defaultValue = "7") int days) {
        ApiResponse<List<StatisticSummaryResponse>> listStatistic = new ApiResponse<>();
        listStatistic.setCode(HttpStatus.OK.value());
        listStatistic.setMessage("List 7 day summary statistic");
        listStatistic.setResult(statisticService.getStatisticsLastDays(days));
        return listStatistic;
    }

    @GetMapping("/summary_dashboard")
    public ApiResponse<SummaryDashboardResponse> summaryStatistic() {
        ApiResponse<SummaryDashboardResponse> summaryStatistic = new ApiResponse<>();
        summaryStatistic.setCode(HttpStatus.OK.value());
        summaryStatistic.setMessage("Summary statistic");
        summaryStatistic.setResult(statisticService.getSummaryCardDashboard());
        return summaryStatistic;
    }

    @GetMapping("/revenue")
    public ApiResponse<RevenueStatisticResponse> getRevenueStatistic(
            @RequestParam(required = false) String startDate,                    // yyyy-MM-dd
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "all") String paymentMethodId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "create_datetime,desc") String sort,
            @RequestParam(defaultValue = "rangeType") String rangeType
    ) {
        RevenueStatisticRequest request = RevenueStatisticRequest.builder()
                .startDate((startDate))
                .endDate((endDate))
                .paymentMethodId("all".equals(paymentMethodId) ? null : Long.valueOf(paymentMethodId))
                .page(page)
                .size(size)
                .search(search)
                .sort(sort)
                .rangeType(rangeType)
                .build();

        ApiResponse<RevenueStatisticResponse> response = new ApiResponse<>();
        response.setCode(HttpStatus.OK.value());
        response.setMessage("Revenue statistic");
        response.setResult(statisticService.getRevenueStatistics(request));
        return response;
    }

    @GetMapping("/summary_order")
    public ApiResponse<SummaryOrderResponse> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        ApiResponse<SummaryOrderResponse> summaryOrder = new ApiResponse<>();
        summaryOrder.setCode(HttpStatus.OK.value());
        summaryOrder.setMessage("Summary order");
        summaryOrder.setResult(statisticService.getSummaryOrder(fromDate, toDate));
        return summaryOrder;
    }

    @GetMapping("/summary_revenue")
    public ApiResponse<SummaryRevenueResponse> summaryStatisticRevenue() {
        ApiResponse<SummaryRevenueResponse> summaryRevenue = new ApiResponse<>();
        summaryRevenue.setCode(HttpStatus.OK.value());
        summaryRevenue.setMessage("Summary revenue statistic");
        summaryRevenue.setResult(statisticService.getSummaryRevenue());
        return summaryRevenue;
    }

    @GetMapping("/order")
    public ApiResponse<List<StatisticOrderResponse>> getTimelineData(
            @RequestParam(name = "startDate", required = false) String fromDate,
            @RequestParam(name = "endDate", required = false)   String toDate,
            @RequestParam(name = "rangeType", required = false) String rangeType,
            @RequestParam(name = "orderStatus", required = false, defaultValue = "all") String orderStatus,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "searchStaff", required = false) String searchStaff
    ) {

        // 2. Gọi Service để lấy dữ liệu
        List<StatisticOrderResponse> timelineData = statisticService.getTimelineAnalytics(
                fromDate,
                toDate,
                rangeType,
                orderStatus,
                search,
                searchStaff
        );
        ApiResponse<List<StatisticOrderResponse>> response = new ApiResponse<>();
        response.setCode(HttpStatus.OK.value());
        response.setMessage("Timeline statistic");
        response.setResult(timelineData);
        return response;
    }

    @GetMapping("/products")
    public ApiResponse<StatisticProductResponse> getProductStatistics(
            @RequestParam(name = "startDate", required = false) String fromDate,
            @RequestParam(name = "endDate", required = false)   String toDate
    ) {
        ApiResponse<StatisticProductResponse> response = new ApiResponse<>();
        response.setCode(HttpStatus.OK.value());
        response.setMessage("Product statistic");
        response.setResult(statisticService.getStatisticProduct(fromDate, toDate));
        return response;
    }
}
