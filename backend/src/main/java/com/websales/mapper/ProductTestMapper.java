package com.websales.mapper;


import com.websales.dto.response.ProductResponse;
import com.websales.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductTestMapper {

    @Mapping(source = "origin.name", target = "originName")
    @Mapping(source = "operatingSystem.name", target = "operatingSystemName")
    @Mapping(source = "brand.brandName", target = "brandName")
    @Mapping(source = "warehouseArea.name", target = "warehouseAreaName")
    ProductResponse toProductResponse (Product product);

}
