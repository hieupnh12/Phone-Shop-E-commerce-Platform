package com.websales.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "otp_requests")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class OtpRequest {
    @Id
    String phoneNumber;
    String otpHash; 
    LocalDateTime expiresAt;
    @Column(name = "verified", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    boolean verified = false;
    @Column(name = "attempt_count", columnDefinition = "TINYINT DEFAULT 0")
    int  attemptCount = 0;
    @Column(name = "sent_count", columnDefinition = "TINYINT DEFAULT 1")
    int sentCount = 1 ;

    LocalDateTime lastSentAt;

    public OtpRequest(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }


    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isVerified() {
        return this.verified;
    }

    public void incrementAttempt() {
        this.attemptCount++;
    }

    public void resetAttempt() {
        this.attemptCount = 0;
    }

    public void incrementSentCount() {
        this.sentCount++;
    }
}
