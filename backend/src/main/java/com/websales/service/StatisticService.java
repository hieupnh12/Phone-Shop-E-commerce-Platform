package com.websales.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.websales.dto.response.StatisticSummaryResponse;
import com.websales.repository.StatisticRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

// @Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StatisticService {
    // StatisticRepository statisticRepository;

    // public List<StatisticSummaryResponse> listSummaryStatistic() {
    //     return statisticRepository.listSummaryStatistic();
    // }
}
