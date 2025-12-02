package com.websales.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.websales.dto.request.*;
import com.websales.dto.response.NewVersionResponse;
import com.websales.dto.response.ProductFULLResponse;
import com.websales.dto.response.ProductResponse;
import com.websales.dto.response.ProductVersionResponse;
import com.websales.entity.*;
import com.websales.enums.ItemStatus;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.mapper.ProductItemMapper;
import com.websales.mapper.ProductMapper;
import com.websales.mapper.ProductVersionMapper;
import com.websales.repository.ProductRepository;
import com.websales.repository.ProductItemRepository;
import com.websales.repository.ProductVersionRepository;
import com.websales.repository.ImageVersionRepository;
import com.websales.repository.ProductItemRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.hibernate5.HibernateOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor  // thay cho autowrid

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true) //bo private final
@Slf4j
public class ProductVersionService {

    ProductVersionRepository pvr;
    ProductVersionMapper pvm;

    ProductMapper pm;

    RamService ramservice;
    RomService romservice;
    ColorService colorservice;
    ProductService productservice;
    private final ProductService productService;
    private final Cloudinary cloudinary;
    private final ProductVersionRepository productVersionRepository;
    private final ProductItemRepository productItemRepository;
    private final ProductItemMapper productItemMapper;
    private final ProductVersionMapper productVersionMapper;
    private final ImageVersionRepository imageVersionRepository;
    private final ProductRepository productRepository;
//   ProductService productService;

    public ProductVersionResponse CreateProductVersion(Long id, ProductVersionSingleRequest request) {
        Product product = productservice.getProductById(id);
        if (product == null) {
            throw new AppException(ErrorCode.PRODUCT_NOT_EXIST);
        }
        Ram ram = ramservice.getRamById(request.getIdRam());
        Rom rom = romservice.getRomById(request.getIdRom());
        Color color = colorservice.getColorById(request.getIdColor());

        ProductVersion productVersion = pvm.ToProducVersionCreate(request, ram, rom, color, product);

        ProductVersion savedVersion;
        try {
            savedVersion = productVersionRepository.save(productVersion);
        } catch (HibernateOptimisticLockingFailureException e) {
            throw new AppException(ErrorCode.CONCURRENT_MODIFICATION);
        }

        int quantity = request.getStockQuantity();

        if (quantity > 0) {
            // Xử lý các IMEI của productVersion
            List<ProductItem> itemsToSave = new ArrayList<>();  // Batch để hiệu suất
            Set<String> imeis = new HashSet<>();

            String imeiNew = createImei();
            Long baseNumber;
            try {
                baseNumber = Long.parseLong(imeiNew.substring(0, 14));
            } catch (NumberFormatException e) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
            log.info("IMEI first to generated: {}", imeiNew);

            for (int i = 0; i < quantity; i++) {
                String currentImei = generateSequentialImei(baseNumber, i);
                log.info("IMEI generated: {}", currentImei);

                // Check format (15 digits)
                if (currentImei.length() != 15) {
                    throw new AppException(ErrorCode.WRONG_FORM_IMEI);
                }
                log.info("Sequential IMEI generated: {} (offset: {})", currentImei, i);
                if (productItemRepository.existsById(currentImei)) {
                    log.warn("IMEI duplicate phát hiện: {}", currentImei);  // Log cảnh báo nếu duplicate
                    throw new AppException(ErrorCode.IMEI_DUPLICATE);
                }
                if (!imeis.add(currentImei)) {
                    log.warn("IMEI duplicate phát hiện number : {}", currentImei);  // Log cảnh báo nếu duplicate
                    throw new AppException(ErrorCode.IMEI_DUPLICATE);
                }

                ProductItemRequest itemRequest = new ProductItemRequest();

                itemRequest.setImei(currentImei);
                itemRequest.setIdProductVersion(savedVersion.getIdVersion());
                itemRequest.setStatus(ItemStatus.IN_STOCK);

                ProductItem productItem = productItemMapper.ToProducItemcreate(itemRequest, savedVersion);

                itemsToSave.add(productItem);
            }
            // Save batch - Hibernate sẽ persist với ID manual
            productItemRepository.saveAll(itemsToSave);
        }

        // Chuyển đổi sang response
        ProductVersionResponse versionResponse = productVersionMapper.ToProductVersionResponse(savedVersion);
        return versionResponse;
    }

