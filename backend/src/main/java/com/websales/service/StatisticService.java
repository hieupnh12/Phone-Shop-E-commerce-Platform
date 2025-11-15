package com.websales.service;

import java.util.List;

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
}
