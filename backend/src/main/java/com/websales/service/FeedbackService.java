package com.websales.service;

import com.websales.dto.CreateFeedbackRequest;
import com.websales.dto.FeedbackDTO;
import com.websales.dto.RatingStatsDTO;
import com.websales.entity.Feedback;
import com.websales.repository.FeedbackRepository;
import com.websales.repository.CustomerRepo;
import com.websales.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final CustomerRepo customerRepo;
    private final ProductRepository productRepository;

    /**
     * Create a new feedback
     */
    public FeedbackDTO createFeedback(CreateFeedbackRequest request, Long customerId) {
        // Kiểm tra xem khách hàng đã đánh giá sản phẩm này chưa
        if (feedbackRepository.existsByCustomerIdAndProductId(customerId, request.getProductId())) {
            throw new IllegalArgumentException("Bạn đã đánh giá sản phẩm này rồi");
        }

        Feedback feedback = Feedback.builder()
                .customerId(customerId)
                .productId(request.getProductId())
                .rate(request.getRate())
                .content(request.getContent())
                .status(true)
                .date(LocalDateTime.now())
                .build();

        Feedback saved = feedbackRepository.save(feedback);
        return mapToDTO(saved);
    }

    /**
     * Get feedbacks by product with default sorting by date
     */
    public Page<FeedbackDTO> getFeedbacksByProduct(Integer productId, Pageable pageable) {
        Page<Feedback> page = feedbackRepository.findByProductIdOrderByDateDesc(productId, pageable);
        List<FeedbackDTO> dtos = page.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    /**
     * Get feedbacks by product filtered by rating
     */
    public Page<FeedbackDTO> getFeedbacksByProductAndRating(Integer productId, Integer rating, Pageable pageable) {
        Page<Feedback> page = feedbackRepository.findByProductIdAndRating(productId, rating, pageable);
        List<FeedbackDTO> dtos = page.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    /**
     * Get feedbacks by customer with pagination
     */
    public Page<FeedbackDTO> getFeedbacksByCustomer(Long customerId, Pageable pageable) {
        Page<Feedback> page = feedbackRepository.findByCustomerIdOrderByDateDesc(customerId, pageable);
        List<FeedbackDTO> dtos = page.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    /**
     * Get feedback by ID
     */
    public FeedbackDTO getFeedbackById(Integer feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found"));
        return mapToDTO(feedback);
    }

    /**
     * Update feedback (only by owner)
     */
    public FeedbackDTO updateFeedback(Integer feedbackId, CreateFeedbackRequest request, Long customerId) {
        Feedback feedback = feedbackRepository.findByFeedbackIdAndCustomerId(feedbackId, customerId)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found or unauthorized"));

        feedback.setRate(request.getRate());
        feedback.setContent(request.getContent());
        
        Feedback updated = feedbackRepository.save(feedback);
        return mapToDTO(updated);
    }

    /**
     * Delete feedback (only by owner)
     */
    public void deleteFeedback(Integer feedbackId, Long customerId) {
        Feedback feedback = feedbackRepository.findByFeedbackIdAndCustomerId(feedbackId, customerId)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found or unauthorized"));
        feedbackRepository.delete(feedback);
    }

    /**
     * Get average rating for a product
     */
    public Double getAverageRating(Integer productId) {
        List<Feedback> feedbacks = feedbackRepository.findByProductIdAndStatusTrue(productId);
        if (feedbacks.isEmpty()) return 0.0;
        return feedbacks.stream()
                .mapToInt(Feedback::getRate)
                .average()
                .orElse(0.0);
    }

    /**
     * Get rating statistics for a product
     */
    public RatingStatsDTO getRatingStats(Integer productId) {
        List<Feedback> feedbacks = feedbackRepository.findByProductIdAndStatusTrue(productId);
        
        if (feedbacks.isEmpty()) {
            return RatingStatsDTO.builder()
                    .averageRating(0.0)
                    .totalReviews(0)
                    .fiveStarCount(0)
                    .fourStarCount(0)
                    .threeStarCount(0)
                    .twoStarCount(0)
                    .oneStarCount(0)
                    .build();
        }

        long totalReviews = feedbacks.size();
        double average = feedbacks.stream()
                .mapToInt(Feedback::getRate)
                .average()
                .orElse(0.0);

        long fiveStar = feedbacks.stream().filter(f -> f.getRate() == 5).count();
        long fourStar = feedbacks.stream().filter(f -> f.getRate() == 4).count();
        long threeStar = feedbacks.stream().filter(f -> f.getRate() == 3).count();
        long twoStar = feedbacks.stream().filter(f -> f.getRate() == 2).count();
        long oneStar = feedbacks.stream().filter(f -> f.getRate() == 1).count();

        return RatingStatsDTO.builder()
                .averageRating(Math.round(average * 10.0) / 10.0)
                .totalReviews((int) totalReviews)
                .fiveStarCount((int) fiveStar)
                .fourStarCount((int) fourStar)
                .threeStarCount((int) threeStar)
                .twoStarCount((int) twoStar)
                .oneStarCount((int) oneStar)
                .build();
    }

    /**
     * Get all feedbacks from all customers (no auth required)
     */
    public Page<FeedbackDTO> getAllFeedbacks(Pageable pageable) {
        Page<Feedback> page = feedbackRepository.findByStatusTrueOrderByDateDesc(pageable);
        List<Feedback> feedbacks = page.getContent();
        
        // Fetch customer and product info in batch
        Set<Long> customerIds = feedbacks.stream()
                .map(Feedback::getCustomerId)
                .collect(Collectors.toSet());
        Set<Integer> productIds = feedbacks.stream()
                .map(Feedback::getProductId)
                .collect(Collectors.toSet());
        
        Map<Long, String> customerNames = customerRepo.findAllById(customerIds).stream()
                .collect(Collectors.toMap(
                    customer -> customer.getCustomerId(),
                    customer -> customer.getFullName() != null ? customer.getFullName() : "N/A"
                ));
        
        Map<Long, String> customerPhones = customerRepo.findAllById(customerIds).stream()
                .collect(Collectors.toMap(
                    customer -> customer.getCustomerId(),
                    customer -> customer.getPhoneNumber() != null ? customer.getPhoneNumber() : "N/A"
                ));
        
        Map<Integer, String> productNames = productRepository.findAllById(
                productIds.stream().map(Long::valueOf).collect(Collectors.toList())
        ).stream()
                .collect(Collectors.toMap(
                    product -> product.getIdProduct().intValue(),
                    product -> product.getNameProduct() != null ? product.getNameProduct() : "N/A",
                    (existing, replacement) -> existing
                ));
        
        List<FeedbackDTO> dtos = feedbacks.stream()
                .map(feedback -> mapToDTOWithNames(feedback, 
                    customerNames.getOrDefault(feedback.getCustomerId(), "N/A"),
                    customerPhones.getOrDefault(feedback.getCustomerId(), "N/A"),
                    productNames.getOrDefault(feedback.getProductId(), "N/A")))
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    /**
     * Get all feedbacks filtered by rating (no auth required)
     */
    public Page<FeedbackDTO> getAllFeedbacksByRating(Integer rating, Pageable pageable) {
        Page<Feedback> page = feedbackRepository.findByRateAndStatusTrueOrderByDateDesc(rating, pageable);
        List<Feedback> feedbacks = page.getContent();
        
        // Fetch customer and product info in batch
        Set<Long> customerIds = feedbacks.stream()
                .map(Feedback::getCustomerId)
                .collect(Collectors.toSet());
        Set<Integer> productIds = feedbacks.stream()
                .map(Feedback::getProductId)
                .collect(Collectors.toSet());
        
        Map<Long, String> customerNames = customerRepo.findAllById(customerIds).stream()
                .collect(Collectors.toMap(
                    customer -> customer.getCustomerId(),
                    customer -> customer.getFullName() != null ? customer.getFullName() : "N/A"
                ));
        
        Map<Long, String> customerPhones = customerRepo.findAllById(customerIds).stream()
                .collect(Collectors.toMap(
                    customer -> customer.getCustomerId(),
                    customer -> customer.getPhoneNumber() != null ? customer.getPhoneNumber() : "N/A"
                ));
        
        Map<Integer, String> productNames = productRepository.findAllById(
                productIds.stream().map(Long::valueOf).collect(Collectors.toList())
        ).stream()
                .collect(Collectors.toMap(
                    product -> product.getIdProduct().intValue(),
                    product -> product.getNameProduct() != null ? product.getNameProduct() : "N/A",
                    (existing, replacement) -> existing
                ));
        
        List<FeedbackDTO> dtos = feedbacks.stream()
                .map(feedback -> mapToDTOWithNames(feedback, 
                    customerNames.getOrDefault(feedback.getCustomerId(), "N/A"),
                    customerPhones.getOrDefault(feedback.getCustomerId(), "N/A"),
                    productNames.getOrDefault(feedback.getProductId(), "N/A")))
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    private FeedbackDTO mapToDTO(Feedback feedback) {
        return FeedbackDTO.builder()
                .feedbackId(feedback.getFeedbackId())
                .customerId(feedback.getCustomerId())
                .productId(feedback.getProductId())
                .date(feedback.getDate())
                .rate(feedback.getRate())
                .content(feedback.getContent())
                .status(feedback.getStatus())
                .customerName(feedback.getCustomer() != null ? feedback.getCustomer().getFullName() : null)
                .productName(feedback.getProduct() != null ? feedback.getProduct().getNameProduct() : null)
                .build();
    }

    private FeedbackDTO mapToDTOWithNames(Feedback feedback, String customerName, String customerPhone, String productName) {
        return FeedbackDTO.builder()
                .feedbackId(feedback.getFeedbackId())
                .customerId(feedback.getCustomerId())
                .productId(feedback.getProductId())
                .date(feedback.getDate())
                .rate(feedback.getRate())
                .content(feedback.getContent())
                .status(feedback.getStatus())
                .customerName(customerName)
                .customerPhone(customerPhone)
                .productName(productName)
                .build();
    }
}
