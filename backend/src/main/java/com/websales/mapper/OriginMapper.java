package com.websales.mapper;


import com.websales.dto.request.OriginRequest;
import com.websales.dto.response.OriginResponse;
import com.websales.entity.Origin;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OriginMapper {
    Origin toOrigin(OriginRequest request);
    OriginResponse toOriginResponse(Origin origin);
}
