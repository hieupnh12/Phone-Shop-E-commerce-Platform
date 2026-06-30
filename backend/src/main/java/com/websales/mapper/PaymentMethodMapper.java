package com.websales.mapper;

import com.websales.dto.request.PaymentMethodRequest;
import com.websales.dto.response.PaymentMethodResponse;
import com.websales.entity.PaymentMethod;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PaymentMethodMapper {
    @Mapping(target = "paymentMethodId", ignore = true)
    PaymentMethod toPaymentMethod(PaymentMethodRequest request);
    PaymentMethodResponse toPaymentMethodResponse(PaymentMethod paymentMethod);
    @Mapping(target = "paymentMethodId", ignore = true)
    void updatePaymentMethod(PaymentMethodRequest request, @MappingTarget PaymentMethod paymentMethod);
}

