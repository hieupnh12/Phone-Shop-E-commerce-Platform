package com.websales.repository;

import com.websales.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {


    @Query(value = """
    select * from customers where phone_number = ?
    """, nativeQuery = true)
    Optional<Customer> getCustomerByPhoneNumber(String phoneNumber);
}
