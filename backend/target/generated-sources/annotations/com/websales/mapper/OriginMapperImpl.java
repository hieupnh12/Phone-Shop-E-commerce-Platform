package com.websales.mapper;

import com.websales.dto.request.OriginRequest;
import com.websales.dto.response.OriginResponse;
import com.websales.entity.Origin;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class OriginMapperImpl implements OriginMapper {

    @Override
    public Origin toOrigin(OriginRequest request) {
        if ( request == null ) {
            return null;
        }

        Origin.OriginBuilder origin = Origin.builder();

        origin.nameOrigin( request.getNameOrigin() );

        return origin.build();
    }

    @Override
    public OriginResponse toOriginResponse(Origin origin) {
        if ( origin == null ) {
            return null;
        }

        OriginResponse.OriginResponseBuilder originResponse = OriginResponse.builder();

        originResponse.idOrigin( origin.getIdOrigin() );
        originResponse.nameOrigin( origin.getNameOrigin() );

        return originResponse.build();
    }

    @Override
    public void updateOrigin(OriginRequest request, Origin origin) {
        if ( request == null ) {
            return;
        }

        origin.setNameOrigin( request.getNameOrigin() );
    }
}
