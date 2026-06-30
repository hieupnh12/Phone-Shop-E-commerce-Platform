package com.websales.repository;

import com.websales.dto.response.CustomerCountOrders;
import com.websales.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepo extends JpaRepository<Customer, Long> {
    boolean existsByPhoneNumberAndCustomerIdIsNot(String phoneNumber, Long customerId);

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

    Page<Customer> findCustomerByEmail(String email, Pageable pageable);

    // Method để tìm kiếm theo số điện thoại
    @Query(value = """
        SELECT * FROM customers 
        WHERE phone_number LIKE CONCAT('%', :keyword, '%')
        ORDER BY create_at DESC
        """
         ,
         countQuery = """
         SELECT COUNT(*) FROM customers 
         WHERE phone_number LIKE CONCAT('%', :keyword, '%')
         """,
        nativeQuery = true)
    Page<Customer> searchCustomersByPhoneNumber(@Param("keyword") String keyword, Pageable pageable);

    // Method mới để tìm kiếm theo số điện thoại hoặc email (KHÔNG ảnh hưởng method cũ)
    // Query đơn giản, logic chuyển đổi format được xử lý ở Service layer
    @Query(value = """
        SELECT * FROM customers 
        WHERE (:keyword IS NULL OR :keyword = '' OR
               LOWER(full_name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               phone_number LIKE CONCAT('%', :keyword, '%'))
        ORDER BY create_at DESC
        """, 
        countQuery = """
        SELECT COUNT(*) FROM customers 
        WHERE (:keyword IS NULL OR :keyword = '' OR
               LOWER(full_name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               phone_number LIKE CONCAT('%', :keyword, '%'))
        """, 
        nativeQuery = true)
    Page<Customer> searchCustomersByPhoneOrEmail(@Param("keyword") String keyword, Pageable pageable);

    // Method để tìm gợi ý khi gõ 4 số đầu của số điện thoại
    @Query(value = """
        SELECT * FROM customers 
        WHERE phone_number LIKE CONCAT(:phonePrefix, '%')
        ORDER BY create_at DESC
        """, nativeQuery = true)
    List<Customer> findCustomersByPhonePrefix(@Param("phonePrefix") String phonePrefix, Pageable pageable);

}


