package com.websales.mapper;

import com.websales.dto.request.ColorRequest;
import com.websales.dto.response.ColorResponse;
import com.websales.entity.Color;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class ColorMapperImpl implements ColorMapper {

    @Override
    public Color toColor(ColorRequest request) {
        if ( request == null ) {
            return null;
        }

        Color.ColorBuilder color = Color.builder();

        color.nameColor( request.getNameColor() );

        return color.build();
    }

    @Override
    public ColorResponse toColorResponse(Color color) {
        if ( color == null ) {
            return null;
        }

        ColorResponse.ColorResponseBuilder colorResponse = ColorResponse.builder();

        colorResponse.idColor( color.getIdColor() );
        colorResponse.nameColor( color.getNameColor() );

        return colorResponse.build();
    }

    @Override
    public void updateColorFromRequest(ColorRequest request, Color color) {
        if ( request == null ) {
            return;
        }

        color.setNameColor( request.getNameColor() );
    }
}
