package com.websales.handler;

import com.websales.dto.response.StatisticSummaryResponse;
import com.websales.dto.response.SummaryDashboardResponse;
import com.websales.entity.ProductVersion;
import com.websales.service.EmailService;
import com.websales.service.ExcelExportService;
import com.websales.service.StatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReportScheduler {
    private final ReportConfig config;
    private final EmailService emailService;
    private final ExcelExportService excelExportService;
    private final StatisticService statisticService;
    private LocalDate lastSentDate = null;

    @Scheduled(fixedRate = 60_000)
    public void checkAndSendReport() throws Exception {
        if (!config.isEnabled() || config.getRecipients().isEmpty()) return;

        LocalTime now = LocalTime.now();
        LocalTime target = LocalTime.parse(config.getSendTime());
        DayOfWeek today = LocalDate.now().getDayOfWeek(); // thứ hiện tại

        // chỉ gửi 1 lần trong ngày
        if (now.getHour() == target.getHour()
                && now.getMinute() == target.getMinute()
                && !LocalDate.now().equals(lastSentDate)) {

            // chỉ gửi Weekly vào thứ Hai
            if ("WEEKLY".equalsIgnoreCase(config.getReportType()) && today != DayOfWeek.MONDAY) {
                return;
            }

            sendReportInternal();
            lastSentDate = LocalDate.now();
        }
    }


    public void sendReportNow() throws Exception {
        sendReportInternal();
        lastSentDate = LocalDate.now();
    }

    private void sendReportInternal() throws Exception {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;

        LocalDate today = LocalDate.now();
        DayOfWeek dayOfWeek = today.getDayOfWeek();

        if ("WEEKLY".equalsIgnoreCase(config.getReportType())) {

            if (dayOfWeek != DayOfWeek.SUNDAY) return;
            startDate = today.minusDays(6); // lấy tuần trước
            endDate = today;
        }

        // Lấy dữ liệu từ service
        List<StatisticSummaryResponse> timelineData = statisticService.getStatisticsLastDays(7);
        SummaryDashboardResponse summary = statisticService.getSummaryCardDashboard();

        // Tạo Excel
        ByteArrayInputStream excelFile = excelExportService.generateReportExcel(timelineData, summary);

        // Gửi email
        emailService.sendReportExcel(
                "Báo cáo " + config.getReportType(),
                config.getRecipients(),
                excelFile
        );

        System.out.println(">>> Đã gửi báo cáo " + config.getReportType() + " lúc " + LocalTime.now());
    }

    //second minute hour day-of-month month day-of-week
    @Scheduled(cron = "0 0 8 * * *")
    public void checkLowStockAndSend() {
        int threshold = 5;
        List<ProductVersion> lowStockProducts = statisticService.getLowStockProducts(threshold);

        List<String> admins = config.getRecipients();
        emailService.sendLowStockAlert(lowStockProducts, admins);
    }
}
