package com.websales.repository;

import com.websales.dto.response.CustomerCountOrders;
import com.websales.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepo extends JpaRepository<Customer, Long> {


    @Query(value = """
    select * from customers where phone_number = ?
    """, nativeQuery = true)
    Optional<Customer> getCustomerByPhoneNumber(String phoneNumber);

    boolean existsByEmail(String email);

    Optional<Customer> findCustomerByEmail(String email);

    @Query(value = """
select count(order_id) as total_orders, 
       COALESCE(sum(total_amount), 0) as total_amount
from orders where customer_id = ?1 and status = 'DELIVERED'

""", nativeQuery = true)
    CustomerCountOrders getCustomerCountOrders(Long customerId);
}


