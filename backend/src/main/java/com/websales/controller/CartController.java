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
import com.websales.repository.PaymentMethodRepository;
import com.websales.repository.PaymentTransactionRepository;
import com.websales.repository.ProductVersionRepository;
import com.websales.service.OrderService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    public CartController(CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductVersionRepository productVersionRepository,
            OrderService orderService,
            PaymentMethodRepository paymentMethodRepository,
            PaymentTransactionRepository paymentTransactionRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productVersionRepository = productVersionRepository;
        this.orderService = orderService;
        this.paymentMethodRepository = paymentMethodRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
    }

    // --- GET GIỎ HÀNG ---
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional(readOnly = true)
    public ResponseEntity<?> getCart(@AuthenticationPrincipal Jwt jwt) {
        // Lấy customerId từ JWT token
        Long customerId = Long.valueOf(jwt.getSubject());

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
                    String image = (pv.getImages() != null && !pv.getImages().isEmpty())
                            ? pv.getImage()
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


    // --- TẠO ĐƠN HÀNG (CHECKOUT) ---
    @PostMapping(value = "/checkout", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> checkout(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> orderData) {
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
        String address = (String) orderData.get("address");
        
        // Lấy hoặc tạo PaymentMethod
        PaymentMethod paymentMethod = paymentMethodRepository.findByPaymentMethodType(finalPaymentMethodStr)
                .orElseGet(() -> {
                    // Tạo payment method mới nếu chưa tồn tại
                    PaymentMethod newMethod = PaymentMethod.builder()
                            .paymentMethodType(finalPaymentMethodStr)
                            .provider(finalPaymentMethodStr.equals("cod") ? "COD" : "BANK")
                            .status(true)
                            .build();
                    return paymentMethodRepository.save(newMethod);
                });
        
        // Xác định payment status dựa trên payment method
        boolean isPaid = "bank".equals(finalPaymentMethodStr); // Nếu là bank transfer thì coi như đã thanh toán
        OrderStatus status = isPaid ? OrderStatus.PAID : OrderStatus.PENDING;
        PaymentStatus paymentStatus = isPaid ? PaymentStatus.SUCCESS : PaymentStatus.PENDING;

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

        // Tạo PaymentTransaction
        String transactionId = "TXN-" + System.currentTimeMillis() + "-" + order.getOrderId();
        String transactionCode = "CODE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        PaymentTransaction paymentTransaction = PaymentTransaction.builder()
                .transactionId(transactionId)
                .transactionCode(transactionCode)
                .orderId(order.getOrderId())
                .paymentMethod(paymentMethod)
                .amountUsed(totalAmount)
                .paymentStatus(paymentStatus)
                .transactionType(TransactionType.PAYMENT)
                .responseMessage(isPaid ? "Thanh toán thành công" : "Chờ thanh toán khi nhận hàng")
                .address(address)
                .paymentTime(LocalDateTime.now())
                .build();
        
        paymentTransactionRepository.save(paymentTransaction);

        // Xóa cart items sau khi tạo order thành công
        // Sử dụng orphanRemoval: clear collection và save cart sẽ tự động xóa cart items
        // Giữ cart status = true để cart luôn active
        cart.getCartItems().clear();
        cart.setUpdateDate(LocalDateTime.now());
        cartRepository.save(cart);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "orderId", order.getOrderId(),
                "transactionId", transactionId,
                "transactionCode", transactionCode,
                "message", "Đặt hàng thành công!"));
    }
}