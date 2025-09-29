package com.websales.mapper;



import com.websales.dto.request.BrandRequest;
import com.websales.dto.response.BrandResponse;
import com.websales.entity.Brand;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BrandMapper {
      Brand toBrand(BrandRequest request);
      BrandResponse toBrandResponse(Brand brand);

      void updateBrandFromRequest(BrandRequest request, @MappingTarget Brand brand);

}
