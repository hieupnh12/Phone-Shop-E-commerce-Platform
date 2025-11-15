package com.websales.mapper;



import com.websales.dto.request.ProductVersionRequest;
import com.websales.dto.response.ImeiResponse;
import com.websales.dto.response.ProductVersionResponse;
import com.websales.entity.*;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "Spring", uses = {ProductTestMapper.class})
public interface ProductVersionMapper {

    ProductVersion ToProductVersion (ProductVersionRequest request);

    List<ProductVersion> ToProductVersions (List<ProductVersionRequest> requests);

    @Mapping(source= "ram.nameRam", target="ramName")
    @Mapping(source ="rom.nameRom", target = "romName")
    @Mapping(source = "color.nameColor" , target="colorName")
    @Mapping(source = "product.nameProduct", target ="productName")
    @Mapping(target = "imei", source = "productItems", qualifiedByName = "mapProductItemsToImei") // Ánh xạ trực tiếp từ productItems
    ProductVersionResponse ToProductVersionResponse (ProductVersion productVersion);


//    @Mapping(source= "ram.nameRam", target="ramName")
//    @Mapping(source ="rom.nameRom", target = "romName")
//    @Mapping(source = "color.nameColor" , target="colorName")
//    @Mapping(source = "product.nameProduct", target ="productName")
//    @Mapping(target = "imei", source = "productItems", qualifiedByName = "mapProductItemsToImei") // Ánh xạ trực tiếp từ productItems
//    @Mapping(source = "product", target ="product")
//    ProductVerResponse ToProductVerResponse (ProductVersion productVersion);



//    @Mapping(source= "ram.name", target="ramName")
//    @Mapping(source ="rom.rom_size", target = "romName")
//    @Mapping(source = "color.name" , target="colorName")
//    @Mapping(source = "product.productName", target ="productName")
//    @Mapping(source = "product", target ="product")
//    VersionResponse ToVersionResponse (ProductVersion productVersion);



    default ProductVersion ToProducVersionMakeName (ProductVersionRequest request, Ram ram , Rom rom , Color color, Product product) {
        ProductVersion productVersion = ToProductVersion(request);
        productVersion.setRam(ram);
        productVersion.setRom(rom);
        productVersion.setColor(color);
        productVersion.setProduct(product);
        return productVersion;
    }




    default ProductVersion ToUpdateProductVersion (ProductVersionRequest request, ProductVersion version ,Ram ram , Rom rom , Color color, Product product) {
        // Cập nhật các trường liên quan
        version.setRam(ram);
        version.setRom(rom);
        version.setColor(color);
        version.setProduct(product);
        return version;
    }


    @Named("mapProductItemsToImei")
    default List<ImeiResponse> mapProductItemsToImei(List<ProductItem> productItems) {
        if (productItems == null) {
            return Collections.emptyList();
        }
        return productItems.stream()
                .map(item -> ImeiResponse.builder()
                                                     .imei(item.getImei())
                                                      .build())
                .collect(Collectors.toList());
    }

//    @Named("mapProductItemsToImeiFiltered")
//    default List<ImeiResponse> mapProductItemsToImeiFiltered(List<ProductItem> productItems, @Context String importId) {
//        if (productItems == null) {
//            return Collections.emptyList();
//        }
//        return productItems.stream()
//                .filter(item -> item.getImport_id() != null && importId.equals(item.getImport_id().getImport_id()))
//                .map(item -> ImeiResponse.builder().imei(item.getImei()).build())
//                .collect(Collectors.toList());
//    }



}