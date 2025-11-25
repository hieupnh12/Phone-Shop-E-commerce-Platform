package com.websales.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.websales.dto.request.ImageRequest;
import com.websales.dto.request.ImageVersionRequest;
import com.websales.dto.request.ProductVersionRequest;
import com.websales.dto.request.ProductVersionUpdateRequest;
import com.websales.dto.response.ProductResponse;
import com.websales.dto.response.ProductVersionResponse;
import com.websales.entity.*;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.mapper.ProductVersionMapper;
import com.websales.repository.ProductVersionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Map;
import java.util.List;

@Service
@RequiredArgsConstructor  // thay cho autowrid

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true) //bo private final
@Slf4j
public class ProductVersionService {

    ProductVersionRepository pvr;
    ProductVersionMapper pvm;


    RamService ramservice;
    RomService romservice;
    ColorService colorservice;
    ProductService productservice;
    private final ProductService productService;
    private final Cloudinary cloudinary;
    private final ProductVersionRepository productVersionRepository;
//   ProductService productService;




       public ProductVersionResponse UpdateProductVersion(ProductVersionUpdateRequest request, String id) {
           ProductVersion pr = pvr.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_VERSION_NOT_FOUND));

           Ram ram = ramservice.getRamById(request.getIdRam());
           Rom rom = romservice.getRomById(request.getIdRom());
           Color color = colorservice.getColorById(request.getIdColor());

           ProductVersion productVersion = pvm.ToUpdateProductVersion(request,pr,ram,rom,color);

           pvr.save(productVersion);
           return pvm.ToProductVersionResponse(productVersion);
       }

//       // cac method khong phai la CRUD
//
//
//
    @Transactional
    public ProductVersionResponse updateImageVersion(ImageVersionRequest request, String id) throws IOException {
        ProductVersion productVersion = productVersionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_VERSION_NOT_FOUND));

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (MultipartFile imageFile : request.getImages()) {
                if (!imageFile.isEmpty()) {
                    String imageUrl = uploadToCloudinary(imageFile, cloudinary);
                    if (imageUrl != null) {
                        // Tạo entity image mới
                        ProductVersionImage newImage = ProductVersionImage.builder()
                                .images(imageUrl)
                                .productVersionId(productVersion) // Set owner
                                .build();
                        // Add vào list (cascade sẽ save tự động)
                        productVersion.getImages().add(newImage);
                        System.out.println("Added image: " + imageUrl);
                    }
                }
            }
            // Save version (cascade save images)
            productVersionRepository.save(productVersion);
        }

        return pvm.ToProductVersionResponse(productVersion);
    }

    // Copy method upload từ mapper vào service (nếu không muốn depend mapper)
    private String uploadToCloudinary(MultipartFile file, Cloudinary cloudinary) throws IOException {
        // Copy code từ mapper (giữ nguyên)
        if (file == null || file.isEmpty()) {
            System.out.println("File is null or empty");
            return null;
        }
        try {
            System.out.println("Uploading file: " + file.getOriginalFilename() + " with Cloudinary: " + cloudinary);
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), Map.of());
            String url = uploadResult.get("url").toString();
            System.out.println("Upload successful, URL: " + url);
            return url;
        } catch (Exception e) {
            System.err.println("Error during upload: " + e.getMessage());
            throw new IOException("Lỗi khi tải tệp lên Cloudinary: " + e.getMessage(), e);
        }
    }


    public ProductVersionResponse SearchProductVersion(String colorName,
                                                       String ramName,
                                                       String romName,
                                                       String productName){
           ProductVersion pv =  productVersionRepository.findByProductVersionByTT(productName,romName,ramName,colorName);
           return pvm.ToProductVersionResponse(pv);
    }




    public Page<ProductVersionResponse> SearchProductVersionCombined(
            String brandName,
            String warehouseAreaName,
            String originName,
            String operatingSystemName,
            String productName,
//            String categoryName,
            String battery,
            String scanFrequency,
            String screenSize,
            String screenResolution,
            String screenTech,
            String chipset,
            String rearCamera,
            String frontCamera,
//            String image,
            Integer warrantyPeriod,
//            Integer stockQuantity,
//            Boolean status,
            String romName,
            String ramName,
            String colorName,
            BigDecimal importPrice,
            BigDecimal exportPrice,
            Pageable pageable){
        return productVersionRepository.findProductVersionsWithCombinedFilters(
                        brandName, warehouseAreaName, originName, operatingSystemName, productName,
                        battery, scanFrequency, screenSize, screenResolution, screenTech, chipset,
                        rearCamera, frontCamera, warrantyPeriod,
                        romName, ramName, colorName, importPrice, exportPrice, pageable)
                .map(pvm::ToProductVersionResponse);
    }


}
