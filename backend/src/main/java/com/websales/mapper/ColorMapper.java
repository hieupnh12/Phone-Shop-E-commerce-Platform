package com.websales.mapper;


import com.websales.dto.request.ColorRequest;
import com.websales.dto.response.ColorResponse;
import com.websales.entity.Color;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ColorMapper {
    Color toColor(ColorRequest request);
    ColorResponse toColorResponse(Color color);
    void updateColorFromRequest(ColorRequest request, @MappingTarget Color color);
}