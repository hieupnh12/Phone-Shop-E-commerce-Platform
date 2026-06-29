package com.websales.mapper;

import com.websales.dto.response.OrderDetailResponse;
import com.websales.dto.response.OrderResponse;
import com.websales.entity.Order;
import com.websales.entity.OrderDetail;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class OrderMapperImpl implements OrderMapper {

    @Autowired
    private OrderDetailMapper orderDetailMapper;

    @Override
    public OrderResponse toOrderResponse(Order order) {
        if ( order == null ) {
            return null;
        }

        OrderResponse.OrderResponseBuilder orderResponse = OrderResponse.builder();

        orderResponse.createDatetime( order.getCreateDatetime() );
        orderResponse.endDatetime( order.getEndDatetime() );
        orderResponse.isPaid( order.getIsPaid() );
        orderResponse.note( order.getNote() );
        orderResponse.orderDetails( orderDetailListToOrderDetailResponseList( order.getOrderDetails() ) );
        orderResponse.orderId( order.getOrderId() );
        orderResponse.status( order.getStatus() );
        orderResponse.totalAmount( order.getTotalAmount() );

        OrderResponse orderResponseResult = orderResponse.build();

        afterMapping( order, orderResponseResult );

        return orderResponseResult;
    }

    protected List<OrderDetailResponse> orderDetailListToOrderDetailResponseList(List<OrderDetail> list) {
        if ( list == null ) {
            return null;
        }

        List<OrderDetailResponse> list1 = new ArrayList<OrderDetailResponse>( list.size() );
        for ( OrderDetail orderDetail : list ) {
            list1.add( orderDetailMapper.toOrderDetailResponse( orderDetail ) );
        }

        return list1;
    }
}
