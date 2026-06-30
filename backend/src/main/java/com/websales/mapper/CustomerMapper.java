package com.websales.mapper;

import com.websales.dto.request.CustomerCreateRequest;
import com.websales.dto.response.CustomerResponse;
import com.websales.entity.Customer;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    Customer toCustomer(CustomerCreateRequest request);
    CustomerResponse toCustomerResponse(Customer customer);

}
