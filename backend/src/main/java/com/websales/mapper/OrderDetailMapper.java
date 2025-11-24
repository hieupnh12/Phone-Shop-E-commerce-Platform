package com.websales.mapper;

import com.websales.dto.response.OrderDetailResponse;
import com.websales.entity.OrderDetail;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface OrderDetailMapper {
    @Mapping(target = "productVersionId", source = "productVersion.idVersion")
    @Mapping(target = "productName", ignore = true)
    @Mapping(target = "subtotal", ignore = true)
    OrderDetailResponse toOrderDetailResponse(OrderDetail orderDetail);
    
    @AfterMapping
    default void afterMapping(OrderDetail orderDetail, @MappingTarget OrderDetailResponse response) {
        // Set product name
        if (orderDetail.getProductVersion() != null && 
            orderDetail.getProductVersion().getProduct() != null) {
            response.setProductName(orderDetail.getProductVersion().getProduct().getNameProduct());
        }
        
        // Calculate subtotal
        if (orderDetail.getUnitPriceAfter() != null && orderDetail.getQuantity() != null) {
            response.setSubtotal(orderDetail.getUnitPriceAfter()
                    .multiply(java.math.BigDecimal.valueOf(orderDetail.getQuantity())));
        }
    }
}

