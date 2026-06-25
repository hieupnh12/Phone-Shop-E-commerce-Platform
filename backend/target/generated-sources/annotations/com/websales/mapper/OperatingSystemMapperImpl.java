package com.websales.mapper;

import com.websales.dto.request.OperatingSystemRequest;
import com.websales.dto.response.OperatingSystemResponse;
import com.websales.entity.OperatingSystem;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class OperatingSystemMapperImpl implements OperatingSystemMapper {

    @Override
    public OperatingSystem ToOperatingSystem(OperatingSystemRequest request) {
        if ( request == null ) {
            return null;
        }

        OperatingSystem.OperatingSystemBuilder operatingSystem = OperatingSystem.builder();

        operatingSystem.nameOS( request.getNameOS() );

        return operatingSystem.build();
    }

    @Override
    public OperatingSystemResponse toOperatingSystemResponse(OperatingSystem operatingSystem) {
        if ( operatingSystem == null ) {
            return null;
        }

        OperatingSystemResponse.OperatingSystemResponseBuilder operatingSystemResponse = OperatingSystemResponse.builder();

        operatingSystemResponse.idOS( operatingSystem.getIdOS() );
        operatingSystemResponse.nameOS( operatingSystem.getNameOS() );

        return operatingSystemResponse.build();
    }

    @Override
    public void updateOperatingSystem(OperatingSystemRequest request, OperatingSystem operatingSystem) {
        if ( request == null ) {
            return;
        }

        operatingSystem.setNameOS( request.getNameOS() );
    }
}
