package com.websales.service;

import com.websales.dto.request.OrderRequest;
import com.websales.entity.Customer;
import com.websales.entity.Employee;
import com.websales.entity.Order;
import com.websales.entity.OrderDetail;
import com.websales.entity.ProductVersion;
import com.websales.enums.OrderStatus;
import com.websales.handler.ContextUtils;
import com.websales.repository.CustomerRepo;
import com.websales.repository.EmployeeRepo;
import com.websales.repository.OrderDetailRepository;
import com.websales.repository.OrderRepository;
import com.websales.repository.PaymentTransactionRepository;
import com.websales.repository.ProductVersionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService {
    OrderRepository orderRepository;
    OrderDetailRepository orderDetailRepository;
    ProductVersionRepository productVersionRepository;
    CustomerRepo customerRepo;
    EmployeeRepo employeeRepo;
    PaymentTransactionRepository paymentTransactionRepository;


    public List<Order> getOrdersByCustomer(Long  customerId) {
        Customer customer = customerRepo.findById(customerId).get();
        return orderRepository.findByCustomerId(customer);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
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
        
        // Lấy employeeId nếu đang đăng nhập bằng tài khoản employee
        Employee employee = null;
        try {
            Long employeeId = ContextUtils.getEmployeeId();
            if (employeeId != null) {
                employee = employeeRepo.findById(employeeId).orElse(null);
            }
        } catch (Exception e) {
            // Nếu không phải employee authentication hoặc không tìm thấy employee, bỏ qua
            // Order có thể được tạo bởi customer (self-order)
        }
        
        Order order = Order.builder()
                .customerId(customer)
                .employeeId(employee)
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
            
            // Trừ số lượng sản phẩm trong kho khi tạo order với status PENDING
            if (savedOrder.getStatus() == OrderStatus.PENDING) {
                reduceStockFromOrder(savedOrder.getOrderId());
            }
        }

        return savedOrder;
    }

    @Transactional
    public Optional<Order> updateOrderStatus(Integer orderId, OrderStatus status) {
        Optional<Order> orderOpt = orderRepository.findByOrderId(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            OrderStatus oldStatus = order.getStatus();
            order.setStatus(status);
            if (status == OrderStatus.DELIVERED || status == OrderStatus.CANCELED || status == OrderStatus.RETURNED) {
                order.setEndDatetime(java.time.LocalDateTime.now());
            }
            
            // Nếu chuyển sang DELIVERED và là đơn COD, tự động set isPaid = true
            if (status == OrderStatus.DELIVERED && oldStatus != OrderStatus.DELIVERED) {
                List<com.websales.entity.PaymentTransaction> transactions = paymentTransactionRepository.findByOrderId(orderId);
                log.info("Checking payment transactions for order {}: found {} transactions", orderId, transactions.size());
                
                // Kiểm tra xem có phải đơn COD không
                boolean isCOD = false;
                
                if (transactions.isEmpty()) {
                    // Nếu không có payment transaction, mặc định coi là COD (đơn tại cửa hàng)
                    log.info("No payment transaction found for order {}, defaulting to COD", orderId);
                    isCOD = true;
                } else {
                    // Kiểm tra từ payment transactions
                    isCOD = transactions.stream()
                            .anyMatch(transaction -> {
                                String transactionCode = transaction.getTransactionCode();
                                log.info("Checking transaction {} with code: {}", transaction.getTransactionId(), transactionCode);
                                
                                // Kiểm tra transaction code
                                if (transactionCode != null && transactionCode.startsWith("CODE-")) {
                                    log.info("Found COD transaction by transaction code: {}", transactionCode);
                                    return true;
                                }
                                
                                // Kiểm tra payment method type
                                if (transaction.getPaymentMethod() != null) {
                                    String paymentMethodType = transaction.getPaymentMethod().getPaymentMethodType();
                                    log.info("Payment method type: {}", paymentMethodType);
                                    if (paymentMethodType != null && 
                                        ("cod".equalsIgnoreCase(paymentMethodType) || "COD".equalsIgnoreCase(paymentMethodType))) {
                                        log.info("Found COD transaction by payment method type: {}", paymentMethodType);
                                        return true;
                                    }
                                }
                                
                                // Kiểm tra nếu không phải PayOS thì mặc định là COD
                                if (transactionCode == null || !transactionCode.startsWith("PAYOS-")) {
                                    log.info("Transaction is not PayOS, defaulting to COD");
                                    return true;
                                }
                                
                                return false;
                            });
                }
                
                log.info("Order {} is COD: {}, current isPaid: {}", orderId, isCOD, order.getIsPaid());
                
                // Nếu là COD, set isPaid = true khi chuyển sang DELIVERED
                if (isCOD && !Boolean.TRUE.equals(order.getIsPaid())) {
                    order.setIsPaid(true);
                    log.info("Setting isPaid = true for COD order {} when status changed to DELIVERED", orderId);
                } else if (!isCOD) {
                    log.info("Order {} is not COD, skipping isPaid update", orderId);
                } else {
                    log.info("Order {} isPaid already true, skipping update", orderId);
                }
            }
            
            // Nếu chuyển sang CANCELED, cộng lại quantity vào kho
            if (status == OrderStatus.CANCELED && oldStatus != OrderStatus.CANCELED) {
                restoreStockFromOrder(orderId);
            }
            
            return Optional.of(orderRepository.save(order));
        }
        return Optional.empty();
    }

    /**
     * Trừ số lượng sản phẩm trong kho khi tạo order hoặc thanh toán thành công
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
                    // Kiểm tra số lượng tồn kho có đủ không
                    if (currentStock < quantityToReduce) {
                        throw new RuntimeException(
                            "Không đủ số lượng trong kho cho sản phẩm " + 
                            productVersion.getIdVersion() + 
                            ". Tồn kho: " + currentStock + ", Yêu cầu: " + quantityToReduce
                        );
                    }
                    
                    int newStock = currentStock - quantityToReduce;
                    productVersion.setStockQuantity(newStock);
                    productVersionRepository.save(productVersion);
                }
            }
        }
    }

    /**
     * Cộng lại số lượng sản phẩm vào kho khi hủy đơn hàng
     * @param orderId ID của đơn hàng
     */
    @Transactional
    public void restoreStockFromOrder(Integer orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        
        if (order.getOrderDetails() == null || order.getOrderDetails().isEmpty()) {
            return;
        }
        
        for (OrderDetail orderDetail : order.getOrderDetails()) {
            ProductVersion productVersion = orderDetail.getProductVersion();
            if (productVersion != null) {
                Integer currentStock = productVersion.getStockQuantity();
                Integer quantityToRestore = orderDetail.getQuantity();
                
                if (currentStock != null && quantityToRestore != null) {
                    int newStock = currentStock + quantityToRestore;
                    productVersion.setStockQuantity(newStock);
                    productVersionRepository.save(productVersion);
                }
            }
        }
    }
}
