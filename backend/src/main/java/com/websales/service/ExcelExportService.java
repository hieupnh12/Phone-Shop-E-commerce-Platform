package com.websales.service;

import com.websales.dto.response.StatisticSummaryResponse;
import com.websales.dto.response.SummaryDashboardResponse;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelExportService {

    public ByteArrayInputStream generateReportExcel(
            List<StatisticSummaryResponse> timelineData,
            SummaryDashboardResponse summary) throws IOException {

        XSSFWorkbook workbook = new XSSFWorkbook();

        // ----- Sheet 1: Timeline -----
        XSSFSheet sheet1 = workbook.createSheet("Timeline");
        int rowIdx = 0;

        // Header
        Row header = sheet1.createRow(rowIdx++);
        String[] columns = {"Date", "Orders", "Revenue", "Cost", "Benefit", "Top Product"};
        for (int i = 0; i < columns.length; i++) {
            header.createCell(i).setCellValue(columns[i]);
        }

        // Data
        for (StatisticSummaryResponse item : timelineData) {
            Row row = sheet1.createRow(rowIdx++);
            row.createCell(0).setCellValue(item.getDate());
            row.createCell(1).setCellValue(item.getOrders());
            row.createCell(2).setCellValue(item.getRevenue().doubleValue());
            row.createCell(3).setCellValue(item.getCost().doubleValue());
            row.createCell(4).setCellValue(item.getBenefit().doubleValue());
            row.createCell(5).setCellValue(item.getTopProduct());
        }

        for (int i = 0; i < columns.length; i++) sheet1.autoSizeColumn(i);

        // ----- Sheet 2: Summary -----
        XSSFSheet sheet2 = workbook.createSheet("Summary");
        rowIdx = 0;

        Row row0 = sheet2.createRow(rowIdx++);
        row0.createCell(0).setCellValue("Revenue");
        row0.createCell(1).setCellValue(summary.revenue().value());

        Row row1 = sheet2.createRow(rowIdx++);
        row1.createCell(0).setCellValue("Profit");
        row1.createCell(1).setCellValue(summary.profit().value());

        Row row2 = sheet2.createRow(rowIdx++);
        row2.createCell(0).setCellValue("Order Count");
        row2.createCell(1).setCellValue(summary.orderCount().value());

        Row row3 = sheet2.createRow(rowIdx++);
        row3.createCell(0).setCellValue("Top Product");
        row3.createCell(1).setCellValue(summary.topProduct().value());

        for (int i = 0; i < 2; i++) sheet2.autoSizeColumn(i);

        // Export
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        return new ByteArrayInputStream(out.toByteArray());
    }


}
