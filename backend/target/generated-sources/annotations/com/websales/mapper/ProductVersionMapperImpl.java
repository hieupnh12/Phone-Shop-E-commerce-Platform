package com.websales.mapper;

import com.cloudinary.Cloudinary;
import com.websales.dto.request.ImageVersionRequest;
import com.websales.dto.request.ProductVersionRequest;
import com.websales.dto.request.ProductVersionSingleRequest;
import com.websales.dto.response.NewVersionResponse;
import com.websales.dto.response.ProductVersionResponse;
import com.websales.entity.Color;
import com.websales.entity.Product;
import com.websales.entity.ProductVersion;
import com.websales.entity.Ram;
import com.websales.entity.Rom;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class ProductVersionMapperImpl implements ProductVersionMapper {

    @Override
    public ProductVersion ToProductVersion(ProductVersionRequest request) {
        if ( request == null ) {
            return null;
        }

        ProductVersion.ProductVersionBuilder productVersion = ProductVersion.builder();

        productVersion.importPrice( request.getImportPrice() );
        productVersion.exportPrice( request.getExportPrice() );
        productVersion.stockQuantity( request.getStockQuantity() );
        productVersion.status( request.getStatus() );

        return productVersion.build();
    }

    @Override
    public ProductVersion toProductVCreate(ProductVersionSingleRequest request) {
        if ( request == null ) {
            return null;
        }

        ProductVersion.ProductVersionBuilder productVersion = ProductVersion.builder();

        productVersion.importPrice( request.getImportPrice() );
        productVersion.exportPrice( request.getExportPrice() );
        productVersion.stockQuantity( request.getStockQuantity() );
        productVersion.status( request.getStatus() );

        return productVersion.build();
    }

    @Override
    public List<ProductVersion> ToProductVersions(List<ProductVersionRequest> requests) {
        if ( requests == null ) {
            return null;
        }

        List<ProductVersion> list = new ArrayList<ProductVersion>( requests.size() );
        for ( ProductVersionRequest productVersionRequest : requests ) {
            list.add( ToProductVersion( productVersionRequest ) );
        }

        return list;
    }

    @Override
    public ProductVersionResponse ToProductVersionResponse(ProductVersion productVersion) {
        if ( productVersion == null ) {
            return null;
        }

        ProductVersionResponse.ProductVersionResponseBuilder productVersionResponse = ProductVersionResponse.builder();

        productVersionResponse.ramName( productVersionRamNameRam( productVersion ) );
        productVersionResponse.romName( productVersionRomNameRom( productVersion ) );
        productVersionResponse.colorName( productVersionColorNameColor( productVersion ) );
        productVersionResponse.productName( productVersionProductNameProduct( productVersion ) );
        productVersionResponse.images( mapImagesList( productVersion.getImages() ) );
        productVersionResponse.imei( mapProductItemsToImei( productVersion.getProductItems() ) );
        productVersionResponse.idVersion( productVersion.getIdVersion() );
        productVersionResponse.importPrice( productVersion.getImportPrice() );
        productVersionResponse.exportPrice( productVersion.getExportPrice() );
        productVersionResponse.stockQuantity( productVersion.getStockQuantity() );
        productVersionResponse.status( productVersion.getStatus() );

        return productVersionResponse.build();
    }

    @Override
    public NewVersionResponse ToNewVersionResponse(ProductVersion productVersion) {
        if ( productVersion == null ) {
            return null;
        }

        NewVersionResponse.NewVersionResponseBuilder newVersionResponse = NewVersionResponse.builder();

        newVersionResponse.ramName( productVersionRamNameRam( productVersion ) );
        newVersionResponse.romName( productVersionRomNameRom( productVersion ) );
        newVersionResponse.colorName( productVersionColorNameColor( productVersion ) );
        Long idProduct = productVersionProductIdProduct( productVersion );
        if ( idProduct != null ) {
            newVersionResponse.idProduct( String.valueOf( idProduct ) );
        }
        newVersionResponse.productName( productVersionProductNameProduct( productVersion ) );
        newVersionResponse.images( mapImagesList( productVersion.getImages() ) );
        newVersionResponse.imei( mapProductItemsToImei( productVersion.getProductItems() ) );
        newVersionResponse.idVersion( productVersion.getIdVersion() );
        newVersionResponse.importPrice( productVersion.getImportPrice() );
        newVersionResponse.exportPrice( productVersion.getExportPrice() );
        newVersionResponse.stockQuantity( productVersion.getStockQuantity() );
        newVersionResponse.status( productVersion.getStatus() );

        return newVersionResponse.build();
    }

    @Override
    public ProductVersion toImageProductVersion(ImageVersionRequest request, Cloudinary cloudinary) throws IOException {
        if ( request == null ) {
            return null;
        }

        ProductVersion.ProductVersionBuilder productVersion = ProductVersion.builder();

        ProductVersion productVersionResult = productVersion.build();

        afterMapping( request, productVersionResult, cloudinary );

        return productVersionResult;
    }

    private String productVersionRamNameRam(ProductVersion productVersion) {
        Ram ram = productVersion.getRam();
        if ( ram == null ) {
            return null;
        }
        return ram.getNameRam();
    }

    private String productVersionRomNameRom(ProductVersion productVersion) {
        Rom rom = productVersion.getRom();
        if ( rom == null ) {
            return null;
        }
        return rom.getNameRom();
    }

    private String productVersionColorNameColor(ProductVersion productVersion) {
        Color color = productVersion.getColor();
        if ( color == null ) {
            return null;
        }
        return color.getNameColor();
    }

    private String productVersionProductNameProduct(ProductVersion productVersion) {
        Product product = productVersion.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getNameProduct();
    }

    private Long productVersionProductIdProduct(ProductVersion productVersion) {
        Product product = productVersion.getProduct();
        if ( product == null ) {
            return null;
        }
        return product.getIdProduct();
    }
}
