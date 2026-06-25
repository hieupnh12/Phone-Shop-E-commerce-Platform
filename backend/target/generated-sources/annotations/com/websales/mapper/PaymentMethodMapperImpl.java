package com.websales.mapper;

import com.websales.dto.request.PaymentMethodRequest;
import com.websales.dto.response.PaymentMethodResponse;
import com.websales.entity.PaymentMethod;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class PaymentMethodMapperImpl implements PaymentMethodMapper {

    @Override
    public PaymentMethod toPaymentMethod(PaymentMethodRequest request) {
        if ( request == null ) {
            return null;
        }

        PaymentMethod.PaymentMethodBuilder paymentMethod = PaymentMethod.builder();

        paymentMethod.paymentMethodType( request.getPaymentMethodType() );
        paymentMethod.provider( request.getProvider() );
        paymentMethod.status( request.getStatus() );

        return paymentMethod.build();
    }

    @Override
    public PaymentMethodResponse toPaymentMethodResponse(PaymentMethod paymentMethod) {
        if ( paymentMethod == null ) {
            return null;
        }

        PaymentMethodResponse.PaymentMethodResponseBuilder paymentMethodResponse = PaymentMethodResponse.builder();

        paymentMethodResponse.paymentMethodId( paymentMethod.getPaymentMethodId() );
        paymentMethodResponse.paymentMethodType( paymentMethod.getPaymentMethodType() );
        paymentMethodResponse.provider( paymentMethod.getProvider() );
        paymentMethodResponse.status( paymentMethod.getStatus() );

        return paymentMethodResponse.build();
    }

    @Override
    public void updatePaymentMethod(PaymentMethodRequest request, PaymentMethod paymentMethod) {
        if ( request == null ) {
            return;
        }

        paymentMethod.setPaymentMethodType( request.getPaymentMethodType() );
        paymentMethod.setProvider( request.getProvider() );
        paymentMethod.setStatus( request.getStatus() );
    }
}
