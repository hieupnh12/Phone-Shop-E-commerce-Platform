package com.websales.repository;

import com.websales.entity.CustomerAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthRepo extends JpaRepository<CustomerAuth, Long> {
    Optional<CustomerAuth> findByCustomerIdAndProvider(Long customerId, String provider);
}
