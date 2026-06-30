package com.websales.mapper;

import com.websales.dto.request.RamRequest;
import com.websales.dto.response.RamResponse;
import com.websales.entity.Ram;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class RamMapperImpl implements RamMapper {

    @Override
    public Ram toRam(RamRequest request) {
        if ( request == null ) {
            return null;
        }

        Ram.RamBuilder ram = Ram.builder();

        ram.nameRam( request.getNameRam() );

        return ram.build();
    }

    @Override
    public RamResponse toRamResponse(Ram ram) {
        if ( ram == null ) {
            return null;
        }

        RamResponse.RamResponseBuilder ramResponse = RamResponse.builder();

        ramResponse.idRam( ram.getIdRam() );
        ramResponse.nameRam( ram.getNameRam() );

        return ramResponse.build();
    }

    @Override
    public void updateRamFromRequest(RamRequest request, Ram ram) {
        if ( request == null ) {
            return;
        }

        ram.setNameRam( request.getNameRam() );
    }
}
