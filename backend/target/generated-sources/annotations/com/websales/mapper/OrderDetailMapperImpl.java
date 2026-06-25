package com.websales.mapper;

import com.websales.dto.response.OrderDetailResponse;
import com.websales.entity.OrderDetail;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
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
        orderDetailResponse.unitPriceBefore( orderDetail.getUnitPriceBefore() );
        orderDetailResponse.unitPriceAfter( orderDetail.getUnitPriceAfter() );
        orderDetailResponse.quantity( orderDetail.getQuantity() );

        OrderDetailResponse orderDetailResponseResult = orderDetailResponse.build();

        afterMapping( orderDetail, orderDetailResponseResult );

        return orderDetailResponseResult;
    }
}
