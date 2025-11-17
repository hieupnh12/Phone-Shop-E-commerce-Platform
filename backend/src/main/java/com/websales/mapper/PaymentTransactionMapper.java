package com.websales.mapper;

import com.websales.dto.request.PaymentTransactionRequest;
import com.websales.dto.response.PaymentMethodResponse;
import com.websales.dto.response.PaymentTransactionResponse;
import com.websales.entity.PaymentMethod;
import com.websales.entity.PaymentTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring", uses = {PaymentMethodMapper.class})
public interface PaymentTransactionMapper {
    @Mapping(target = "transactionId", ignore = true)
    @Mapping(target = "paymentMethod", ignore = true)
    @Mapping(target = "paymentTime", ignore = true)
    PaymentTransaction toPaymentTransaction(PaymentTransactionRequest request);
    
    @Mapping(source = "paymentMethod", target = "paymentMethod", qualifiedByName = "mapPaymentMethod")
    PaymentTransactionResponse toPaymentTransactionResponse(PaymentTransaction transaction);
    
    @Mapping(target = "transactionId", ignore = true)
    @Mapping(target = "paymentMethod", ignore = true)
    @Mapping(target = "paymentTime", ignore = true)
    void updatePaymentTransaction(PaymentTransactionRequest request, @MappingTarget PaymentTransaction transaction);
    
    @Named("mapPaymentMethod")
    default PaymentMethodResponse mapPaymentMethodToResponse(PaymentMethod paymentMethod) {
        if (paymentMethod == null) {
            return null;
        }
        return PaymentMethodResponse.builder()
                .paymentMethodId(paymentMethod.getPaymentMethodId())
                .paymentMethodType(paymentMethod.getPaymentMethodType())
                .provider(paymentMethod.getProvider())
                .status(paymentMethod.getStatus())
                .build();
    }
}

