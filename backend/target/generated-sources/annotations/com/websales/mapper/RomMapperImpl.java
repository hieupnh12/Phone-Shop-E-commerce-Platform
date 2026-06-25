package com.websales.mapper;

import com.websales.dto.request.RomRequest;
import com.websales.dto.response.RomResponse;
import com.websales.entity.Rom;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class RomMapperImpl implements RomMapper {

    @Override
    public Rom toRom(RomRequest request) {
        if ( request == null ) {
            return null;
        }

        Rom.RomBuilder rom = Rom.builder();

        rom.nameRom( request.getNameRom() );

        return rom.build();
    }

    @Override
    public RomResponse toRomResponse(Rom rom) {
        if ( rom == null ) {
            return null;
        }

        RomResponse.RomResponseBuilder romResponse = RomResponse.builder();

        romResponse.idRom( rom.getIdRom() );
        romResponse.nameRom( rom.getNameRom() );

        return romResponse.build();
    }

    @Override
    public void updateRomFromRequest(RomRequest request, Rom rom) {
        if ( request == null ) {
            return;
        }

        rom.setNameRom( request.getNameRom() );
    }
}
