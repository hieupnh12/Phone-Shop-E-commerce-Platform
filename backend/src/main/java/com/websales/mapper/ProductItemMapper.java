package com.websales.mapper;


import com.websales.dto.request.ProductItemRequest;
import com.websales.dto.response.ProductItemResponse;
import com.websales.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ProductItemMapper {

//    @Mapping(target = "status", expression = "java(item.isStatus() ? ItemStatus.ACTIVE : ItemStatus.INACTIVE)")
//    ProductItem toProductItem(ProductItemRequest request);

//    @Mapping(source = "versionId.idVersion", target = "productVersionId" , nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
////    @Mapping(source = "orderDetail.", target = "orderDetail.id" , nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
//    ProductItemResponse toProductItemResponse(ProductItem productItem);

    default ProductItem ToProducItemcreate(ProductItemRequest request, ProductVersion version /*, OrderDetail order*/) {
        ProductItem item = new ProductItem();
        item.setImei(request.getImei());
        item.setVersionId(version);
        item.setStatus(request.getStatus()); // Nếu có
        return item;
    }

//    default ProductItem ToProducItemcreateFULL(String imei, ProductVersion version, ImportReceipt imports, ExportReceipt exports) {
//        ProductItem item = new ProductItem();
//        item.setImei(imei);
//        item.setVersionId(version);
//        item.setImport_id(imports);
//        item.setExport_id(exports);
//        item.setStatus(false); // Nếu có
//        return item;
//    }
//
//    void toUpdateProductItem(ProductItemRequest request,@MappingTarget ProductItem productItem);


}