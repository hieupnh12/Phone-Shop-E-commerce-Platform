package com.websales.mapper;

import com.cloudinary.Cloudinary;
import com.websales.dto.request.ImageRequest;
import com.websales.dto.request.ProductFullRequest;
import com.websales.dto.request.ProductRequest;
import com.websales.dto.request.ProductUpdateRequest;
import com.websales.dto.response.ProductFULLResponse;
import com.websales.dto.response.ProductResponse;
import com.websales.dto.response.ProductVersionResponse;
import com.websales.dto.response.YSendChatBot;
import com.websales.entity.Brand;
import com.websales.entity.Category;
import com.websales.entity.OperatingSystem;
import com.websales.entity.Origin;
import com.websales.entity.Product;
import com.websales.entity.ProductVersion;
import com.websales.entity.WarehouseArea;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Autowired
    private ProductVersionMapper productVersionMapper;

    @Override
    public Product toProduct(ProductRequest request) {
        if ( request == null ) {
            return null;
        }

        Product.ProductBuilder product = Product.builder();

        if ( request.getBattery() != null ) {
            product.battery( String.valueOf( request.getBattery() ) );
        }
        if ( request.getChipset() != null ) {
            product.chipset( String.valueOf( request.getChipset() ) );
        }
        product.frontCamera( request.getFrontCamera() );
        product.nameProduct( request.getNameProduct() );
        product.rearCamera( request.getRearCamera() );
        product.scanFrequency( request.getScanFrequency() );
        product.screenResolution( request.getScreenResolution() );
        if ( request.getScreenSize() != null ) {
            product.screenSize( String.valueOf( request.getScreenSize() ) );
        }
        product.screenTech( request.getScreenTech() );
        product.status( request.getStatus() );
        product.stockQuantity( request.getStockQuantity() );
        product.warrantyPeriod( request.getWarrantyPeriod() );

        return product.build();
    }

    @Override
    public Product toProductV2(ProductFullRequest request) {
        if ( request == null ) {
            return null;
        }

        Product.ProductBuilder product = Product.builder();

        product.idProduct( request.getIdProduct() );

        return product.build();
    }

    @Override
    public List<YSendChatBot.YProductResponse> toListProductResponse(List<Product> products) {
        if ( products == null ) {
            return null;
        }

        List<YSendChatBot.YProductResponse> list = new ArrayList<YSendChatBot.YProductResponse>( products.size() );
        for ( Product product : products ) {
            list.add( productToYProductResponse( product ) );
        }

        return list;
    }

    @Override
    public ProductResponse toProductResponse(Product product) {
        if ( product == null ) {
            return null;
        }

        ProductResponse.ProductResponseBuilder productResponse = ProductResponse.builder();

        productResponse.originName( productOriginNameOrigin( product ) );
        productResponse.operatingSystemName( productOperatingSystemNameOS( product ) );
        productResponse.brandName( productBrandNameBrand( product ) );
        productResponse.warehouseAreaName( productWarehouseAreaNameWarehouseArea( product ) );
        productResponse.battery( product.getBattery() );
        productResponse.chipset( product.getChipset() );
        productResponse.frontCamera( product.getFrontCamera() );
        productResponse.idProduct( product.getIdProduct() );
        productResponse.image( product.getImage() );
        productResponse.nameProduct( product.getNameProduct() );
        productResponse.rearCamera( product.getRearCamera() );
        productResponse.scanFrequency( product.getScanFrequency() );
        productResponse.screenResolution( product.getScreenResolution() );
        productResponse.screenSize( product.getScreenSize() );
        productResponse.screenTech( product.getScreenTech() );
        productResponse.status( product.getStatus() );
        productResponse.stockQuantity( product.getStockQuantity() );
        productResponse.warrantyPeriod( product.getWarrantyPeriod() );

        return productResponse.build();
    }

    @Override
    public ProductFULLResponse toProductFULLResponse(Product product) {
        if ( product == null ) {
            return null;
        }

        ProductFULLResponse.ProductFULLResponseBuilder productFULLResponse = ProductFULLResponse.builder();

        productFULLResponse.originName( productOriginNameOrigin( product ) );
        productFULLResponse.operatingSystemName( productOperatingSystemNameOS( product ) );
        productFULLResponse.brandName( productBrandNameBrand( product ) );
        productFULLResponse.warehouseAreaName( productWarehouseAreaNameWarehouseArea( product ) );
        productFULLResponse.categoryName( productCategoryNameCategory( product ) );
        productFULLResponse.productVersionResponses( productVersionListToProductVersionResponseList( product.getProductVersion() ) );
        productFULLResponse.battery( product.getBattery() );
        productFULLResponse.chipset( product.getChipset() );
        productFULLResponse.frontCamera( product.getFrontCamera() );
        productFULLResponse.idProduct( product.getIdProduct() );
        productFULLResponse.image( product.getImage() );
        productFULLResponse.nameProduct( product.getNameProduct() );
        productFULLResponse.rearCamera( product.getRearCamera() );
        productFULLResponse.scanFrequency( product.getScanFrequency() );
        productFULLResponse.screenResolution( product.getScreenResolution() );
        productFULLResponse.screenSize( product.getScreenSize() );
        productFULLResponse.screenTech( product.getScreenTech() );
        productFULLResponse.status( product.getStatus() );
        productFULLResponse.stockQuantity( product.getStockQuantity() );
        productFULLResponse.warrantyPeriod( product.getWarrantyPeriod() );

        return productFULLResponse.build();
    }

    @Override
    public Product toImageProduct(ImageRequest request, Cloudinary cloudinary) throws IOException {
        if ( request == null ) {
            return null;
        }

        Product.ProductBuilder product = Product.builder();

        Product productResult = product.build();

        afterMapping( request, productResult, cloudinary );

        return productResult;
    }

    @Override
    public void toProductUpdate(ProductUpdateRequest request, Product product, Origin origin, OperatingSystem os, Brand br, WarehouseArea wa) {
        if ( request == null && origin == null && os == null && br == null && wa == null ) {
            return;
        }

        if ( request != null ) {
            product.setStatus( request.getStatus() );
            product.setBattery( request.getBattery() );
            product.setChipset( request.getChipset() );
            product.setFrontCamera( request.getFrontCamera() );
            product.setNameProduct( request.getNameProduct() );
            product.setRearCamera( request.getRearCamera() );
            product.setScanFrequency( request.getScanFrequency() );
            product.setScreenResolution( request.getScreenResolution() );
            product.setScreenSize( request.getScreenSize() );
            product.setScreenTech( request.getScreenTech() );
            product.setStockQuantity( request.getStockQuantity() );
            product.setWarrantyPeriod( request.getWarrantyPeriod() );
        }
        product.setOrigin( origin );
        product.setOperatingSystem( os );
        product.setBrand( br );
        product.setWarehouseArea( wa );
    }

    @Override
    public void toProductPartUpdate(ProductUpdateRequest request, Product product) {
        if ( request == null ) {
            return;
        }

        if ( request.getBattery() != null ) {
            product.setBattery( request.getBattery() );
        }
        if ( request.getChipset() != null ) {
            product.setChipset( request.getChipset() );
        }
        if ( request.getFrontCamera() != null ) {
            product.setFrontCamera( request.getFrontCamera() );
        }
        if ( request.getNameProduct() != null ) {
            product.setNameProduct( request.getNameProduct() );
        }
        if ( request.getRearCamera() != null ) {
            product.setRearCamera( request.getRearCamera() );
        }
        if ( request.getScanFrequency() != null ) {
            product.setScanFrequency( request.getScanFrequency() );
        }
        if ( request.getScreenResolution() != null ) {
            product.setScreenResolution( request.getScreenResolution() );
        }
        if ( request.getScreenSize() != null ) {
            product.setScreenSize( request.getScreenSize() );
        }
        if ( request.getScreenTech() != null ) {
            product.setScreenTech( request.getScreenTech() );
        }
        if ( request.getStatus() != null ) {
            product.setStatus( request.getStatus() );
        }
        if ( request.getStockQuantity() != null ) {
            product.setStockQuantity( request.getStockQuantity() );
        }
        if ( request.getWarrantyPeriod() != null ) {
            product.setWarrantyPeriod( request.getWarrantyPeriod() );
        }
    }

    protected YSendChatBot.YProductResponse productToYProductResponse(Product product) {
        if ( product == null ) {
            return null;
        }

        Long idProduct = null;
        String nameProduct = null;
        String image = null;

        idProduct = product.getIdProduct();
        nameProduct = product.getNameProduct();
        image = product.getImage();

        YSendChatBot.YProductResponse yProductResponse = new YSendChatBot.YProductResponse( idProduct, nameProduct, image );

        return yProductResponse;
    }

    private String productOriginNameOrigin(Product product) {
        Origin origin = product.getOrigin();
        if ( origin == null ) {
            return null;
        }
        return origin.getNameOrigin();
    }

    private String productOperatingSystemNameOS(Product product) {
        OperatingSystem operatingSystem = product.getOperatingSystem();
        if ( operatingSystem == null ) {
            return null;
        }
        return operatingSystem.getNameOS();
    }

    private String productBrandNameBrand(Product product) {
        Brand brand = product.getBrand();
        if ( brand == null ) {
            return null;
        }
        return brand.getNameBrand();
    }

    private String productWarehouseAreaNameWarehouseArea(Product product) {
        WarehouseArea warehouseArea = product.getWarehouseArea();
        if ( warehouseArea == null ) {
            return null;
        }
        return warehouseArea.getNameWarehouseArea();
    }

    private String productCategoryNameCategory(Product product) {
        Category category = product.getCategory();
        if ( category == null ) {
            return null;
        }
        return category.getNameCategory();
    }

    protected List<ProductVersionResponse> productVersionListToProductVersionResponseList(List<ProductVersion> list) {
        if ( list == null ) {
            return null;
        }

        List<ProductVersionResponse> list1 = new ArrayList<ProductVersionResponse>( list.size() );
        for ( ProductVersion productVersion : list ) {
            list1.add( productVersionMapper.ToProductVersionResponse( productVersion ) );
        }

        return list1;
    }
}
