package com.websales.mapper;

import com.websales.dto.request.CustomerCreateRequest;
import com.websales.dto.response.CustomerResponse;
import com.websales.entity.Customer;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class CustomerMapperImpl implements CustomerMapper {

    @Override
    public Customer toCustomer(CustomerCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        Customer.CustomerBuilder customer = Customer.builder();

        customer.address( request.getAddress() );
        customer.birthDate( request.getBirthDate() );
        customer.email( request.getEmail() );
        customer.fullName( request.getFullName() );
        customer.gender( request.getGender() );
        customer.phoneNumber( request.getPhoneNumber() );

        return customer.build();
    }

    @Override
    public CustomerResponse toCustomerResponse(Customer customer) {
        if ( customer == null ) {
            return null;
        }

        CustomerResponse.CustomerResponseBuilder customerResponse = CustomerResponse.builder();

        customerResponse.address( customer.getAddress() );
        customerResponse.birthDate( customer.getBirthDate() );
        customerResponse.createAt( customer.getCreateAt() );
        customerResponse.customerId( customer.getCustomerId() );
        customerResponse.email( customer.getEmail() );
        customerResponse.fullName( customer.getFullName() );
        customerResponse.gender( customer.getGender() );
        customerResponse.phoneNumber( customer.getPhoneNumber() );
        customerResponse.updateAt( customer.getUpdateAt() );

        return customerResponse.build();
    }
}
