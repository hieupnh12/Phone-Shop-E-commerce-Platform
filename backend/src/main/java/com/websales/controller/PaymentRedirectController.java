package com.websales.controller;

import com.websales.entity.Order;
import com.websales.entity.PaymentTransaction;
import com.websales.enums.OrderStatus;
import com.websales.enums.PaymentStatus;
import com.websales.repository.CartRepository;
import com.websales.repository.OrderRepository;
import com.websales.repository.PaymentTransactionRepository;
import com.websales.service.OrderService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentRedirectController {

    final String frontendUrl;
    final OrderRepository orderRepository;
    final PaymentTransactionRepository paymentTransactionRepository;
    final CartRepository cartRepository;
    final OrderService orderService;

    @Autowired
    public PaymentRedirectController(
            @Value("${app.cors.allowed-origins:http://localhost:3000}") String frontendUrl,
            OrderRepository orderRepository,
            PaymentTransactionRepository paymentTransactionRepository,
            CartRepository cartRepository,
            OrderService orderService) {
        this.frontendUrl = frontendUrl;
        this.orderRepository = orderRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.cartRepository = cartRepository;
        this.orderService = orderService;
    }

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
        
        // Xử lý cập nhật order và xóa giỏ hàng khi redirect về từ PayOS
        try {
            // Nếu có orderCode, tìm transaction và cập nhật order
            if (orderCode != null) {
                PaymentTransaction transaction = paymentTransactionRepository
                        .findByTransactionCode("PAYOS-" + orderCode)
                        .orElse(null);
                
                if (transaction != null) {
                    Integer transactionOrderId = transaction.getOrderId();
                    Order order = orderRepository.findById(transactionOrderId).orElse(null);
                    
                    if (order != null && !Boolean.TRUE.equals(order.getIsPaid())) {
                        // Cập nhật order status và isPaid
                        order.setStatus(OrderStatus.PAID);
                        order.setIsPaid(true);
                        order.setEndDatetime(LocalDateTime.now());
                        orderRepository.save(order);
                        
                        // Cập nhật transaction status
                        transaction.setPaymentStatus(PaymentStatus.SUCCESS);
                        transaction.setResponseMessage("Thanh toán thành công qua PayOS. Order Code: " + orderCode);
                        paymentTransactionRepository.save(transaction);
                        
                        // Trừ số lượng sản phẩm trong kho khi thanh toán PayOS thành công
                        try {
                            orderService.reduceStockFromOrder(transactionOrderId);
                            log.info("Stock reduced for order {} after successful PayOS payment redirect", transactionOrderId);
                        } catch (Exception e) {
                            log.error("Error reducing stock for order {}: {}", transactionOrderId, e.getMessage(), e);
                        }
                        
                        // Xóa cart items sau khi thanh toán thành công
                        if (order.getCustomerId() != null && order.getCustomerId().getCustomerId() != null) {
                            Long customerId = order.getCustomerId().getCustomerId();
                            cartRepository.findFirstByCustomerIdAndStatus(customerId, true)
                                    .ifPresent(cart -> {
                                        cart.getCartItems().clear();
                                        cart.setUpdateDate(LocalDateTime.now());
                                        cartRepository.save(cart);
                                        log.info("Cart cleared for customer {} after successful PayOS payment redirect", customerId);
                                    });
                        }
                        
                        log.info("Order {} updated to PAID and cart cleared via redirect handler", transactionOrderId);
                    }
                }
            } else if (orderId != null) {
                // Nếu chỉ có orderId, thử cập nhật trực tiếp
                Order order = orderRepository.findById(orderId).orElse(null);
                if (order != null && !Boolean.TRUE.equals(order.getIsPaid())) {
                    // Kiểm tra xem đây có phải là đơn PayOS không (thông qua transactionCode)
                    boolean isPayOSOrder = paymentTransactionRepository.findByOrderId(orderId).stream()
                            .anyMatch(t -> t.getTransactionCode() != null && 
                                    t.getTransactionCode().startsWith("PAYOS-"));
                    
                    order.setStatus(OrderStatus.PAID);
                    order.setIsPaid(true);
                    order.setEndDatetime(LocalDateTime.now());
                    orderRepository.save(order);
                    
                    // Trừ số lượng sản phẩm trong kho chỉ khi là đơn PayOS
                    if (isPayOSOrder) {
                        try {
                            orderService.reduceStockFromOrder(orderId);
                            log.info("Stock reduced for order {} after successful PayOS payment redirect", orderId);
                        } catch (Exception e) {
                            log.error("Error reducing stock for order {}: {}", orderId, e.getMessage(), e);
                        }
                    }
                    
                    // Xóa cart
                    if (order.getCustomerId() != null && order.getCustomerId().getCustomerId() != null) {
                        Long customerId = order.getCustomerId().getCustomerId();
                        cartRepository.findFirstByCustomerIdAndStatus(customerId, true)
                                .ifPresent(cart -> {
                                    cart.getCartItems().clear();
                                    cart.setUpdateDate(LocalDateTime.now());
                                    cartRepository.save(cart);
                                    log.info("Cart cleared for customer {} after successful payment redirect", customerId);
                                });
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error processing payment success redirect: {}", e.getMessage(), e);
            // Vẫn redirect về frontend dù có lỗi
        }
        
        // Build redirect URL với query params
        StringBuilder redirectUrl = new StringBuilder(frontendUrl.split(",")[0].trim()); // Lấy URL đầu tiên
        redirectUrl.append("/user/payment/success");
        
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
     * Xóa order và payment transaction nếu chưa thanh toán
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
        
        // Xử lý xóa order nếu user hủy thanh toán PayOS
        try {
            Order orderToDelete = null;
            
            // Tìm order qua orderCode (PayOS)
            if (orderCode != null) {
                PaymentTransaction transaction = paymentTransactionRepository
                        .findByTransactionCode("PAYOS-" + orderCode)
                        .orElse(null);
                
                if (transaction != null) {
                    orderToDelete = orderRepository.findById(transaction.getOrderId()).orElse(null);
                }
            } 
            // Hoặc tìm qua orderId
            else if (orderId != null) {
                orderToDelete = orderRepository.findById(orderId).orElse(null);
            }
            
            // Xóa order nếu chưa thanh toán (isPaid = false) và là đơn PayOS
            if (orderToDelete != null && !Boolean.TRUE.equals(orderToDelete.getIsPaid())) {
                // Kiểm tra xem có phải đơn PayOS không
                boolean isPayOSOrder = paymentTransactionRepository.findByOrderId(orderToDelete.getOrderId()).stream()
                        .anyMatch(t -> t.getTransactionCode() != null && 
                                t.getTransactionCode().startsWith("PAYOS-"));
                
                if (isPayOSOrder) {
                    log.info("Deleting unpaid PayOS order {} due to payment cancellation", orderToDelete.getOrderId());
                    
                    // Xóa payment transactions trước
                    List<PaymentTransaction> transactions = paymentTransactionRepository.findByOrderId(orderToDelete.getOrderId());
                    paymentTransactionRepository.deleteAll(transactions);
                    log.info("Deleted {} payment transactions for order {}", transactions.size(), orderToDelete.getOrderId());
                    
                    // Xóa order (sẽ cascade xóa order details)
                    orderRepository.delete(orderToDelete);
                    log.info("Deleted order {} due to payment cancellation", orderToDelete.getOrderId());
                }
            }
        } catch (Exception e) {
            log.error("Error deleting order on payment cancel: {}", e.getMessage(), e);
            // Vẫn redirect về frontend dù có lỗi
        }
        
        // Build redirect URL với query params
        StringBuilder redirectUrl = new StringBuilder(frontendUrl.split(",")[0].trim()); // Lấy URL đầu tiên
        redirectUrl.append("/user/payment/cancel");
        
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

