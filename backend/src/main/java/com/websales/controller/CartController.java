package com.websales.controller;

import com.websales.dto.request.CartItemRequest;
import com.websales.dto.response.CartItemResponse;
import com.websales.entity.*;
import com.websales.repository.CartItemRepository;
import com.websales.repository.CartRepository;
import com.websales.repository.ProductItemRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductItemRepository productItemRepository;

    public CartController(CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductItemRepository productItemRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productItemRepository = productItemRepository;
    }

    // --- GET GIỎ HÀNG ---
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getCart(@SessionAttribute(name = "userId", required = false) String userId) {
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "User not logged in",
                    "cartItems", Collections.emptyList(),
                    "grandTotal", 0));
        }

        // Lấy TẤT CẢ cart của user (tuỳ bạn dùng chỉ ACTIVE thì đổi sang
        // findFirstByUserIdAndStatus(userId, true))
        List<Cart> cartList = cartRepository.findByUserId(userId);

        List<CartItemResponse> cartItemsResp = new ArrayList<>();
        double grandTotal = 0;

        for (Cart cart : cartList) {
            if (cart.getCartItems() == null)
                continue;
            for (CartItem item : cart.getCartItems()) {
                ProductItem pi = item.getProductItem();
                if (pi == null || pi.getVersionId() == null || pi.getVersionId().getProduct() == null)
                    continue;

                ProductVersion pv = pi.getVersionId();
                Product product = pv.getProduct();

                double price = 0.0;
                BigDecimal exportPrice = pv.getExportPrice();
                if (exportPrice != null)
                    price = exportPrice.doubleValue();

                int qty = item.getQuantity() != null ? item.getQuantity() : 1;

                CartItemResponse resp = new CartItemResponse(
                        pi.getImei(), // IMEI
                        product.getIdProduct(),
                        product.getNameProduct(),
                        product.getImage(),
                        price,
                        qty);
                cartItemsResp.add(resp);
                grandTotal += price * qty;
            }
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "cartItems", cartItemsResp,
                "grandTotal", grandTotal));
    }

    // --- THÊM / CẬP NHẬT SẢN PHẨM VÀO GIỎ HÀNG (theo IMEI) ---
    @PostMapping(value = "/add", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> addToCart(
            @SessionAttribute(name = "userId", required = false) String userId,
            @RequestBody CartItemRequest request) {
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "User not logged in"));
        }

        String imei = request.getImei();
        if (imei == null || imei.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "IMEI is required"));
        }

        // Lấy ProductItem theo IMEI
        Optional<ProductItem> piOpt = productItemRepository.findById(imei);
        if (piOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "ProductItem (IMEI) not found"));
        }

        // Lấy/ tạo cart ACTIVE cho user
        Cart cart = cartRepository.findFirstByUserIdAndStatus(userId, true)
                .orElseGet(() -> {
                    Cart c = Cart.builder()
                            .userId(userId)
                            .status(true)
                            .build();
                    return cartRepository.save(c);
                });

        // Kiểm tra item đã có trong cart chưa
        Optional<CartItem> existed = cartItemRepository.findByCart_IdCartAndProductItem_Imei(cart.getIdCart(), imei);
        if (existed.isPresent()) {
            // Vì IMEI đơn chiếc → quantity luôn = 1
            CartItem item = existed.get();
            item.setQuantity(1);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productItem(piOpt.get())
                    .quantity(1) // IMEI đơn chiếc
                    .status(true)
                    .build();
            cartItemRepository.save(newItem);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã thêm vào giỏ hàng"));
    }

    // --- CẬP NHẬT SỐ LƯỢNG (theo IMEI) ---
    @PostMapping(value = "/update-quantity", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> updateQuantity(
            @SessionAttribute(name = "userId", required = false) String userId,
            @RequestBody Map<String, Object> request) {
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "User not logged in"));
        }

        String imei = (String) request.get("imei");
        Integer quantity = (Integer) request.get("quantity");

        if (imei == null || imei.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "IMEI is required"));
        }

        if (quantity == null || quantity < 1) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Quantity must be at least 1"));
        }

        // Tìm cart active của user
        Optional<Cart> cartOpt = cartRepository.findFirstByUserIdAndStatus(userId, true);
        if (cartOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Cart not found"));
        }

        // Tìm CartItem theo cart và IMEI
        Optional<CartItem> itemOpt = cartItemRepository.findByCart_IdCartAndProductItem_Imei(
                cartOpt.get().getIdCart(), imei);

        if (itemOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Item not found in cart"));
        }

        // Cập nhật quantity
        CartItem item = itemOpt.get();
        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã cập nhật số lượng"));
    }

    // --- XÓA SẢN PHẨM KHỎI GIỎ HÀNG (theo IMEI) ---
    @PostMapping(value = "/remove", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> removeCartItem(
            @SessionAttribute(name = "userId", required = false) String userId,
            @RequestBody CartItemRequest request) {
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "User not logged in"));
        }
        String imei = request.getImei();
        if (imei == null || imei.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "IMEI is required"));
        }

        cartItemRepository.deleteByUserIdAndImei(userId, imei);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã xóa sản phẩm khỏi giỏ hàng"));
    }

    // --- TẠO ĐƠN HÀNG (CHECKOUT) ---
    @PostMapping(value = "/checkout", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> checkout(
            @SessionAttribute(name = "userId", required = false) String userId,
            @RequestBody Map<String, Object> orderData) {
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "User not logged in"));
        }

        // Lấy cart active của user
        Optional<Cart> cartOpt = cartRepository.findFirstByUserIdAndStatus(userId, true);
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

        // TODO: Tạo Order entity và lưu vào database
        // Bạn cần tạo Order entity và OrderItem entity nếu chưa có
        // 
        // Order order = Order.builder()
        //     .userId(userId)
        //     .totalAmount((Number) orderData.get("total")).doubleValue())
        //     .shippingFee(((Number) orderData.get("shippingFee")).doubleValue())
        //     .orderDate(new Date())
        //     .status("PENDING")
        //     .build();
        // orderRepository.save(order);

        // TODO: Chuyển CartItems thành OrderItems
        // for (CartItem item : cart.getCartItems()) {
        //     OrderItem orderItem = OrderItem.builder()
        //         .order(order)
        //         .productItem(item.getProductItem())
        //         .quantity(item.getQuantity())
        //         .price(item.getProductItem().getVersion().getExportPrice())
        //         .build();
        //     orderItemRepository.save(orderItem);
        // }

        // Xóa cart sau khi tạo order thành công
        cartItemRepository.deleteAll(cart.getCartItems());
        cart.setStatus(false); // Đánh dấu cart là không active
        cartRepository.save(cart);

        // Tạo mã đơn hàng giả (sau này thay bằng order.getIdOrder())
        String orderId = "ORD" + System.currentTimeMillis();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "orderId", orderId,
                "message", "Đặt hàng thành công!"));
    }
}