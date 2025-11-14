package com.websales.controller;

import java.util.List;

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
}
