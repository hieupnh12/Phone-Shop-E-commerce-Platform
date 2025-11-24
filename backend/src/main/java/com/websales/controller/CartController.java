package com.websales.controller;

import com.websales.dto.request.CartItemRequest;
import com.websales.dto.request.OrderRequest;
import com.websales.dto.response.CartItemResponse;
import com.websales.entity.*;
import com.websales.enums.OrderStatus;
import com.websales.enums.PaymentStatus;
import com.websales.enums.TransactionType;
import com.websales.repository.CartItemRepository;
import com.websales.repository.CartRepository;
import com.websales.repository.CustomerRepo;
import com.websales.repository.PaymentMethodRepository;
import com.websales.repository.PaymentTransactionRepository;
import com.websales.repository.ProductVersionRepository;
import com.websales.service.OrderService;
import com.websales.service.PayOSService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVersionRepository productVersionRepository;
    private final OrderService orderService;
    private final PaymentMethodRepository paymentMethodRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PayOSService payOSService;
    private final CustomerRepo customerRepo;

    public CartController(CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductVersionRepository productVersionRepository,
            OrderService orderService,
            PaymentMethodRepository paymentMethodRepository,
            PaymentTransactionRepository paymentTransactionRepository,
            PayOSService payOSService,
            CustomerRepo customerRepo) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productVersionRepository = productVersionRepository;
        this.orderService = orderService;
        this.paymentMethodRepository = paymentMethodRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.payOSService = payOSService;
        this.customerRepo = customerRepo;
    }

    // --- GET GIỎ HÀNG ---
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional(readOnly = true)
    public ResponseEntity<?> getCart() {
        // Lấy customerId từ JWT token
        var context = SecurityContextHolder.getContext();
        Long customerId = Long.parseLong(context.getAuthentication().getName());

        // Lấy cart ACTIVE của customer với cart items được eager fetch
        Optional<Cart> cartOpt = cartRepository.findFirstByCustomerIdAndStatusWithItems(customerId, true);
        
        List<CartItemResponse> cartItemsResp = new ArrayList<>();
        double grandTotal = 0;

        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            // Force load cart items nếu chưa được load
            if (cart.getCartItems() != null && !cart.getCartItems().isEmpty()) {
                for (CartItem item : cart.getCartItems()) {
                    // Chỉ lấy items có status = true
                    if (item.getStatus() == null || !item.getStatus()) {
                        continue;
                    }
                    
                    ProductVersion pv = item.getProductVersion();
                    if (pv == null) {
                        continue;
                    }
                    
                    // Force load product từ productVersion
                    Product product = pv.getProduct();
                    if (product == null) {
                        continue;
                    }

                    double price = 0.0;
                    BigDecimal exportPrice = pv.getExportPrice();
                    if (exportPrice != null) {
                        price = exportPrice.doubleValue();
                    }

                    int qty = item.getQuantity() != null ? item.getQuantity() : 1;

                    // Lấy image từ productVersion nếu có, nếu không thì lấy từ product
                    String image = (pv.getPicture() != null && !pv.getPicture().isEmpty()) 
                            ? pv.getPicture() 
                            : (product.getImage() != null ? product.getImage() : "");

                    CartItemResponse resp = new CartItemResponse(
                            pv.getIdVersion(), // product_version_id
                            product.getIdProduct(),
                            product.getNameProduct(),
                            image,
                            price,
                            qty);
                    cartItemsResp.add(resp);
                    grandTotal += price * qty;
                }
            }
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "cartItems", cartItemsResp,
                "grandTotal", grandTotal));
    }

    // --- THÊM / CẬP NHẬT SẢN PHẨM VÀO GIỎ HÀNG (theo product_version_id) ---
    @PostMapping(value = "/add", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> addToCart(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CartItemRequest request) {
        // Lấy customerId từ JWT token
        Long customerId = Long.valueOf(jwt.getSubject());

        String productVersionId = request.getProductVersionId();
        if (productVersionId == null || productVersionId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Product version ID is required"));
        }

        // Lấy ProductVersion theo productVersionId
        Optional<ProductVersion> pvOpt = productVersionRepository.findById(productVersionId);
        if (pvOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Product version not found"));
        }

        // Lấy/ tạo cart ACTIVE cho customer
        Cart cart = cartRepository.findFirstByCustomerIdAndStatus(customerId, true)
                .orElseGet(() -> {
                    Cart c = Cart.builder()
                            .customerId(customerId)
                            .status(true)
                            .createDate(LocalDateTime.now())
                            .updateDate(LocalDateTime.now())
                            .build();
                    return cartRepository.save(c);
                });

        // Kiểm tra item đã có trong cart chưa
        Optional<CartItem> existed = cartItemRepository.findByCart_IdCartAndProductVersion_IdVersion(
                cart.getIdCart(), productVersionId);
        if (existed.isPresent()) {
            // Cập nhật quantity
            CartItem item = existed.get();
            int newQuantity = request.getQuantity() > 0 ? request.getQuantity() : 1;
            item.setQuantity(newQuantity);
            item.setStatus(true); // Đảm bảo status = true
            cartItemRepository.save(item);
        } else {
            // Tạo cart item mới
            int quantity = request.getQuantity() > 0 ? request.getQuantity() : 1;
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productVersion(pvOpt.get())
                    .quantity(quantity)
                    .status(true)
                    .build();
            cartItemRepository.save(newItem);
        }

        // Cập nhật update_date của cart
        cart.setUpdateDate(LocalDateTime.now());
        cartRepository.save(cart);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã thêm vào giỏ hàng"));
    }

    // --- CẬP NHẬT SỐ LƯỢNG (theo product_version_id) ---
    @PostMapping(value = "/update-quantity", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> updateQuantity(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> request) {
        // Lấy customerId từ JWT token
        Long customerId = Long.valueOf(jwt.getSubject());

        String productVersionId = (String) request.get("productVersionId");
        Integer quantity = (Integer) request.get("quantity");

        if (productVersionId == null || productVersionId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Product version ID is required"));
        }

        if (quantity == null || quantity < 1) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Quantity must be at least 1"));
        }

        // Tìm cart active của customer
        Optional<Cart> cartOpt = cartRepository.findFirstByCustomerIdAndStatus(customerId, true);
        if (cartOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Cart not found"));
        }

        // Tìm CartItem theo cart và productVersionId
        Optional<CartItem> itemOpt = cartItemRepository.findByCart_IdCartAndProductVersion_IdVersion(
                cartOpt.get().getIdCart(), productVersionId);

        if (itemOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Item not found in cart"));
        }

        // Cập nhật quantity và update_date của cart
        CartItem item = itemOpt.get();
        item.setQuantity(quantity);
        cartItemRepository.save(item);
        
        // Cập nhật update_date của cart
        Cart cart = cartOpt.get();
        cart.setUpdateDate(LocalDateTime.now());
        cartRepository.save(cart);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã cập nhật số lượng"));
    }

    // --- XÓA SẢN PHẨM KHỎI GIỎ HÀNG (theo product_version_id) ---
    @PostMapping(value = "/remove", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> removeCartItem(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CartItemRequest request) {
        // Lấy customerId từ JWT token
        Long customerId = Long.valueOf(jwt.getSubject());

        String productVersionId = request.getProductVersionId();
        if (productVersionId == null || productVersionId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Product version ID is required"));
        }

        // Tìm cart active để cập nhật update_date
        Optional<Cart> cartOpt = cartRepository.findFirstByCustomerIdAndStatus(customerId, true);
        
        cartItemRepository.deleteByCustomerIdAndProductVersionId(customerId, productVersionId);
        
        // Cập nhật update_date của cart
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            cart.setUpdateDate(LocalDateTime.now());
            cartRepository.save(cart);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã xóa sản phẩm khỏi giỏ hàng"));
    }

    // --- PREVIEW PAYMENT (TẠO PAYMENT LINK PREVIEW CHO QR CODE) ---
    @PostMapping(value = "/preview-payment", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional(readOnly = true)
    public ResponseEntity<?> previewPayment(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> orderData,
            HttpServletRequest request) {
        try {
            // Lấy customerId từ JWT token
            Long customerId = Long.valueOf(jwt.getSubject());

            // Lấy cart active của customer
            Optional<Cart> cartOpt = cartRepository.findFirstByCustomerIdAndStatus(customerId, true);
            if (cartOpt.isEmpty() || cartOpt.get().getCartItems() == null || cartOpt.get().getCartItems().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Cart is empty"));
            }

            Cart cart = cartOpt.get();

            // Tính total amount
            BigDecimal totalAmount;
            if (orderData.get("total") != null) {
                Object totalObj = orderData.get("total");
                if (totalObj instanceof Number) {
                    totalAmount = BigDecimal.valueOf(((Number) totalObj).doubleValue());
                } else {
                    totalAmount = new BigDecimal(totalObj.toString());
                }
            } else {
                totalAmount = BigDecimal.ZERO;
                for (CartItem item : cart.getCartItems()) {
                    if (item.getStatus() != null && item.getStatus() && item.getProductVersion() != null) {
                        BigDecimal price = item.getProductVersion().getExportPrice();
                        if (price != null) {
                            int qty = item.getQuantity() != null ? item.getQuantity() : 1;
                            totalAmount = totalAmount.add(price.multiply(BigDecimal.valueOf(qty)));
                        }
                    }
                }
            }

            // Tạo order code tạm thời (sẽ dùng order ID thật khi checkout)
            long tempOrderCode = System.currentTimeMillis() / 1000;

            // Tạo base URL
            String baseUrl = payOSService.getBaseUrl(
                    request.getScheme(),
                    request.getServerName(),
                    request.getServerPort());

            String returnUrl = baseUrl + "/payment/success";
            String cancelUrl = baseUrl + "/payment/cancel";
            String description = "Thanh toán đơn hàng #" + tempOrderCode;

            // Tạo payment link từ PayOS
            vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse payOSResponse = payOSService.createPaymentLink(
                    tempOrderCode,
                    totalAmount,
                    description,
                    returnUrl,
                    cancelUrl
            );

            // Trả về QR code và payment link
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", true);
            response.put("paymentLink", payOSResponse.getCheckoutUrl());
            if (payOSResponse.getQrCode() != null) {
                response.put("qrCode", payOSResponse.getQrCode());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Không thể tạo payment link: " + e.getMessage()));
        }
    }

    // --- TẠO ĐƠN HÀNG (CHECKOUT) ---
    @PostMapping(value = "/checkout", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> checkout(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> orderData,
            HttpServletRequest request) {
        // Lấy customerId từ JWT token
        Long customerId = Long.valueOf(jwt.getSubject());

        // Lấy cart active của customer
        Optional<Cart> cartOpt = cartRepository.findFirstByCustomerIdAndStatus(customerId, true);
        if (cartOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Cart not found"));
        }

        Cart cart = cartOpt.get();
        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Cart is empty"));
        }

        // Lấy total amount từ orderData hoặc tính từ cart
        BigDecimal totalAmount;
        if (orderData.get("total") != null) {
            Object totalObj = orderData.get("total");
            if (totalObj instanceof Number) {
                totalAmount = BigDecimal.valueOf(((Number) totalObj).doubleValue());
            } else {
                totalAmount = new BigDecimal(totalObj.toString());
            }
        } else {
            // Tính từ cart items
            totalAmount = BigDecimal.ZERO;
            for (CartItem item : cart.getCartItems()) {
                if (item.getStatus() != null && item.getStatus() && item.getProductVersion() != null) {
                    BigDecimal price = item.getProductVersion().getExportPrice();
                    if (price != null) {
                        int qty = item.getQuantity() != null ? item.getQuantity() : 1;
                        totalAmount = totalAmount.add(price.multiply(BigDecimal.valueOf(qty)));
                    }
                }
            }
        }

        // Lấy note từ orderData
        String note = (String) orderData.get("note");
        
        // Lấy payment method và address từ orderData
        String paymentMethodStr = (String) orderData.get("paymentMethod");
        if (paymentMethodStr == null || paymentMethodStr.isEmpty()) {
            paymentMethodStr = "cod"; // Mặc định là COD
        }
        final String finalPaymentMethodStr = paymentMethodStr; // Make it final for lambda
        
        // Lấy address từ orderData, nếu không có thì lấy từ thông tin khách hàng trong database
        String address = (String) orderData.get("address");
        if (address == null || address.isEmpty()) {
            // Lấy thông tin khách hàng từ database
            Optional<Customer> customerOpt = customerRepo.findById(customerId);
            if (customerOpt.isPresent()) {
                Customer customer = customerOpt.get();
                address = customer.getAddress();
            }
        }
        
        // Lấy hoặc tạo PaymentMethod
        PaymentMethod paymentMethod = paymentMethodRepository.findByPaymentMethodType(finalPaymentMethodStr)
                .orElseGet(() -> {
                    // Tạo payment method mới nếu chưa tồn tại
                    PaymentMethod newMethod = PaymentMethod.builder()
                            .paymentMethodType(finalPaymentMethodStr)
                            .provider(finalPaymentMethodStr.equals("cod") ? "COD" : "PAYOS")
                            .status(true)
                            .build();
                    return paymentMethodRepository.save(newMethod);
                });
        
        // Xác định payment status dựa trên payment method
        // Với PayOS, order sẽ ở trạng thái PENDING cho đến khi webhook xác nhận thanh toán thành công
        boolean isPaid = false; // PayOS: chưa thanh toán, chờ webhook
        OrderStatus status = OrderStatus.PENDING; // Tất cả đều PENDING ban đầu
        PaymentStatus paymentStatus = PaymentStatus.PENDING; // Chờ thanh toán

        String payOSPaymentLink = null;
        Long payOSOrderCode = null;

        // Nếu là bank (PayOS), tạo payment link
        if ("bank".equals(finalPaymentMethodStr)) {
            try {
                // Tạo order code từ order ID (sẽ tạo sau khi có order)
                // Tạm thời dùng timestamp, sẽ cập nhật sau
                payOSOrderCode = System.currentTimeMillis() / 1000;

                // Tạo base URL
                String baseUrl = payOSService.getBaseUrl(
                        request.getScheme(),
                        request.getServerName(),
                        request.getServerPort());

                String returnUrl = baseUrl + "/payment/success?orderId=";
                String cancelUrl = baseUrl + "/payment/cancel?orderId=";
                String description = "Thanh toán đơn hàng";

                // Tạo payment link từ PayOS (sẽ cập nhật order code sau)
                vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse payOSResponse =
                        payOSService.createPaymentLink(
                                payOSOrderCode,
                                totalAmount,
                                description,
                                returnUrl + "{orderId}",
                                cancelUrl + "{orderId}"
                        );

                payOSPaymentLink = payOSResponse.getCheckoutUrl();
            } catch (Exception e) {
                // Nếu không tạo được PayOS link, vẫn tạo order nhưng báo lỗi
                return ResponseEntity.status(500).body(Map.of(
                        "success", false,
                        "message", "Không thể tạo payment link từ PayOS: " + e.getMessage()));
            }
        }

        // Tạo OrderRequest từ cart items
        List<OrderRequest.OrderDetailRequest> orderDetails = cart.getCartItems().stream()
                .filter(item -> item.getStatus() != null && item.getStatus()) // Chỉ lấy items active
                .map(item -> {
                    ProductVersion pv = item.getProductVersion();
                    BigDecimal exportPrice = pv != null ? pv.getExportPrice() : BigDecimal.ZERO;
                    BigDecimal importPrice = pv != null ? pv.getImportPrice() : BigDecimal.ZERO;
                    
                    return OrderRequest.OrderDetailRequest.builder()
                            .productVersionId(pv != null ? pv.getIdVersion() : null)
                            .unitPriceBefore(importPrice)
                            .unitPriceAfter(exportPrice)
                            .quantity(item.getQuantity() != null ? item.getQuantity() : 1)
                            .build();
                })
                .filter(detail -> detail.getProductVersionId() != null) // Lọc bỏ null
                .toList();

        // Tạo Order
        OrderRequest orderRequest = OrderRequest.builder()
                .customerId(customerId)
                .employeeId(null) // Có thể set sau nếu cần
                .note(note)
                .totalAmount(totalAmount)
                .status(status)
                .isPaid(isPaid)
                .orderDetails(orderDetails)
                .build();

        // Lưu Order và OrderDetails
        Order order = orderService.createOrder(orderRequest);

        // Nếu là PayOS, cập nhật lại payment link với order ID thật
        if ("bank".equals(finalPaymentMethodStr) && payOSOrderCode != null) {
            try {
                // Hủy payment link cũ nếu cần (optional)
                // Tạo payment link mới với order ID thật
                long realOrderCode = order.getOrderId().longValue();

                String baseUrl = payOSService.getBaseUrl(
                        request.getScheme(),
                        request.getServerName(),
                        request.getServerPort());

                String returnUrl = baseUrl + "/payment/success?orderId=" + order.getOrderId();
                String cancelUrl = baseUrl + "/payment/cancel?orderId=" + order.getOrderId();
                String description = "Thanh toán đơn hàng #" + order.getOrderId();

                vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse payOSResponse =
                        payOSService.createPaymentLink(
                                realOrderCode,
                                totalAmount,
                                description,
                                returnUrl,
                                cancelUrl
                        );

                payOSPaymentLink = payOSResponse.getCheckoutUrl();
                payOSOrderCode = realOrderCode;
            } catch (Exception e) {
                // Log lỗi nhưng vẫn tiếp tục
                System.err.println("Error updating PayOS payment link: " + e.getMessage());
            }
        }

        // Tạo PaymentTransaction
        String transactionId = "TXN-" + System.currentTimeMillis() + "-" + order.getOrderId();
        String transactionCode = payOSOrderCode != null
                ? "PAYOS-" + payOSOrderCode
                : "CODE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        String responseMessage = "bank".equals(finalPaymentMethodStr)
                ? "Chờ thanh toán qua PayOS. Order Code: " + payOSOrderCode
                : "Chờ thanh toán khi nhận hàng";
        
        PaymentTransaction paymentTransaction = PaymentTransaction.builder()
                .transactionId(transactionId)
                .transactionCode(transactionCode)
                .orderId(order.getOrderId())
                .paymentMethod(paymentMethod)
                .amountUsed(totalAmount)
                .paymentStatus(paymentStatus)
                .transactionType(TransactionType.PAYMENT)
                .responseMessage(responseMessage)
                .address(address)
                .paymentTime(LocalDateTime.now())
                .build();
        
        paymentTransactionRepository.save(paymentTransaction);

        // Chỉ xóa cart items khi thanh toán thành công
        // - COD: xóa ngay vì không cần thanh toán online
        // - PayOS: KHÔNG xóa, sẽ xóa khi webhook xác nhận thanh toán thành công
        // Nếu hủy thanh toán, cart sẽ được giữ nguyên để user có thể thanh toán lại
        if ("cod".equals(finalPaymentMethodStr)) {
            // COD: xóa cart ngay vì đã xác nhận đặt hàng
            cart.getCartItems().clear();
            cart.setUpdateDate(LocalDateTime.now());
            cartRepository.save(cart);
        }
        // PayOS: giữ nguyên cart, sẽ xóa khi webhook xác nhận thanh toán thành công

        // Tạo response
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("orderId", order.getOrderId());
        response.put("transactionId", transactionId);
        response.put("transactionCode", transactionCode);
        response.put("message", "Đặt hàng thành công!");

        // Nếu là PayOS, thêm payment link và requiresPayment flag
        if ("bank".equals(finalPaymentMethodStr) && payOSPaymentLink != null) {
            response.put("requiresPayment", true);
            response.put("paymentLink", payOSPaymentLink);
        } else {
            response.put("requiresPayment", false);
        }

        return ResponseEntity.ok(response);
    }
}