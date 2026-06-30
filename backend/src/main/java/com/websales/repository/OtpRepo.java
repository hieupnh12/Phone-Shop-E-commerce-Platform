package com.websales.repository;

import com.websales.entity.Customer;
import com.websales.entity.OtpRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepo extends JpaRepository<OtpRequest, String> {
    Optional<OtpRequest> findFirstByPhoneNumberOrderByLastSentAtDesc(String phone);

    Optional<OtpRequest> findByPhoneNumber(String phone);
}
