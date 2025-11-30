package com.websales.mapper;



import com.cloudinary.Cloudinary;
import com.websales.dto.request.ImageRequest;
import com.websales.dto.request.ImageVersionRequest;
import com.websales.dto.request.ProductVersionRequest;
import com.websales.dto.request.ProductVersionUpdateRequest;
import com.websales.dto.response.ImageVersionResponse;
import com.websales.dto.response.ImeiResponse;
import com.websales.dto.response.NewVersionResponse;
import com.websales.dto.response.ProductVersionResponse;
import com.websales.entity.*;
import org.mapstruct.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Mapper(componentModel = "Spring", uses = {ProductTestMapper.class})
public interface ProductVersionMapper {

    ProductVersion ToProductVersion (ProductVersionRequest request);

    List<ProductVersion> ToProductVersions (List<ProductVersionRequest> requests);

    @Mapping(source= "ram.nameRam", target="ramName")
    @Mapping(source ="rom.nameRom", target = "romName")
    @Mapping(source = "color.nameColor" , target="colorName")
    @Mapping(source = "product.nameProduct", target ="productName")
    @Mapping(source = "images", target = "images", qualifiedByName = "mapImagesList") // Map List<ProductVersionImage> → List<ImageVersionResponse>
    @Mapping(target = "imei", source = "productItems", qualifiedByName = "mapProductItemsToImei") // Ánh xạ trực tiếp từ productItems
    ProductVersionResponse ToProductVersionResponse (ProductVersion productVersion);


    @Mapping(source= "ram.nameRam", target="ramName")
    @Mapping(source ="rom.nameRom", target = "romName")
    @Mapping(source = "color.nameColor" , target="colorName")
    @Mapping(source = "product.idProduct", target ="idProduct")
    @Mapping(source = "product.nameProduct", target ="productName")
    @Mapping(source = "images", target = "images", qualifiedByName = "mapImagesList") // Map List<ProductVersionImage> → List<ImageVersionResponse>
    @Mapping(target = "imei", source = "productItems", qualifiedByName = "mapProductItemsToImei") // Ánh xạ trực tiếp từ productItems
    NewVersionResponse ToNewVersionResponse (ProductVersion productVersion);




    // Sub-mapping cho ImageVersionResponse
    default ImageVersionResponse toImageVersionResponse(ProductVersionImage image) {
        if (image == null) return null;
        return ImageVersionResponse.builder()
                .imageId(image.getImageId())
                .image(image.getImages())
                .build();
    }

    // Mapping list images
    default List<ImageVersionResponse> mapImages(List<ProductVersionImage> images) {
        if (images == null || images.isEmpty()) {
            return Collections.emptyList();
        }
        return images.stream()
                .map(this::toImageVersionResponse)
                .filter(image -> image != null)
                .collect(Collectors.toList());
    }

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


    @Mapping(target = "image", ignore = true)
    default ProductVersion ToProducVersionMakeName (ProductVersionRequest request, Ram ram , Rom rom , Color color, Product product) {
        ProductVersion productVersion = ToProductVersion(request);
        productVersion.setRam(ram);
        productVersion.setRom(rom);
        productVersion.setColor(color);
        productVersion.setProduct(product);
        return productVersion;
    }



    @Mapping(target = "image", ignore = true)
    default ProductVersion ToUpdateProductVersion (ProductVersionUpdateRequest request, @MappingTarget ProductVersion version , Ram ram , Rom rom , Color color) {
        // Cập nhật các trường liên quan
        version.setRam(ram);
        version.setRom(rom);
        version.setColor(color);
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

    @Named("mapImagesList")
    default List<ImageVersionResponse> mapImagesList(List<ProductVersionImage> images) {
        return mapImages(images);
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




    // Mapping chính: Ignore images, sau đó afterMapping để upload và tạo ProductVersionImage
    @Mapping(target = "images", ignore = true)
    ProductVersion toImageProductVersion(ImageVersionRequest request, @Context Cloudinary cloudinary) throws IOException;

    // Phương thức default để tạo ProductVersion với giá trị mặc định (sửa: init images)
    default ProductVersion toDefaultProduct() {
        ProductVersion productVersion = new ProductVersion();
        productVersion.setStatus(false); // Trạng thái mặc định
        productVersion.setImages(new ArrayList<>()); // Init empty list để tránh null
        // Các trường khác để null hoặc default nếu cần
        return productVersion;
    }

    @AfterMapping
    default void afterMapping(ImageVersionRequest request, @MappingTarget ProductVersion productVersion, @Context Cloudinary cloudinary) throws IOException {
        System.out.println("Processing multiple image upload for request: " + (request != null ? request.getImages().size() : 0) + " files");

        if (request != null && request.getImages() != null && !request.getImages().isEmpty()) {
            for (MultipartFile image : request.getImages()) { // Giả sử getImages() trả List<MultipartFile>
                if (image != null && !image.isEmpty()) {
                    String imageUrl = uploadToCloudinary(image, cloudinary);
                    if (imageUrl != null) {
                        // Tạo ProductVersionImage mới cho mỗi URL
                        ProductVersionImage newImage = ProductVersionImage.builder()
                                .images(imageUrl)
                                .productVersionId(productVersion) // Set owner để FK đúng
                                .build();
                        // Add vào list images của productVersion
                        productVersion.getImages().add(newImage);
                        System.out.println("Added ProductVersionImage with URL: " + imageUrl);
                    }
                } else {
                    System.out.println("Skipping empty image");
                }
            }
        } else {
            System.out.println("No images in request, skipping upload");
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


}