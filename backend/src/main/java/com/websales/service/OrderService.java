package com.websales.service;

import com.websales.dto.request.OrderRequest;
import com.websales.entity.Customer;
import com.websales.entity.Order;
import com.websales.entity.OrderDetail;
import com.websales.entity.ProductVersion;
import com.websales.enums.OrderStatus;
import com.websales.repository.CustomerRepo;
import com.websales.repository.OrderDetailRepository;
import com.websales.repository.OrderRepository;
import com.websales.repository.ProductVersionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService {
    OrderRepository orderRepository;
    OrderDetailRepository orderDetailRepository;
    ProductVersionRepository productVersionRepository;
    CustomerRepo customerRepo;


    public List<Order> getOrdersByCustomer(Long  customerId) {
        Customer customer = customerRepo.findById(customerId).get();
        return orderRepository.findByCustomerId(customer);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Integer orderId) {
        return orderRepository.findByOrderId(orderId);
    }

    @Transactional
    public Order createOrder(OrderRequest request) {
        // Load Customer entity if customerId is provided
        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepo.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found: " + request.getCustomerId()));
        }
        
        Order order = Order.builder()
                .customerId(customer)
                .note(request.getNote())
                .totalAmount(request.getTotalAmount())
                .status(request.getStatus() != null ? request.getStatus() : OrderStatus.PENDING)
                .isPaid(request.getIsPaid() != null ? request.getIsPaid() : false)
                .build();

        final Order savedOrder = orderRepository.save(order);

        if (request.getOrderDetails() != null && !request.getOrderDetails().isEmpty()) {
            List<OrderDetail> orderDetails = request.getOrderDetails().stream()
                    .map(detailRequest -> {
                        ProductVersion productVersion = productVersionRepository.findById(detailRequest.getProductVersionId())
                                .orElseThrow(() -> new RuntimeException("Product version not found: " + detailRequest.getProductVersionId()));

                        OrderDetail orderDetail = OrderDetail.builder()
                                .order(savedOrder)
                                .unitPriceBefore(detailRequest.getUnitPriceBefore())
                                .unitPriceAfter(detailRequest.getUnitPriceAfter())
                                .quantity(detailRequest.getQuantity())
                                .build();
                        
                        // Set productVersion using setter to ensure Hibernate recognizes the relationship
                        orderDetail.setProductVersion(productVersion);
                        
                        return orderDetail;
                    })
                    .toList();

            orderDetailRepository.saveAll(orderDetails);
            savedOrder.setOrderDetails(orderDetails);
        }

        return savedOrder;
    }

    @Transactional
    public Optional<Order> updateOrderStatus(Integer orderId, OrderStatus status) {
        Optional<Order> orderOpt = orderRepository.findByOrderId(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(status);
            if (status == OrderStatus.DELIVERED || status == OrderStatus.CANCELED || status == OrderStatus.RETURNED) {
                order.setEndDatetime(java.time.LocalDateTime.now());
            }
            return Optional.of(orderRepository.save(order));
        }
        return Optional.empty();
    }

    /**
     * Trừ số lượng sản phẩm trong kho khi thanh toán thành công
     * @param orderId ID của đơn hàng
     */
    @Transactional
    public void reduceStockFromOrder(Integer orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        
        if (order.getOrderDetails() == null || order.getOrderDetails().isEmpty()) {
            return;
        }
        
        for (OrderDetail orderDetail : order.getOrderDetails()) {
            ProductVersion productVersion = orderDetail.getProductVersion();
            if (productVersion != null) {
                Integer currentStock = productVersion.getStockQuantity();
                Integer quantityToReduce = orderDetail.getQuantity();
                
                if (currentStock != null && quantityToReduce != null) {
                    int newStock = Math.max(0, currentStock - quantityToReduce);
                    productVersion.setStockQuantity(newStock);
                    productVersionRepository.save(productVersion);
                }
            }
        }
    }
}
