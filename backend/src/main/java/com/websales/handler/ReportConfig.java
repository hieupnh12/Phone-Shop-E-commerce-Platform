package com.websales.handler;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Data
public class ReportConfig {
    private List<String> recipients = new ArrayList<>(List.of(
            "hieupnh12@gmail.com",
            "hieunmde180173@fpt.edu.vn"
    ));
    private String reportType = "WEEKLY";
    private String sendTime = "08:00";
    private boolean enabled = true;
}
