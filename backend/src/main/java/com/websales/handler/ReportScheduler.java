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
import org.springframework.transaction.annotation.Transactional;

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

    @Scheduled(fixedRate = 60_000)
    public void checkAndSendReport() {
        try {
            if (!config.isEnabled() || config.getRecipients().isEmpty()) {
                return;
            }

            LocalTime now = LocalTime.now();
            LocalTime target = LocalTime.parse(config.getSendTime());
            LocalDate today = LocalDate.now();
            DayOfWeek dayOfWeek = today.getDayOfWeek();

            // Chỉ gửi 1 lần trong ngày
            if (now.getHour() == target.getHour()
                    && now.getMinute() == target.getMinute()
                    && !today.equals(lastSentDate)) {

                // Kiểm tra điều kiện gửi theo loại báo cáo
                if ("WEEKLY".equalsIgnoreCase(config.getReportType())) {
                    // Gửi báo cáo tuần vào Chủ nhật (cuối tuần)
                    if (dayOfWeek != DayOfWeek.SUNDAY) {
                        return;
                    }
                }
                // DAILY có thể gửi mỗi ngày

                sendReportInternal();
                lastSentDate = today;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    public void sendReportNow() throws Exception {
        sendReportInternal();
        lastSentDate = LocalDate.now();
    }

    private void sendReportInternal() throws Exception {
        // Lấy dữ liệu từ service (luôn lấy 7 ngày gần nhất)
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
    // Chạy lúc 20:10 mỗi ngày
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional(readOnly = true)
    public void checkLowStockAndSend() {
        try {
            // Kiểm tra config có enabled không
            if (!config.isEnabled() || config.getRecipients().isEmpty()) {
                System.out.println(">>> Bỏ qua kiểm tra tồn kho: config disabled hoặc không có người nhận");
                return;
            }

            int threshold = 5;
            List<ProductVersion> lowStockProducts = statisticService.getLowStockProducts(threshold);

            if (lowStockProducts.isEmpty()) {
                System.out.println(">>> Không có sản phẩm nào gần hết hàng (threshold: " + threshold + ")");
                return;
            }

            List<String> admins = config.getRecipients();
            emailService.sendLowStockAlert(lowStockProducts, admins);
            System.out.println(">>> Đã gửi cảnh báo tồn kho cho " + lowStockProducts.size() + " sản phẩm lúc " + LocalTime.now());
        } catch (Exception e) {
            System.err.println(">>> Lỗi khi kiểm tra và gửi cảnh báo tồn kho: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
