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
        Order order = Order.builder()
//                .customerId(request.getCustomerId())
//                .employeeId(request.getEmployeeId())
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

                        return OrderDetail.builder()
                                .order(savedOrder)
//                                .productVersion(productVersion)
                                .unitPriceBefore(detailRequest.getUnitPriceBefore())
                                .unitPriceAfter(detailRequest.getUnitPriceAfter())
                                .quantity(detailRequest.getQuantity())
                                .build();
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
}
