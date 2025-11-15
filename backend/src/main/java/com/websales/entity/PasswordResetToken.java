package com.websales.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class PasswordResetToken {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String token;

    @OneToOne
    @JoinColumn(name = "employee_id")
    Employee employee;

    LocalDateTime expiryTime;

    public boolean isValid() {
        return LocalDateTime.now().isBefore(expiryTime);
    }
}
