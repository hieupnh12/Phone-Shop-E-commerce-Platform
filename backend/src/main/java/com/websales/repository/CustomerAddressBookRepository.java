package com.websales.repository;

import com.websales.entity.CustomerAddressBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerAddressBookRepository extends JpaRepository<CustomerAddressBook, Long> {
    List<CustomerAddressBook> findByCustomer_CustomerIdOrderByAddressBookIdDesc(Long customerId);
    
    Optional<CustomerAddressBook> findByAddressBookIdAndCustomer_CustomerId(Long addressBookId, Long customerId);
}

