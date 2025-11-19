package com.websales.controller;

import java.time.LocalDate;
import java.util.List;

import com.websales.dto.request.RevenueStatisticRequest;
import com.websales.dto.response.RevenueStatisticResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.StatisticSummaryResponse;
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

    @GetMapping("/revenue")
    public ApiResponse<RevenueStatisticResponse> getRevenueStatistic(
            @RequestParam String startDate,                    // yyyy-MM-dd
            @RequestParam String endDate,
            @RequestParam(defaultValue = "all") String categoryId,
            @RequestParam(defaultValue = "all") String orderStatus,
            @RequestParam(defaultValue = "all") String paymentMethodId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createDatetime,desc") String sort
    ) {
        RevenueStatisticRequest request = RevenueStatisticRequest.builder()
                .startDate(LocalDate.parse(startDate))
                .endDate(LocalDate.parse(endDate))
                .categoryId("all".equals(categoryId) ? null : Long.valueOf(categoryId))
                .orderStatus("all".equals(orderStatus) ? null : orderStatus)
                .paymentMethodId("all".equals(paymentMethodId) ? null : Long.valueOf(paymentMethodId))
                .page(page)
                .size(size)
                .search(search)
                .sort(sort)
                .build();

        ApiResponse<RevenueStatisticResponse> response = new ApiResponse<>();
        response.setCode(HttpStatus.OK.value());
        response.setMessage("Revenue statistic");
        response.setResult(statisticService.getRevenueStatistics(request));
        return response;
    }
}
