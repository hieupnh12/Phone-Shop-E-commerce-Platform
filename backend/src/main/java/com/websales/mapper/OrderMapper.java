package com.websales.mapper;

import com.websales.dto.response.OrderResponse;
import com.websales.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", uses = OrderDetailMapper.class)
public interface OrderMapper {
    OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);

    @Mapping(source="customerId.customerId", target="customerId") // Bỏ qua ánh xạ image, xử lý thủ công
    @Mapping(source="employeeId.id", target="employeeId") // Bỏ qua ánh xạ image, xử lý thủ công
    OrderResponse toOrderResponse(Order order);
}
