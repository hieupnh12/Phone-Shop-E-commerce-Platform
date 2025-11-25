package com.websales.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.exception.APIException;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.webhooks.WebhookData;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class PayOSService {

    final PayOS payOS;

    @Value("${server.servlet.context-path:/phoneShop}")
    String contextPath;

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    String allowedOrigins;

    /**
     * Tạo payment link từ PayOS
     * @param orderCode Mã đơn hàng (order ID)
     * @param amount Số tiền thanh toán
     * @param description Mô tả đơn hàng
     * @param returnUrl URL trả về sau khi thanh toán thành công
     * @param cancelUrl URL trả về khi hủy thanh toán
     * @param items Danh sách sản phẩm (optional)
     * @return CreatePaymentLinkResponse chứa checkoutUrl và QR code
     */
    public CreatePaymentLinkResponse createPaymentLink(
            long orderCode,
            BigDecimal amount,
            String description,
            String returnUrl,
            String cancelUrl,
            PaymentLinkItem... items) {
        try {
            // PayOS nhận amount trực tiếp bằng VND (đồng), không cần nhân 1000
            long amountLong = amount.longValue();

            CreatePaymentLinkRequest.CreatePaymentLinkRequestBuilder builder = CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount(amountLong)
                    .description(description != null ? description : "Thanh toán đơn hàng")
                    .returnUrl(returnUrl)
                    .cancelUrl(cancelUrl);

            if (items != null && items.length > 0) {
                for (PaymentLinkItem item : items) {
                    builder.item(item);
                }
            } else {
                // Tạo item mặc định nếu không có items
                PaymentLinkItem defaultItem = PaymentLinkItem.builder()
                        .name("Đơn hàng #" + orderCode)
                        .quantity(1)
                        .price(amountLong)
                        .build();
                builder.item(defaultItem);
            }

            CreatePaymentLinkRequest paymentData = builder.build();

            log.info("Creating PayOS payment link for order code: {}, amount: {}", orderCode, amountLong);
            CreatePaymentLinkResponse response = payOS.paymentRequests().create(paymentData);
            log.info("PayOS payment link created successfully. Checkout URL: {}", response.getCheckoutUrl());

            return response;
        } catch (APIException e) {
            log.error("PayOS API error: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo payment link từ PayOS: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error creating PayOS payment link: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi khi tạo payment link: " + e.getMessage(), e);
        }
    }

    /**
     * Lấy thông tin payment link theo order code
     */
    public PaymentLink getPaymentLink(long orderCode) {
        try {
            return payOS.paymentRequests().get(orderCode);
        } catch (APIException e) {
            log.error("PayOS API error when getting payment link: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể lấy thông tin payment link: " + e.getMessage(), e);
        }
    }

    /**
     * Hủy payment link
     */
    public PaymentLink cancelPaymentLink(long orderCode, String cancellationReason) {
        try {
            return payOS.paymentRequests().cancel(orderCode, cancellationReason != null ? cancellationReason : "Hủy thanh toán");
        } catch (APIException e) {
            log.error("PayOS API error when canceling payment link: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể hủy payment link: " + e.getMessage(), e);
        }
    }

    /**
     * Verify webhook từ PayOS
     */
    public WebhookData verifyWebhook(Object webhookBody) {
        try {
            return payOS.webhooks().verify(webhookBody);
        } catch (Exception e) {
            log.error("Error verifying PayOS webhook: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi khi verify webhook: " + e.getMessage(), e);
        }
    }

    /**
     * Tạo return URL và cancel URL từ base URL
     */
    public String getBaseUrl(String scheme, String serverName, int serverPort) {
        String baseUrl = scheme + "://" + serverName;
        if ((scheme.equals("http") && serverPort != 80) || (scheme.equals("https") && serverPort != 443)) {
            baseUrl += ":" + serverPort;
        }
        baseUrl += contextPath;
        return baseUrl;
    }
}
