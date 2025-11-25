package com.websales.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;

@Controller
@Slf4j
public class PaymentRedirectController {

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Handle redirect từ PayOS sau khi thanh toán thành công
     * Redirect về frontend với các query params
     */
    @GetMapping("/payment/success")
    public RedirectView paymentSuccess(
            @RequestParam(required = false) Integer orderId,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String cancel,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long orderCode) {
        
        log.info("Payment success redirect - orderId: {}, status: {}, orderCode: {}", orderId, status, orderCode);
        
        // Build redirect URL với query params
        StringBuilder redirectUrl = new StringBuilder(frontendUrl.split(",")[0].trim()); // Lấy URL đầu tiên
        redirectUrl.append("/payment/success");
        
        boolean hasParams = false;
        if (orderId != null) {
            redirectUrl.append(hasParams ? "&" : "?").append("orderId=").append(orderId);
            hasParams = true;
        }
        if (status != null) {
            redirectUrl.append(hasParams ? "&" : "?").append("status=").append(status);
            hasParams = true;
        }
        if (orderCode != null) {
            redirectUrl.append(hasParams ? "&" : "?").append("orderCode=").append(orderCode);
            hasParams = true;
        }
        if (code != null) {
            redirectUrl.append(hasParams ? "&" : "?").append("code=").append(code);
            hasParams = true;
        }
        if (id != null) {
            redirectUrl.append(hasParams ? "&" : "?").append("id=").append(id);
        }
        
        return new RedirectView(redirectUrl.toString());
    }

    /**
     * Handle redirect từ PayOS khi hủy thanh toán
     * Redirect về frontend với các query params
     */
    @GetMapping("/payment/cancel")
    public RedirectView paymentCancel(
            @RequestParam(required = false) Integer orderId,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String cancel,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long orderCode) {
        
        log.info("Payment cancel redirect - orderId: {}, orderCode: {}", orderId, orderCode);
        
        // Build redirect URL với query params
        StringBuilder redirectUrl = new StringBuilder(frontendUrl.split(",")[0].trim()); // Lấy URL đầu tiên
        redirectUrl.append("/payment/cancel");
        
        boolean hasParams = false;
        if (orderId != null) {
            redirectUrl.append(hasParams ? "&" : "?").append("orderId=").append(orderId);
            hasParams = true;
        }
        if (orderCode != null) {
            redirectUrl.append(hasParams ? "&" : "?").append("orderCode=").append(orderCode);
            hasParams = true;
        }
        if (code != null) {
            redirectUrl.append(hasParams ? "&" : "?").append("code=").append(code);
            hasParams = true;
        }
        if (id != null) {
            redirectUrl.append(hasParams ? "&" : "?").append("id=").append(id);
        }
        
        return new RedirectView(redirectUrl.toString());
    }
}

