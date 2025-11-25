package com.websales.mapper;

import com.websales.dto.response.OrderDetailResponse;
import com.websales.entity.OrderDetail;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface OrderDetailMapper {
    @Mapping(target = "productVersionId", ignore = true)
    @Mapping(target = "productName", ignore = true)
    @Mapping(target = "subtotal", ignore = true)
    OrderDetailResponse toOrderDetailResponse(OrderDetail orderDetail);
    
    @AfterMapping
    default void afterMapping(OrderDetail orderDetail, @MappingTarget OrderDetailResponse response) {
        // Set product version id
        if (orderDetail.getProductVersion() != null &&
            orderDetail.getProductVersion().getIdVersion() != null) {
            response.setProductVersionId(orderDetail.getProductVersion().getIdVersion());
        }
        
        // Set product info
        if (orderDetail.getProductVersion() != null &&
            orderDetail.getProductVersion().getProduct() != null) {
            var product = orderDetail.getProductVersion().getProduct();
            if (product.getNameProduct() != null) {
                response.setProductName(product.getNameProduct());
            }
            if (product.getImage() != null) {
                response.setProductImage(product.getImage());
            }
        }
        
        // Calculate subtotal
        if (orderDetail.getUnitPriceAfter() != null && orderDetail.getQuantity() != null) {
            response.setSubtotal(orderDetail.getUnitPriceAfter()
                    .multiply(java.math.BigDecimal.valueOf(orderDetail.getQuantity())));
        }
    }
}

