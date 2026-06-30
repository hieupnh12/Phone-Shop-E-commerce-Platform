package com.websales.repository;

import com.websales.entity.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    Page<Feedback> findByProductId(Integer productId, Pageable pageable);
    
    Page<Feedback> findByProductIdOrderByDateDesc(Integer productId, Pageable pageable);
    
    @Query("SELECT f FROM Feedback f WHERE f.productId = :productId AND f.rate = :rating ORDER BY f.date DESC")
    Page<Feedback> findByProductIdAndRating(@Param("productId") Integer productId, @Param("rating") Integer rating, Pageable pageable);
    
    Page<Feedback> findByCustomerId(Long customerId, Pageable pageable);
    
    Page<Feedback> findByCustomerIdOrderByDateDesc(Long customerId, Pageable pageable);
    
    List<Feedback> findByProductIdAndStatusTrue(Integer productId);
    
    Optional<Feedback> findByFeedbackIdAndCustomerId(Integer feedbackId, Long customerId);
    
    boolean existsByCustomerIdAndProductId(Long customerId, Integer productId);
    
    Page<Feedback> findByStatusTrueOrderByDateDesc(Pageable pageable);
    
    @Query("SELECT f FROM Feedback f WHERE f.rate = :rating AND f.status = true ORDER BY f.date DESC")
    Page<Feedback> findByRateAndStatusTrueOrderByDateDesc(@Param("rating") Integer rating, Pageable pageable);
}
