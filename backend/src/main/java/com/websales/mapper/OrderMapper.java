package com.websales.mapper;

import com.websales.dto.response.OrderResponse;
import com.websales.entity.Order;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", uses = OrderDetailMapper.class)
public interface OrderMapper {
    OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);

    @Mapping(source="customerId.customerId", target="customerId", ignore = true)
    @Mapping(source="customerId.fullName", target="customerName", ignore = true)
    @Mapping(source="customerId.phoneNumber", target="customerPhone", ignore = true)
    @Mapping(source="customerId.address", target="customerAddress", ignore = true)
    @Mapping(source="employeeId.id", target="employeeId", ignore = true)
    OrderResponse toOrderResponse(Order order);
    
    @AfterMapping
    default void afterMapping(Order order, @MappingTarget OrderResponse response) {
        // Handle customerId with null check
        if (order.getCustomerId() != null) {
            response.setCustomerId(order.getCustomerId().getCustomerId());
            response.setCustomerName(order.getCustomerId().getFullName());
            response.setCustomerPhone(order.getCustomerId().getPhoneNumber());
            response.setCustomerAddress(order.getCustomerId().getAddress());
        }
        
        // Handle employeeId with null check
        if (order.getEmployeeId() != null) {
            response.setEmployeeId(order.getEmployeeId().getId());
        }
    }
}
