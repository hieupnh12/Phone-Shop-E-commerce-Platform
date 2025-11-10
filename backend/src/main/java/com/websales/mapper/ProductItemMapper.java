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

//    @Mapping(source = "versionId.versionId", target = "productVersionId" , nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
//    @Mapping(source = "import_id.import_id", target = "importId" , nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
//    @Mapping(source = "export_id.export_id", target = "exportId" , nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
//    ProductItemResponse toProductItemResponse(ProductItem productItem);

//    default ProductItem ToProducItemcreate(ProductItemRequest request, ProductVersion version, ImportReceipt imports, ExportReceipt exports) {
//        ProductItem item = new ProductItem();
//        item.setImei(request.getImei());
//        item.setVersionId(version);
//        item.setImport_id(imports);
//        item.setExport_id(exports);
//        item.setStatus(request.isStatus()); // Nếu có
//        return item;
//    }
//
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