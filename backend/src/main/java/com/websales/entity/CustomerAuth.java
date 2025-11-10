package com.websales.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "customer_auths")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class CustomerAuth {
    @Id
    Long authId;
    Long customerId;
    String provider;
    String providerUserId;
    String accessToken;
    String refreshToken;



}
