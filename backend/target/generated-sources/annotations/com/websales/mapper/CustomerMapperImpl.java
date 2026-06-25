package com.websales.mapper;

import com.websales.dto.request.CustomerCreateRequest;
import com.websales.dto.response.CustomerResponse;
import com.websales.entity.Customer;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class CustomerMapperImpl implements CustomerMapper {

    @Override
    public Customer toCustomer(CustomerCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        Customer.CustomerBuilder customer = Customer.builder();

        customer.fullName( request.getFullName() );
        customer.phoneNumber( request.getPhoneNumber() );
        customer.email( request.getEmail() );
        customer.gender( request.getGender() );
        customer.birthDate( request.getBirthDate() );
        customer.address( request.getAddress() );

        return customer.build();
    }

    @Override
    public CustomerResponse toCustomerResponse(Customer customer) {
        if ( customer == null ) {
            return null;
        }

        CustomerResponse.CustomerResponseBuilder customerResponse = CustomerResponse.builder();

        customerResponse.customerId( customer.getCustomerId() );
        customerResponse.fullName( customer.getFullName() );
        customerResponse.phoneNumber( customer.getPhoneNumber() );
        customerResponse.email( customer.getEmail() );
        customerResponse.gender( customer.getGender() );
        customerResponse.birthDate( customer.getBirthDate() );
        customerResponse.address( customer.getAddress() );
        customerResponse.createAt( customer.getCreateAt() );
        customerResponse.updateAt( customer.getUpdateAt() );

        return customerResponse.build();
    }
}
