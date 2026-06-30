package com.websales.mapper;

import com.websales.dto.request.RomRequest;
import com.websales.dto.response.RomResponse;
import com.websales.entity.Rom;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RomMapper {
    Rom toRom(RomRequest request);
    RomResponse toRomResponse(Rom rom);
    void updateRomFromRequest(RomRequest request, @MappingTarget Rom rom);
}