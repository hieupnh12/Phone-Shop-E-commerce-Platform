package com.websales.controller;

import com.websales.handler.ReportConfig;
import com.websales.handler.ReportScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/report-config")
@RequiredArgsConstructor
public class ReportConfigController {

    private final ReportConfig config; // cấu hình hiện tại
    private final ReportScheduler reportScheduler; // dùng để gửi báo cáo

    @PostMapping("/update")
    public ReportConfig update(@RequestBody ReportConfig newConfig) {
        config.setRecipients(newConfig.getRecipients());
        config.setReportType(newConfig.getReportType());
        config.setSendTime(newConfig.getSendTime());
        config.setEnabled(newConfig.isEnabled());
        return config;
    }

    @GetMapping
    public ReportConfig get() {
        return config;
    }

    @PostMapping("/send-now")
    public String sendNow() {
        try {
            reportScheduler.sendReportNow();
            return "Đã gửi báo cáo ngay lập tức tới: " + config.getRecipients();
        } catch (Exception e) {
            e.printStackTrace();
            return "Gửi báo cáo thất bại: " + e.getMessage();
        }
    }
}
