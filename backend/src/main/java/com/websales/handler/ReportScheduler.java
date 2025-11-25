package com.websales.handler;

import com.websales.dto.response.StatisticSummaryResponse;
import com.websales.dto.response.SummaryDashboardResponse;
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
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReportScheduler {
    private final ReportConfig config;
    private final EmailService emailService;
    private final ExcelExportService excelExportService;
    private final StatisticService statisticService;
    private LocalDate lastSentDate = null;

    @Scheduled(fixedRate = 60_000) // chạy mỗi phút kiểm tra giờ gửi
    public void checkAndSendReport() throws Exception {
        if (!config.isEnabled() || config.getRecipients().isEmpty()) return;

        LocalTime now = LocalTime.now();
        LocalTime target = LocalTime.parse(config.getSendTime());

        // chỉ gửi 1 lần trong ngày
        if (now.getHour() == target.getHour()
                && now.getMinute() == target.getMinute()
                && !LocalDate.now().equals(lastSentDate)) {

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
        DayOfWeek dayOfWeek = today.getDayOfWeek(); // MONDAY, TUESDAY ...

        if ("WEEKLY".equalsIgnoreCase(config.getReportType())) {
            // Chỉ gửi vào thứ 2
            if (dayOfWeek != DayOfWeek.MONDAY) return;
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
}
