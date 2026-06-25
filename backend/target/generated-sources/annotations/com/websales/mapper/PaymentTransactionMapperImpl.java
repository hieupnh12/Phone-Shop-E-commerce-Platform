package com.websales.mapper;

import com.websales.dto.request.PaymentTransactionRequest;
import com.websales.dto.response.PaymentTransactionResponse;
import com.websales.entity.PaymentTransaction;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class PaymentTransactionMapperImpl implements PaymentTransactionMapper {

    @Override
    public PaymentTransaction toPaymentTransaction(PaymentTransactionRequest request) {
        if ( request == null ) {
            return null;
        }

        PaymentTransaction.PaymentTransactionBuilder paymentTransaction = PaymentTransaction.builder();

        paymentTransaction.transactionCode( request.getTransactionCode() );
        paymentTransaction.orderId( request.getOrderId() );
        paymentTransaction.amountUsed( request.getAmountUsed() );
        paymentTransaction.paymentStatus( request.getPaymentStatus() );
        paymentTransaction.transactionType( request.getTransactionType() );
        paymentTransaction.responseMessage( request.getResponseMessage() );
        paymentTransaction.address( request.getAddress() );

        return paymentTransaction.build();
    }

    @Override
    public PaymentTransactionResponse toPaymentTransactionResponse(PaymentTransaction transaction) {
        if ( transaction == null ) {
            return null;
        }

        PaymentTransactionResponse.PaymentTransactionResponseBuilder paymentTransactionResponse = PaymentTransactionResponse.builder();

        paymentTransactionResponse.paymentMethod( mapPaymentMethodToResponse( transaction.getPaymentMethod() ) );
        paymentTransactionResponse.transactionId( transaction.getTransactionId() );
        paymentTransactionResponse.transactionCode( transaction.getTransactionCode() );
        paymentTransactionResponse.orderId( transaction.getOrderId() );
        paymentTransactionResponse.paymentTime( transaction.getPaymentTime() );
        paymentTransactionResponse.amountUsed( transaction.getAmountUsed() );
        paymentTransactionResponse.paymentStatus( transaction.getPaymentStatus() );
        paymentTransactionResponse.transactionType( transaction.getTransactionType() );
        paymentTransactionResponse.responseMessage( transaction.getResponseMessage() );
        paymentTransactionResponse.address( transaction.getAddress() );

        return paymentTransactionResponse.build();
    }

    @Override
    public void updatePaymentTransaction(PaymentTransactionRequest request, PaymentTransaction transaction) {
        if ( request == null ) {
            return;
        }

        transaction.setTransactionCode( request.getTransactionCode() );
        transaction.setOrderId( request.getOrderId() );
        transaction.setAmountUsed( request.getAmountUsed() );
        transaction.setPaymentStatus( request.getPaymentStatus() );
        transaction.setTransactionType( request.getTransactionType() );
        transaction.setResponseMessage( request.getResponseMessage() );
        transaction.setAddress( request.getAddress() );
    }
}