    public String createImei() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        int randomNumber = 15;
        int sum = 0;
        boolean doubleDigit = true; //bat dau tu vi tri 2 tu phai

        for (int i = 0; i < randomNumber - 1; i++) {
            sb.append(random.nextInt(10));
        }
        for (int i = sb.length() - 1; i >= 0; i--) {
            int c = Character.getNumericValue(sb.charAt(i));
            if (doubleDigit) {
                c *= 2;
                if (c > 9) {
                    c -= 9;
                }
            }
            sum += c;
            doubleDigit = !doubleDigit;
        }
        int cd = (10 - (sum % 10)) % 10;

        sb.append(cd);

        return sb.toString();
    }


     private String generateSequentialImei(long baseNumber, int offset) {
        // Tạo 14 digits từ base + offset, pad zero nếu cần
        String numStr = String.format("%014d", baseNumber + offset);

        // Tính check digit Luhn (tương tự hàm createImei gốc)
        int sum = 0;
        boolean doubleDigit = true;  // Bắt đầu từ vị trí 2 từ phải (như code gốc)
        for (int i = numStr.length() - 1; i >= 0; i--) {
            int c = Character.getNumericValue(numStr.charAt(i));
            if (doubleDigit) {
                c *= 2;
                if (c > 9) {
                    c -= 9;
                }
            }
            sum += c;
            doubleDigit = !doubleDigit;
        }
        int checkDigit = (10 - (sum % 10)) % 10;

        return numStr + checkDigit;  // 15 digits
    }







       public ProductVersionResponse UpdateProductVersion(ProductVersionUpdateRequest request, String id) {
           ProductVersion pr = pvr.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_VERSION_NOT_FOUND));

           // Load images để tránh mất khi update
           if (pr.getImages() != null) {
               pr.getImages().size(); // Force load images collection
           }

           Ram ram = ramservice.getRamById(request.getIdRam());
           Rom rom = romservice.getRomById(request.getIdRom());
           Color color = colorservice.getColorById(request.getIdColor());

           ProductVersion productVersion = pvm.ToUpdateProductVersion(request,pr,ram,rom,color);

           pvr.save(productVersion);
           return pvm.ToProductVersionResponse(productVersion);
       }

       @Transactional
       public ProductVersionResponse createProductVersion(ProductVersionRequest request) {
           // Validate request
           if (request.getIdRam() == null || request.getIdRom() == null || request.getIdColor() == null || request.getIdProduct() == null) {
               throw new AppException(ErrorCode.INVALID_REQUEST);
           }

           // Get related entities
           Ram ram = ramservice.getRamById(request.getIdRam());
           Rom rom = romservice.getRomById(request.getIdRom());
           Color color = colorservice.getColorById(request.getIdColor());
           Product product = productService.getProductById(request.getIdProduct());

           // Create version using mapper
           ProductVersion productVersion = pvm.ToProducVersionMakeName(request, ram, rom, color, product);

           // Save version
           ProductVersion savedVersion;
           try {
               savedVersion = productVersionRepository.save(productVersion);
           } catch (Exception e) {
               log.error("Error creating product version: {}", e.getMessage());
               throw new AppException(ErrorCode.INVALID_REQUEST);
           }

           return pvm.ToProductVersionResponse(savedVersion);
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
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), Map.of());
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




    public Page<NewVersionResponse> SearchProductVersionCombined(
            // Params cũ giữ nguyên cho keyword/exact
            String brandName,
            String warehouseAreaName,
            String originName,
            String operatingSystemName,
            String productName,
            // String categoryName, // Uncomment nếu cần
            String battery, // Giữ cho exact search (e.g., "3500 mAh")
            String scanFrequency,
            String screenSize, // Giữ cho exact (e.g., "6.2 inch")
            String screenResolution,
            String screenTech,
            String chipset,
            String rearCamera,
            String frontCamera,
            // String image,
            Integer warrantyPeriod,
            // Integer stockQuantity,
            // Boolean status,
            String romName,
            String ramName,
            String colorName,
            BigDecimal importPrice,
            BigDecimal exportPrice, // Giữ cho exact match nếu cần

            // Params mới cho categorical ranges (từ frontend)
            String priceRange, // e.g., "all", "under2", "2-4", "4-7", "7-13", "13-20", "20+", hoặc custom min/max strings
            String customMinPrice, // String cho custom, parse sau
            String customMaxPrice,
            String batteryRange, // e.g., "all", "under3000", "3-4", "4-5.5", "5500+"
            String screenSizeRange, // e.g., "all", "small", "5-6.5", "6.5-6.8", "6.8+"

            Pageable pageable) {

        // Map priceRange sang min/max
        BigDecimal minExportPrice = null;
        BigDecimal maxExportPrice = null;
        if ("all".equals(priceRange)) {
            // Không filter
        } else if ("under2".equals(priceRange)) {
            maxExportPrice = new BigDecimal("2000000");
        } else if ("2-4".equals(priceRange)) {
            minExportPrice = new BigDecimal("2000000");
            maxExportPrice = new BigDecimal("4000000");
        } else if ("4-7".equals(priceRange)) {
            minExportPrice = new BigDecimal("4000000");
            maxExportPrice = new BigDecimal("7000000");
        } else if ("7-13".equals(priceRange)) {
            minExportPrice = new BigDecimal("7000000");
            maxExportPrice = new BigDecimal("13000000");
        } else if ("13-20".equals(priceRange)) {
            minExportPrice = new BigDecimal("13000000");
            maxExportPrice = new BigDecimal("20000000");
        } else if ("20+".equals(priceRange)) {
            minExportPrice = new BigDecimal("20000000");
        } else if (customMinPrice != null && !customMinPrice.isEmpty()) {
            minExportPrice = new BigDecimal(customMinPrice);
            if (customMaxPrice != null && !customMaxPrice.isEmpty()) {
                maxExportPrice = new BigDecimal(customMaxPrice);
            }
        }

        // Map batteryRange (giả sử battery là String "3500 mAh", range ở mAh)
        Integer minBattery = null;
        Integer maxBattery = null;
        if (!"all".equals(batteryRange)) {
            if ("under3000".equals(batteryRange)) {
                maxBattery = 2999;
            } else if ("3-4".equals(batteryRange)) {
                minBattery = 3000;
                maxBattery = 4000;
            } else if ("4-5.5".equals(batteryRange)) {
                minBattery = 4000;
                maxBattery = 5500;
            } else if ("5500+".equals(batteryRange)) {
                minBattery = 5501;
            }
            // Nếu battery param là exact, ưu tiên exact trước range (hoặc merge logic tùy ý)
        }

        // Map screenSizeRange (giả sử screenSize là "6.2 inch", range ở inch)
        Double minScreenSize = null;
        Double maxScreenSize = null;
        if (!"all".equals(screenSizeRange)) {
            if ("small".equals(screenSizeRange)) { // Giả sử small <5 inch
                maxScreenSize = 4.99;
            } else if ("5-6.5".equals(screenSizeRange)) {
                minScreenSize = 5.0;
                maxScreenSize = 6.5;
            } else if ("6.5-6.8".equals(screenSizeRange)) {
                minScreenSize = 6.5;
                maxScreenSize = 6.8;
            } else if ("6.8+".equals(screenSizeRange)) {
                minScreenSize = 6.81;
            }
        }

        // Map các filter khác từ frontend (giả sử operatingSystemName = os, chipset = cpu, etc.)
        // Nếu frontend gửi "ios" → set operatingSystemName = "ios"
        // Tương tự: scanFrequency = refreshRate (e.g., "120")
        // ramName = ram (e.g., "8")
        // romName = rom (e.g., "128")

        // Gọi repository với tất cả params (set null cho unused)
        return productVersionRepository.findProductVersionsWithCombinedFilters(
                        brandName,
                        warehouseAreaName,
                        originName,
                        operatingSystemName,
                        productName,
                        battery, // Exact string nếu có
                        scanFrequency,
                        screenSize, // Exact nếu có
                        screenResolution,
                        screenTech,
                        chipset,
                        rearCamera,
                        frontCamera,
                        warrantyPeriod,
                        romName,
                        ramName,
                        colorName,
                        importPrice,
                        exportPrice, // Exact nếu cần, range sẽ override qua min/max
                        minExportPrice,
                        maxExportPrice,
                        minBattery,
                        maxBattery,
                        minScreenSize,
                        maxScreenSize,
                        pageable)
                .map(pvm::ToNewVersionResponse); // Giả sử pvm là mapper instance
    }

    @Transactional
    public void deleteVersionImage(String versionId, Integer imageId) {
        // Verify version exists
        ProductVersion productVersion = productVersionRepository.findById(versionId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_VERSION_NOT_FOUND));

        // Find and delete the image
        ProductVersionImage imageToDelete = imageVersionRepository.findById(imageId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));

        // Verify the image belongs to this version
        if (!imageToDelete.getProductVersionId().getIdVersion().equals(versionId)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        // Remove from version's image list
        productVersion.getImages().removeIf(img -> img.getImageId() == imageId);

        // Delete the image entity
        imageVersionRepository.deleteById(imageId);

        log.info("Deleted version image {} for version {}", imageId, versionId);
    }

    @Transactional
    public void deleteProductVersion(String versionId) {
        try {
            log.info("🗑 Starting deletion of product version: {}", versionId);

            // Verify version exists
            ProductVersion productVersion = productVersionRepository.findById(versionId)
                    .orElseThrow(() -> {
                        log.error("❌ Product version not found: {}", versionId);
                        return new AppException(ErrorCode.PRODUCT_VERSION_NOT_FOUND);
                    });
            log.info("✓ Product version found: {}", versionId);

            // Check if version has ProductItems that have been sold (have orderDetail)
            boolean hasSoldItems = productItemRepository.existsByVersionIdAndOrderDetailIsNotNull(versionId);
            log.info("📊 Checking for sold items - hasSoldItems: {}", hasSoldItems);

            if (hasSoldItems) {
                // Nếu có ràng buộc, chuyển status = false thay vì xóa
                log.info("⚠ Version {} has sold items, setting status to false instead of deleting", versionId);
                productVersion.setStatus(false);
                productVersionRepository.save(productVersion);
                log.info("✅ Version {} status set to false", versionId);
                return;
            }

            // Delete all ProductItems for this version (similar to deleteSafeProductItems)
            // Only delete ProductItems that don't have orderDetail (not sold)
            log.info("🗑 Deleting ProductItems for version: {}", versionId);
            productItemRepository.deleteByVersionId(versionId);
            log.info("✓ Deleted ProductItems for version: {}", versionId);

            // Delete all images for this version
            int imageCount = productVersion.getImages() != null ? productVersion.getImages().size() : 0;
            log.info("🗑 Deleting {} images for version: {}", imageCount, versionId);
            imageVersionRepository.deleteAll(productVersion.getImages());
            log.info("✓ Deleted all images for version: {}", versionId);

            // Delete the version
            log.info("🗑 Deleting product version: {}", versionId);
            productVersionRepository.deleteProductVersionById(versionId);
            log.info("✅ Successfully deleted product version: {}", versionId);

        } catch (AppException e) {
            log.error("❌ Application error deleting version {}: {}", versionId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ Unexpected error deleting version {}: {}", versionId, e.getMessage(), e);
            throw new RuntimeException("Lỗi không mong đợi khi xóa phiên bản: " + e.getMessage(), e);
        }
    }

    public boolean hasSoldItems(String versionId) {
        return productItemRepository.existsByVersionIdAndOrderDetailIsNotNull(versionId);
    }



    public List<ProductFULLResponse> Top5Product(){
         List<Object[]> results = pvr.findTop5ProductsByOrderDetailCount(com.websales.enums.OrderStatus.DELIVERED);
         return results.stream()
                 .map(result -> {
                     Product product = (Product) result[0];
                     Long soldQuantity = ((Number) result[1]).longValue();

                     ProductFULLResponse response = pm.toProductFULLResponse(product);
                     response.setSoldQuantity(soldQuantity);
                     return response;
                 })
                 .limit(5) // Giới hạn top 5
                 .collect(Collectors.toList());
    }


}
