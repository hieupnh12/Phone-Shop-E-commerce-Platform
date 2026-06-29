package com.websales.mapper;

import com.websales.dto.request.PaymentTransactionRequest;
import com.websales.dto.response.PaymentTransactionResponse;
import com.websales.entity.PaymentTransaction;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class PaymentTransactionMapperImpl implements PaymentTransactionMapper {

    @Override
    public PaymentTransaction toPaymentTransaction(PaymentTransactionRequest request) {
        if ( request == null ) {
            return null;
        }

        PaymentTransaction.PaymentTransactionBuilder paymentTransaction = PaymentTransaction.builder();

        paymentTransaction.address( request.getAddress() );
        paymentTransaction.amountUsed( request.getAmountUsed() );
        paymentTransaction.orderId( request.getOrderId() );
        paymentTransaction.paymentStatus( request.getPaymentStatus() );
        paymentTransaction.responseMessage( request.getResponseMessage() );
        paymentTransaction.transactionCode( request.getTransactionCode() );
        paymentTransaction.transactionType( request.getTransactionType() );

        return paymentTransaction.build();
    }

    @Override
    public PaymentTransactionResponse toPaymentTransactionResponse(PaymentTransaction transaction) {
        if ( transaction == null ) {
            return null;
        }

        PaymentTransactionResponse.PaymentTransactionResponseBuilder paymentTransactionResponse = PaymentTransactionResponse.builder();

        paymentTransactionResponse.paymentMethod( mapPaymentMethodToResponse( transaction.getPaymentMethod() ) );
        paymentTransactionResponse.address( transaction.getAddress() );
        paymentTransactionResponse.amountUsed( transaction.getAmountUsed() );
        paymentTransactionResponse.orderId( transaction.getOrderId() );
        paymentTransactionResponse.paymentStatus( transaction.getPaymentStatus() );
        paymentTransactionResponse.paymentTime( transaction.getPaymentTime() );
        paymentTransactionResponse.responseMessage( transaction.getResponseMessage() );
        paymentTransactionResponse.transactionCode( transaction.getTransactionCode() );
        paymentTransactionResponse.transactionId( transaction.getTransactionId() );
        paymentTransactionResponse.transactionType( transaction.getTransactionType() );

        return paymentTransactionResponse.build();
    }

    @Override
    public void updatePaymentTransaction(PaymentTransactionRequest request, PaymentTransaction transaction) {
        if ( request == null ) {
            return;
        }

        transaction.setAddress( request.getAddress() );
        transaction.setAmountUsed( request.getAmountUsed() );
        transaction.setOrderId( request.getOrderId() );
        transaction.setPaymentStatus( request.getPaymentStatus() );
        transaction.setResponseMessage( request.getResponseMessage() );
        transaction.setTransactionCode( request.getTransactionCode() );
        transaction.setTransactionType( request.getTransactionType() );
    }
}
