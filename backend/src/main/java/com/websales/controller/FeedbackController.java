package com.websales.controller;

import com.websales.dto.CreateFeedbackRequest;
import com.websales.dto.FeedbackDTO;
import com.websales.dto.RatingStatsDTO;
import com.websales.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class FeedbackController {
    private final FeedbackService feedbackService;

    /**
     * Create a new feedback
     */
    @PostMapping
    public ResponseEntity<?> createFeedback(
            @RequestBody CreateFeedbackRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            Long customerId = Long.valueOf(jwt.getSubject());
            FeedbackDTO feedback = feedbackService.createFeedback(request, customerId);
            return ResponseEntity.status(HttpStatus.CREATED).body(feedback);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }


    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getFeedbacksByProduct(
            @PathVariable Integer productId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            var pageable = PageRequest.of(page, size);
            Page<FeedbackDTO> feedbacks;
            
            if (rating != null) {
                feedbacks = feedbackService.getFeedbacksByProductAndRating(productId, rating, pageable);
            } else {
                feedbacks = feedbackService.getFeedbacksByProduct(productId, pageable);
            }
            
            return ResponseEntity.ok(feedbacks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/my-feedbacks")
    public ResponseEntity<?> getFeedbacksByCustomer(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            Long customerId = Long.valueOf(jwt.getSubject());
            var pageable = PageRequest.of(page, size);
            Page<FeedbackDTO> feedbacks = feedbackService.getFeedbacksByCustomer(customerId, pageable);
            return ResponseEntity.ok(feedbacks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    /**
     * Get feedback by ID
     */
    @GetMapping("/{feedbackId}")
    public ResponseEntity<?> getFeedbackById(@PathVariable Integer feedbackId) {
        try {
            FeedbackDTO feedback = feedbackService.getFeedbackById(feedbackId);
            return ResponseEntity.ok(feedback);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    /**
     * Update feedback (only by owner)
     */
    @PutMapping("/{feedbackId}")
    public ResponseEntity<?> updateFeedback(
            @PathVariable Integer feedbackId,
            @RequestBody CreateFeedbackRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            Long customerId = Long.valueOf(jwt.getSubject());
            FeedbackDTO feedback = feedbackService.updateFeedback(feedbackId, request, customerId);
            return ResponseEntity.ok(feedback);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{feedbackId}")
    public ResponseEntity<?> deleteFeedback(
            @PathVariable Integer feedbackId,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            Long customerId = Long.valueOf(jwt.getSubject());
            feedbackService.deleteFeedback(feedbackId, customerId);
            return ResponseEntity.ok("Feedback deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/stats/product/{productId}")
    public ResponseEntity<?> getRatingStats(@PathVariable Integer productId) {
        try {
            RatingStatsDTO stats = feedbackService.getRatingStats(productId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/rating/product/{productId}")
    public ResponseEntity<?> getAverageRating(@PathVariable Integer productId) {
        try {
            Double averageRating = feedbackService.getAverageRating(productId);
            return ResponseEntity.ok(averageRating);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllFeedbacks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            var pageable = PageRequest.of(page, size);
            Page<FeedbackDTO> feedbacks = feedbackService.getAllFeedbacks(pageable);
            return ResponseEntity.ok(feedbacks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/all/by-rating")
    public ResponseEntity<?> getAllFeedbacksByRating(
            @RequestParam Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            var pageable = PageRequest.of(page, size);
            Page<FeedbackDTO> feedbacks = feedbackService.getAllFeedbacksByRating(rating, pageable);
            return ResponseEntity.ok(feedbacks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}
