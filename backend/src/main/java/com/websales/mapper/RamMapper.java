package com.websales.mapper;

import com.websales.dto.request.RamRequest;
import com.websales.dto.response.RamResponse;
import com.websales.entity.Ram;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RamMapper {
    Ram toRam(RamRequest request);
    RamResponse toRamResponse(Ram ram);
    void updateRamFromRequest(RamRequest request, @MappingTarget Ram ram);
}
