package com.websales.controller;

import com.websales.entity.Order;
import com.websales.entity.PaymentTransaction;
import com.websales.enums.OrderStatus;
import com.websales.enums.PaymentStatus;
import com.websales.repository.CartRepository;
import com.websales.repository.OrderRepository;
import com.websales.repository.PaymentTransactionRepository;
import com.websales.service.OrderService;
import com.websales.service.PayOSService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payment/payos")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PayOSWebhookController {

    PayOSService payOSService;
    OrderRepository orderRepository;
    PaymentTransactionRepository paymentTransactionRepository;
    CartRepository cartRepository;
    OrderService orderService;

    /**
     * Webhook handler từ PayOS
     * PayOS sẽ gửi webhook đến endpoint này khi có thay đổi về trạng thái thanh toán
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody Map<String, Object> webhookBody) {
        try {
            log.info("Received PayOS webhook: {}", webhookBody);

            // Verify webhook từ PayOS (quan trọng để đảm bảo webhook đến từ PayOS thật)
            @SuppressWarnings("unused")
            vn.payos.model.webhooks.WebhookData webhookData = payOSService.verifyWebhook(webhookBody);
            
            // Parse webhook data từ Map
            Long orderCode = null;
            String payOSStatus = null;
            
            // Lấy data từ webhook body
            Object dataObj = webhookBody.get("data");
            if (dataObj instanceof Map) {
                Map<?, ?> dataMap = (Map<?, ?>) dataObj;
                Object codeObj = dataMap.get("orderCode");
                if (codeObj instanceof Number) {
                    orderCode = ((Number) codeObj).longValue();
                } else if (codeObj instanceof String) {
                    try {
                        orderCode = Long.parseLong((String) codeObj);
                    } catch (NumberFormatException e) {
                        log.error("Invalid orderCode format: {}", codeObj);
                    }
                }
                payOSStatus = (String) dataMap.get("status");
            }
            
            if (orderCode == null) {
                log.error("Cannot extract orderCode from webhook data");
                return ResponseEntity.ok(Map.of("error", 0, "message", "Invalid webhook data"));
            }
            
            log.info("Webhook verified. Order Code: {}, Status: {}", orderCode, payOSStatus);
            
            // Tìm order theo order code (lưu trong transactionCode)
            PaymentTransaction transaction = paymentTransactionRepository
                    .findByTransactionCode("PAYOS-" + orderCode)
                    .orElse(null);

            if (transaction == null) {
                log.warn("Payment transaction not found for order code: {}", orderCode);
                return ResponseEntity.ok(Map.of("error", 0, "message", "Transaction not found"));
            }

            Integer orderId = transaction.getOrderId();
            Order order = orderRepository.findById(orderId)
                    .orElse(null);

            if (order == null) {
                log.warn("Order not found for order ID: {}", orderId);
                return ResponseEntity.ok(Map.of("error", 0, "message", "Order not found"));
            }

            // payOSStatus đã được lấy ở trên
            
            if ("PAID".equals(payOSStatus)) {
                // Thanh toán thành công
                order.setStatus(OrderStatus.PAID);
                order.setIsPaid(true);
                transaction.setPaymentStatus(PaymentStatus.SUCCESS);
                transaction.setResponseMessage("Thanh toán thành công qua PayOS. Order Code: " + orderCode);
                
                // Trừ số lượng sản phẩm trong kho khi thanh toán PayOS thành công
                try {
                    orderService.reduceStockFromOrder(orderId);
                    log.info("Stock reduced for order {} after successful PayOS payment", orderId);
                } catch (Exception e) {
                    log.error("Error reducing stock for order {}: {}", orderId, e.getMessage(), e);
                }
                
                // Xóa cart items sau khi thanh toán thành công
                if (order.getCustomerId() != null && order.getCustomerId().getCustomerId() != null) {
                    Long customerId = order.getCustomerId().getCustomerId();
                    cartRepository.findFirstByCustomerIdAndStatus(customerId, true)
                            .ifPresent(cart -> {
                                cart.getCartItems().clear();
                                cart.setUpdateDate(java.time.LocalDateTime.now());
                                cartRepository.save(cart);
                                log.info("Cart cleared for customer {} after successful PayOS payment", customerId);
                            });
                } else {
                    log.warn("Cannot clear cart: customerId is null for order {}", orderId);
                }
                
                log.info("Order {} payment successful via PayOS", orderId);
            } else if ("CANCELLED".equals(payOSStatus)) {
                // Thanh toán bị hủy
                order.setStatus(OrderStatus.CANCELED);
                transaction.setPaymentStatus(PaymentStatus.FAILED);
                transaction.setResponseMessage("Thanh toán bị hủy. Order Code: " + orderCode);
                
                log.info("Order {} payment cancelled via PayOS", orderId);
            } else {
                // Các trạng thái khác (PENDING, etc.)
                transaction.setResponseMessage("Trạng thái: " + payOSStatus + ". Order Code: " + orderCode);
                log.info("Order {} payment status: {}", orderId, payOSStatus);
            }

            // Lưu thay đổi
            orderRepository.save(order);
            paymentTransactionRepository.save(transaction);

            // Trả về response cho PayOS
            return ResponseEntity.ok(Map.of(
                    "error", 0,
                    "message", "success",
                    "data", Map.of("orderCode", orderCode)
            ));

        } catch (Exception e) {
            log.error("Error processing PayOS webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                    "error", -1,
                    "message", "Internal server error: " + e.getMessage()
            ));
        }
    }

    /**
     * Endpoint để test webhook (optional)
     */
    @GetMapping("/webhook/test")
    public ResponseEntity<?> testWebhook() {
        return ResponseEntity.ok(Map.of(
                "message", "PayOS webhook endpoint is active",
                "endpoint", "/payment/payos/webhook"
        ));
    }
}

