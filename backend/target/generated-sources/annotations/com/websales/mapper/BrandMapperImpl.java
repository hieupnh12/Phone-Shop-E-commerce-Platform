package com.websales.mapper;

import com.websales.dto.request.BrandRequest;
import com.websales.dto.response.BrandResponse;
import com.websales.entity.Brand;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class BrandMapperImpl implements BrandMapper {

    @Override
    public Brand toBrand(BrandRequest request) {
        if ( request == null ) {
            return null;
        }

        Brand.BrandBuilder brand = Brand.builder();

        brand.nameBrand( request.getNameBrand() );

        return brand.build();
    }

    @Override
    public BrandResponse toBrandResponse(Brand brand) {
        if ( brand == null ) {
            return null;
        }

        BrandResponse.BrandResponseBuilder brandResponse = BrandResponse.builder();

        brandResponse.idBrand( (long) brand.getIdBrand() );
        brandResponse.nameBrand( brand.getNameBrand() );

        return brandResponse.build();
    }

    @Override
    public void updateBrandFromRequest(BrandRequest request, Brand brand) {
        if ( request == null ) {
            return;
        }

        brand.setNameBrand( request.getNameBrand() );
    }
}
