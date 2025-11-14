package com.websales.mapper;


import com.cloudinary.Cloudinary;
import com.websales.dto.request.ImageRequest;
import com.websales.dto.request.ProductExtraRequest;
import com.websales.dto.request.ProductFullRequest;
import com.websales.dto.request.ProductRequest;
import com.websales.dto.response.ProductFULLResponse;
import com.websales.dto.response.ProductResponse;
import com.websales.entity.*;
import org.mapstruct.*;
import org.springframework.beans.BeanUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Mapper(componentModel = "spring", uses = {ProductVersionMapper.class})
public interface ProductMapper {


//    //    @Mapping(source = "firstname", target = "lastname")     cái này tức là cho dữ liệu của firstname giống với lastname
////    @Mapping(target = "lastname", ignore = true)       không mapping đối với lastname (tức là không đụng tới nó luôn --> null)
    @Mapping(target = "image", ignore = true) // Bỏ qua ánh xạ image, xử lý thủ công
    Product toProduct (ProductRequest request);

    @Mapping(target = "image", ignore = true) // Bỏ qua ánh xạ image, xử lý thủ công
    Product toProductV2 (ProductFullRequest request);

//    @Mapping(source = "origin.nameOrigin", target = "originName")
//    @Mapping(source = "operatingSystem.nameOS", target = "operatingSystemName")
//    @Mapping(source = "brand.nameBrand", target = "brandName")
//    @Mapping(source = "warehouseArea.nameWarehouseArea", target = "warehouseAreaName")
//    ProductResponse toProductResponse (Product product);

    @Mapping(source = "origin.nameOrigin", target = "originName")
    @Mapping(source = "operatingSystem.nameOS", target = "operatingSystemName")
    @Mapping(source = "brand.nameBrand", target = "brandName")
    @Mapping(source = "warehouseArea.nameWarehouseArea", target = "warehouseAreaName")
    @Mapping(source = "category.nameCategory", target = "categoryName")
    @Mapping(source ="productVersion", target = "productVersionResponses")
    ProductFULLResponse toProductFULLResponse (Product product);


    @Mapping(target = "image", ignore = true)
    Product toImageProduct(ImageRequest request,@Context Cloudinary cloudinary) throws IOException;

    // Phương thức mới để tạo Product với giá trị mặc định
    default Product toDefaultProduct() {
        Product product = new Product();
        // Gán các giá trị mặc định (hoặc để null nếu không bắt buộc)
        product.setStatus(false); // Trạng thái mặc định
        // Các trường khác như origin, brand, operatingSystem, warehouseArea để null
        // hoặc gán giá trị mặc định nếu cần
        return product;
    }


    @AfterMapping
    default void afterMapping(ImageRequest request, @MappingTarget Product product, @Context Cloudinary cloudinary) throws IOException {
        System.out.println("Processing image upload for request: " + (request != null ? request.getImage() : "null"));

        if (request != null && request.getImage() != null && !request.getImage().isEmpty()) {
            String imageUrl = uploadToCloudinary(request.getImage(), cloudinary);

            System.out.println("Uploaded image URL: " + imageUrl);

            product.setImage(imageUrl);
        } else {
            System.out.println("Image is null or empty, skipping upload");
        }
    }



    default String uploadToCloudinary(MultipartFile file, @Context Cloudinary cloudinary) throws IOException {
        if (file == null || file.isEmpty()) {
            System.out.println("File is null or empty");
            return null;
        }
        try {
            System.out.println("Uploading file: " + file.getOriginalFilename() + " with Cloudinary: " + cloudinary);

            Map uploadResult = cloudinary.uploader()
                                         .upload(file.getBytes(), Map.of());
            String url = uploadResult.get("url").toString();

            System.out.println("Upload successful, URL: " + url);
            return url;
        } catch (Exception e) {
            System.err.println("Error during upload: " + e.getMessage());
            throw new IOException("Lỗi khi tải tệp lên Cloudinary: " + e.getMessage(), e);
        }
    }






//     Product toUpdateProduct(ProductUpdateRequest request);
//


//    // Gọi riêng để xử lý entity
//    @Mapping(target = "image", ignore = true) // Bỏ qua ánh xạ image
//    default Product toProductWithOrigin(ProductRequest request, Origin origin , OperatingSystem os , Brand br, WarehouseArea wa ) {
//        Product product = toProduct(request);
//        product.setOrigin(origin);
//        product.setOperatingSystem(os);
//        product.setBrand(br);
//        product.setWarehouseArea(wa);
//        return product;
//    }




    // Gọi riêng để xử lý full product luôn
    @Mapping(target = "image", ignore = true) // Bỏ qua ánh xạ image
    default Product toProductFull(ProductFullRequest request, Origin origin, OperatingSystem os, Brand br, WarehouseArea wa, Category category) {
        Product product = new Product();
        ProductExtraRequest productRequest = request.getProducts();

        // Copy tất cả properties khớp từ productRequest (giả sử field names tương đồng)
        BeanUtils.copyProperties(productRequest, product);
//
//        product.setNameProduct(productRequest.getNameProduct());
//        product.setBattery(productRequest.getBattery());
//        product.setScanFrequency(productRequest.getScanFrequency());
//        product.setScreenSize(productRequest.getScreenSize());
//        product.setScreenResolution(productRequest.getScreenResolution());
//        product.setScreenTech(productRequest.getScreenTech());
//        product.setChipset(productRequest.getChipset());
//        product.setRearCamera(productRequest.getRearCamera());
//        product.setFrontCamera(productRequest.getFrontCamera());
//        product.setWarrantyPeriod(productRequest.getWarrantyPeriod());
//        product.setStockQuantity(productRequest.getStockQuantity());
//        product.setStatus(productRequest.getStatus());


        // Set field đặc biệt từ request gốc
        product.setIdProduct(request.getIdProduct());

        // Ánh xạ các quan hệ (ManyToOne)
        product.setOrigin(origin);
        product.setOperatingSystem(os);
        product.setBrand(br);
        product.setWarehouseArea(wa);
        product.setCategory(category);

        return product;
    }





//    // Phương thức mới để cập nhật đối tượng Product hiện có
//    default void toProductUpdate(ProductUpdateRequest request, Product product, Origin origin, OperatingSystem os, Brand br, WarehouseArea wa) {
//        if (request.getProcessor() != null) {
//            product.setProcessor(request.getProcessor());
//        }
//        if (request.getBattery() != null) {
//            product.setBattery(request.getBattery());
//        }
//        if (request.getScreenSize() != null) {
//            product.setScreenSize(request.getScreenSize());
//        }
//        if (request.getChipset() != null) {
//            product.setChipset(request.getChipset());
//        }
//        if (request.getRearCamera() != null) {
//            product.setRearCamera(request.getRearCamera());
//        }
//        if (request.getFrontCamera() != null) {
//            product.setFrontCamera(request.getFrontCamera());
//        }
//        if (request.getWarrantyPeriod() != null) {
//            product.setWarrantyPeriod(request.getWarrantyPeriod());
//        }
//        product.setOrigin(origin);
//        product.setOperatingSystem(os);
//        product.setBrand(br);
//        product.setWarehouseArea(wa);
//    }

}

