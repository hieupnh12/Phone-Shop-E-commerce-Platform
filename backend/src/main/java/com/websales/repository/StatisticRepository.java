package com.websales.repository;

import java.util.List;


import com.websales.configuration.StatsProcedureConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import com.websales.dto.response.StatisticSummaryResponse;
import com.websales.entity.Product;
import org.springframework.stereotype.Repository;

@Repository
public interface StatisticRepository extends JpaRepository<StatsProcedureConfig.StatsProcedure, Long> {
    
     @Procedure(name = "sp_GetSalesReportByDays")
     List<StatisticSummaryResponse> getSaleReportByDays(@Param("p_days") int days);
}
