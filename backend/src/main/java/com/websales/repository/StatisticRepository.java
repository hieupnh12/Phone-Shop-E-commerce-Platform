package com.websales.repository;

import java.util.List;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.websales.dto.response.StatisticSummaryResponse;
import com.websales.entity.Product;

// @Repository
public interface StatisticRepository extends JpaRepository<Product, Long> {
    
    // @Query("")
    // List<StatisticSummaryResponse> listSummaryStatistic();
}
