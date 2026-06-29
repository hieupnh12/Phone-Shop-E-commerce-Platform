package com.websales.mapper;

import com.websales.dto.response.OrderDetailResponse;
import com.websales.entity.OrderDetail;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class OrderDetailMapperImpl implements OrderDetailMapper {

    @Override
    public OrderDetailResponse toOrderDetailResponse(OrderDetail orderDetail) {
        if ( orderDetail == null ) {
            return null;
        }

        OrderDetailResponse.OrderDetailResponseBuilder orderDetailResponse = OrderDetailResponse.builder();

        orderDetailResponse.orderDetailId( orderDetail.getOrderDetailId() );
        orderDetailResponse.quantity( orderDetail.getQuantity() );
        orderDetailResponse.unitPriceAfter( orderDetail.getUnitPriceAfter() );
        orderDetailResponse.unitPriceBefore( orderDetail.getUnitPriceBefore() );

        OrderDetailResponse orderDetailResponseResult = orderDetailResponse.build();

        afterMapping( orderDetail, orderDetailResponseResult );

        return orderDetailResponseResult;
    }
}
