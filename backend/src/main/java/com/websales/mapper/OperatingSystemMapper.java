package com.websales.mapper;



import com.websales.dto.request.OperatingSystemRequest;
import com.websales.dto.response.OperatingSystemResponse;
import com.websales.entity.OperatingSystem;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface OperatingSystemMapper {
    OperatingSystem ToOperatingSystem (OperatingSystemRequest request);
    OperatingSystemResponse toOperatingSystemResponse(OperatingSystem operatingSystem);

    void updateOperatingSystem(OperatingSystemRequest request, @MappingTarget OperatingSystem operatingSystem);
}
