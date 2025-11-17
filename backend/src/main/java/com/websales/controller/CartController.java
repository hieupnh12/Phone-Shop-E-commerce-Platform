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
                        pi.getImei(), // 👈 thêm IMEI
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
}
