package com.websales.service;

import com.websales.dto.request.OrderStatusNotificationTriggerRequest;
import com.websales.entity.Order;
import com.websales.enums.OrderStatus;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MobileNotificationTriggerService {

    RestClient restClient;
    boolean enabled;
    String triggerUrl;

    public MobileNotificationTriggerService(
            RestClient.Builder restClientBuilder,
            @Value("${app.mobile-notification.enabled:true}") boolean enabled,
            @Value("${app.mobile-notification.trigger-url}") String triggerUrl) {
        this.restClient = restClientBuilder.build();
        this.enabled = enabled;
        this.triggerUrl = triggerUrl;
    }

    public void triggerOrderStatus(Integer orderId, String status, boolean confirmPayment) {
        if (!enabled || orderId == null || status == null || status.isBlank()) {
            return;
        }

        OrderStatusNotificationTriggerRequest body = OrderStatusNotificationTriggerRequest.builder()
                .orderId(orderId)
                .status(status)
                .confirmPayment(confirmPayment ? true : null)
                .build();

        try {
            restClient.post()
                    .uri(triggerUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Triggered mobile notification for order {} with status {}{}",
                    orderId, status, confirmPayment ? " (confirmPayment)" : "");
        } catch (Exception e) {
            log.warn("Failed to trigger mobile notification for order {}: {}", orderId, e.getMessage());
        }
    }

    public void notifyAfterOrderStatusChange(Order order, OrderStatus oldStatus, boolean codPaymentConfirmed) {
        if (order == null || order.getOrderId() == null || order.getStatus() == null) {
            return;
        }
        if (oldStatus == order.getStatus()) {
            return;
        }

        if (codPaymentConfirmed) {
            triggerOrderStatus(order.getOrderId(), OrderStatus.COMPLETED.name(), true);
            return;
        }

        triggerOrderStatus(order.getOrderId(), order.getStatus().name(), false);
    }
}
