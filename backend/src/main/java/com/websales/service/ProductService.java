package com.websales.service;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.websales.dto.request.*;
import com.websales.dto.response.ProductFULLResponse;
import com.websales.dto.response.ProductItemResponse;
import com.websales.dto.response.ProductResponse;
import com.websales.dto.response.ProductVersionResponse;
import com.websales.entity.*;
import com.websales.enums.ItemStatus;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.mapper.ProductItemMapper;
import com.websales.mapper.ProductMapper;
import com.websales.mapper.ProductVersionMapper;
import com.websales.repository.*;
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
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor  // thay cho autowrid
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true) //bo private final
@Slf4j
public class ProductService {


    ProductVersionMapper productVersionMapper;
    ProductRepository productRepository;
    ProductMapper productMapper;
    OriginService originService;
    WarehouseAreaService warehouseAreaService;
    BrandService brandService;
    OperatingSystemService operatingSystemService;
    ProductVersionRepository productVersionRepository;
    Cloudinary cloudinary;
    OriginRepository originRepo;
    WarehouseAreaRepository warehouseAreaRepo;
    BrandRepository brandRepo;
    OperatingSystemRepository operatingSystemRepo;
    RamRepository ramRepo;
    RomRepository romRepo;
    ColorRepository colorRepo;
    CategoryRepository categoryRepo;
    ProductItemRepository productItemRepository;
    ProductItemMapper productItemMapper;


    //tạo sản phẩm với id có trước để khi tạo productFUll sẽ lấy id này gán vô đó
    @Transactional
    public ProductFULLResponse initProduct() {
        // Tạo sản phẩm với giá trị mặc định
        Product product = productMapper.toDefaultProduct();

        // Lưu sản phẩm vào cơ sở dữ liệu
        Product savedProduct;
        try {
            savedProduct = productRepository.save(product);
        } catch (HibernateOptimisticLockingFailureException e) {
            throw new AppException(ErrorCode.CONCURRENT_MODIFICATION);
        }

        // Trả về response
        return productMapper.toProductFULLResponse(savedProduct);
    }


    @Transactional
    public ProductFULLResponse createProductFull(ProductFullRequest request, MultipartFile imageProduct) throws IOException {
        // Kiểm tra đầu vào
        if (request == null || request.getProducts() == null /*|| request.getVersions() == null || request.getVersions().isEmpty()*/) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Long productId = request.getIdProduct();
        if (productId == null) {
            throw new AppException(ErrorCode.PRODUCT_NOT_EXIST);
        }

        // Tìm sản phẩm theo ID
        Product product = productRepository.findById(productId)
                .filter(i -> i.getStatus() == false)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_EXIST));

        // Lấy thông tin từ ProductExtraRequest
        ProductExtraRequest productRequest = request.getProducts();

        // Kiểm tra và lấy các thực thể liên quan
        Origin origin = originRepo.findById(productRequest.getOriginId())
                .orElseThrow(() -> new AppException(ErrorCode.ORIGIN_NOT_FOUND));
        WarehouseArea wa = warehouseAreaRepo.findById(productRequest.getWarehouseAreaId())
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_NOT_EXIST));
        if (!wa.isStatus()) {
            throw new AppException(ErrorCode.WAREHOUSE_UNAVAILABLE);
        }
        Brand br = brandRepo.findById(productRequest.getBrandId())
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND));
        OperatingSystem os = operatingSystemRepo.findById(productRequest.getOperatingSystemId())
                .orElseThrow(() -> new AppException(ErrorCode.OPERATING_SYSTEM_NOT_FOUND));

        Category ct = categoryRepo.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Sử dụng mapper để cập nhật sản phẩm
        product = productMapper.toProductFull(request, origin, os, br, wa, ct);

        // Xử lý ảnh nếu có
        if (imageProduct != null && !imageProduct.isEmpty()) {
            ImageRequest imageRequest = ImageRequest.builder()
                    .image(imageProduct)
                    .build();

            Product updatedProduct = productMapper.toImageProduct(imageRequest, cloudinary);
            product.setImage(updatedProduct.getImage());
        }

        // Lưu sản phẩm
        Product savedProduct;
        try {
            savedProduct = productRepository.save(product);
        } catch (HibernateOptimisticLockingFailureException e) {
            throw new AppException(ErrorCode.CONCURRENT_MODIFICATION);
        }

        // Xử lý các phiên bản sản phẩm
        List<ProductVersionResponse> savedVersions = new ArrayList<>();
        List<ProductVersionRequest> versionRequests = request.getVersions();
        for (ProductVersionRequest versionRequest : versionRequests) {
            // Kiểm tra thông tin phiên bản
            if (versionRequest.getIdRam() == null || versionRequest.getIdRom() == null || versionRequest.getIdColor() == null) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }

            // Lấy các thực thể liên quan
            Ram ram = ramRepo.findById(versionRequest.getIdRam()).orElseThrow(() -> new AppException(ErrorCode.RAM_NOT_FOUND));
            Rom rom = romRepo.findById(versionRequest.getIdRom()).orElseThrow(() -> new AppException(ErrorCode.ROM_NOT_FOUND));
            Color color = colorRepo.findById(versionRequest.getIdColor()).orElseThrow(() -> new AppException(ErrorCode.COLOR_NOT_FOUND));

            if (ram == null || rom == null || color == null) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }

            // Tạo và lưu phiên bản sản phẩm bằng mapper
            versionRequest.setIdProduct(savedProduct.getIdProduct()); // Gán productId cho versionRequest
            ProductVersion productVersion = productVersionMapper.ToProducVersionMakeName(versionRequest, ram, rom, color, savedProduct);

            ProductVersion savedVersion;
            try {
                savedVersion = productVersionRepository.save(productVersion);
            } catch (HibernateOptimisticLockingFailureException e) {
                throw new AppException(ErrorCode.CONCURRENT_MODIFICATION);
            }


            int quantity = versionRequest.getStockQuantity();

            if (quantity > 0) {
                //xử lý các imei của productVersion
                List<ProductItemRequest> itemRequests = versionRequest.getItems();
                List<ProductItem> itemsToSave = new ArrayList<>();  // Batch để hiệu suất
                Set<String> imeis = new HashSet<>();

                String imeiNew = createImei();
                Long baseNumber;
                if (!imeiNew.isEmpty()) {
                }
                try {
                    baseNumber = Long.parseLong(imeiNew.substring(0, 14));
                } catch (NumberFormatException e) {
                    throw new AppException(ErrorCode.INVALID_REQUEST);
                }
                log.info("IMEI first to generated: {}", imeiNew);

                for (int i = 0; i < quantity; i++) {
//                    String currentImei = String.valueOf(Long.parseLong(imeiNew)+1);
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


            // Chuyển đổi sang response và thêm vào danh sách
            ProductVersionResponse versionResponse = productVersionMapper.ToProductVersionResponse(savedVersion);
            savedVersions.add(versionResponse);
        }

//        // Cập nhật số lượng tồn kho
//        updateProductStockQuantity(savedProduct.getProductId());

        // Tạo và trả về response
        ProductFULLResponse response = productMapper.toProductFULLResponse(savedProduct);
        response.setProductVersionResponses(savedVersions);
        response.setStatus(true);

        return response;
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


//    @Transactional
//    public ProductResponse createImageProduct(ImageRequest request, Long id) throws IOException {
//        Product product = productRepository.findById(id)
//                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại với ID: " + id));
//
//        System.out.println("Processing request with image: " + (request.getImage() != null ? request.getImage().getOriginalFilename() : "null"));
//        if (request.getImage() != null && !request.getImage().isEmpty()) {
//            Product updatedProduct = productMapper.toImageProduct(request, cloudinary);
//            product.setImage(updatedProduct.getImage()); // Cập nhật image
//            System.out.println("Updated product image: " + updatedProduct.getImage());
//        } else {
//            System.out.println("No image provided in request");
//        }
//
//        Product savedProduct = productRepository.save(product);
//        return productMapper.toProductResponse(savedProduct);
//    }

//
//    public Page<ProductFULLResponse> getAllProducts(Pageable pageable) {
//        Page<Product> products = productRepository.findProductsWithRelations(pageable);
//        return products.map(productMapper::toProductFULLResponse);
//    }
//


    public Page<ProductFULLResponse> listAllProducts(Pageable pageable) {
        Page<Product> products = productRepository.findProductsWithRelations(pageable);
        products.forEach(product -> {
            product.getProductVersion().forEach(version -> {
                // Lọc ProductItem với export_id IS NULL
                version.setProductItems(
                        version.getProductItems().stream()
                                .filter(pi -> pi.getOrderDetail() == null)
                                .collect(Collectors.toList())
                );
            });
        });
        return products
                .map(productMapper::toProductFULLResponse);
    }



    public Product getProductById(Long id) {
        long start = System.nanoTime();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_EXIST));
        long end = System.nanoTime();
        return product;
    }


    public ProductFULLResponse getProductFULLById(Long idproduct) {
        Product  product = productRepository.findByIdProduct(idproduct);
        // Assuming getProductVersion() returns List<ProductVersion>
        product.getProductVersion().forEach(version -> {
            // Filter ProductItems where export_id IS NULL (uncomment and fix the lambda)
            version.setProductItems(
                    version.getProductItems().stream()
//                            .filter(pi -> pi.getExportId() == null)  // Adjust 'getExportId()' to match your entity field
                            .collect(Collectors.toList())
            );
        });



        
        // Map to DTO (assuming a mapper or manual mapping exists; adjust as needed)
        return productMapper.toProductFULLResponse(product);  // Or manu
    }


    @Transactional
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        log.info("Nhận được ProductUpdateRequest với originId: {}", request.getIdOrigin());
        // Lấy sản phẩm hiện có
        Product product = getProductById(id); // Đảm bảo lấy sản phẩm với productId = 18

        // Lấy các thực thể liên quan neu trong truong hop phai sua cac origin , warehouse , brand , operating system
        if (request.getIdOrigin() != null && request.getIdWarehouseArea() != null  &&  request.getIdBrand() != null  &&  request.getIdBrand() != null  &&  request.getIdOperatingSystem() != null) {
            Origin origin = originService.getOriginById(request.getIdOrigin());

            WarehouseArea wa = warehouseAreaService.getWarehouseAreaById(request.getIdWarehouseArea());
            if (!wa.isStatus()) {
                throw new AppException(ErrorCode.WAREHOUSE_UNAVAILABLE);

            }

            Brand br = brandService.GetBrandById(request.getIdBrand());

            OperatingSystem os = operatingSystemService.getOs(request.getIdOperatingSystem());

            // Cập nhật các trường của sản phẩm hiện có
            productMapper.toProductUpdate(request, product, origin, os, br, wa);
        }


            productMapper.toProductPartUpdate(request, product);

            // Lưu sản phẩm đã cập nhật
            Product savedProduct = productRepository.save(product);
            return productMapper.toProductResponse(savedProduct);

    }





    @Transactional
    public void deleteProduct(Long productId) {
        // Kiểm tra xem sản phẩm có ProductItem liên quan không
        if (productRepository.hasOrderDetails(productId)) {
            throw new IllegalStateException("Không thể xóa sản phẩm vì  ProductItem liên quan đã được bán ra.");
        }
        //xóa các productItem
        productRepository.deleteSafeProductItems(productId);
        // Xóa các ProductVersion+

        productRepository.deleteSafeProductVersions(productId);
        // Xóa sản phẩm
        productRepository.deleteProductById(productId);
    }



//    // cac method khong phai la CRUD


    public Page<ProductFULLResponse> SearchProduct(String brandName,
                                                   String warehouseAreaName,
                                                   String originName,
                                                   String operatingSystemName,
                                                   String productName,
//                                                   String categoryName,
                                                   String battery,
                                                   String scanFrequency,
                                                   String screenSize,
                                                   String screenResolution,
                                                   String screenTech,
                                                   String chipset,
                                                   String rearCamera,
                                                   String frontCamera,
//                                                   String image,
                                                   Integer warrantyPeriod,
//                                                   Integer stockQuantity,
                                                   Boolean status,
                                                   Pageable pageable) {
        return productRepository.findProductsWithFilters(
                        brandName, warehouseAreaName, originName, operatingSystemName, productName,
                        battery, scanFrequency, screenSize, screenResolution, screenTech, chipset,
                        rearCamera, frontCamera, warrantyPeriod, status, pageable)
                .map(productMapper::toProductFULLResponse);
    }


     public Long CountProduct() {
        return productRepository.count();
     }



//
//   @Transactional
//    public void fixStock() {
//        fixStockQuantities();
//        updateAllProductStockQuantities();
//    }
//
//
//    public ProductFULLResponse GetProductByImei(String imei) {
//        Product products = productRepository.findByImei(imei)
//                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_EXIST));
//
//        // Lọc ProductItem với export_id IS NULL trong productVersion
//
//            products.getProductVersion().forEach(version -> {
//                // Lọc ProductItem với export_id IS NULL
//                version.setProductItems(
//                        version.getProductItems().stream()
//                                .filter(pi -> pi.getExport_id() == null)
//                                .collect(Collectors.toList())
//                );
//            });
//
//        return productMapper.toProductFULLResponse(products);
//    }
//
//
//
//
//
//

    // Phương thức tính stock_quantity cho Product
    public int calculateStockQuantity(Product product) {
        return productRepository.calculateStockQuantity(product);
    }


    // Phương thức cập nhật stock_quantity cho Product
    @Transactional
    public void updateProductStockQuantity(Long productId) {
        Product product = getProductById(productId);
        int totalStock = calculateStockQuantity(product);
        product.setStockQuantity(totalStock);
        productRepository.save(product);
    }

//
//    // Phương thức mới để cập nhật stock_quantity cho tất cả Product
//    @Transactional
//    public void updateAllProductStockQuantities() {
//        List<Product> products = productRepository.findAll();
//        log.info("Bắt đầu cập nhật stock_quantity cho {} sản phẩm", products.size());
//        for (Product product : products) {
//            int totalStock = calculateStockQuantity(product);
//            Integer currentStock = product.getStockQuantity();
//            if (currentStock == null || currentStock != totalStock) {
//                product.setStockQuantity(totalStock);
//                productRepository.save(product);
//                log.info("Đã cập nhật stock_quantity cho sản phẩm ID {} thành {}", product.getProductId(), totalStock);
//            }
//        }
//        log.info("Hoàn thành cập nhật stock_quantity cho tất cả sản phẩm");
//    }
//
//    public String uploadImage(Long id, MultipartFile file) throws IOException {
//
//        //Kiểm tra file
//        if (file.isEmpty() || !isImageFile(file)) {
//            throw new IllegalArgumentException(" Invalid image file");
//        }
//
//        //Upload len Cloudinary
//
////        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
//
//        // Tạo một Map chứa các tùy chọn để upload ảnh lên Cloudinary
//        Map options = ObjectUtils.asMap(
//                "quality", "auto",              // Tự động tối ưu chất lượng ảnh (giảm dung lượng mà vẫn đẹp)
//                "fetch_format", "auto"                  // Tự động chọn định dạng file phù hợp nhất (WebP, JPEG, PNG, v.v.)
//        );
//
//// Gọi hàm upload ảnh từ Cloudinary, truyền vào:
//// - file.getBytes(): nội dung file ảnh dưới dạng byte[]
//// - options: các tùy chọn upload đã tạo ở trên
//        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
//
//// Lấy URL an toàn (https) của ảnh vừa upload từ kết quả trả về
//        String imageUrl = (String) uploadResult.get("secure_url");
//
//
//        //cap nhat san pham
//        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
//        product.setImage(imageUrl);
//        productRepository.save(product);
//
//        return imageUrl;
//
//    }
//
//
//    private boolean isImageFile(MultipartFile file) {
//        String contentType = file.getContentType();
//        return contentType != null && (contentType.equals("image/jpeg") || contentType.equals("image/png"));
//    }

//
//
//
//
//
//    // Sửa dữ liệu sai trong ProductVersion
//    @Transactional
//    public void fixStockQuantities() {
//        try {
//            List<ProductVersion> productVersions = productVersionRepository.findAll();
//            for (ProductVersion productVersion : productVersions) {
//                // Tính tổng số lượng nhập
//                List<ImportReceiptDetail> importDetails = importReceiptDetailsRespository.findDetailsByProductVersionId(productVersion.getVersionId());
//                int totalImportQuantity = importDetails.stream()
//                        .mapToInt(detail -> detail.getQuantity() != null ? detail.getQuantity() : 0)
//                        .sum();
//
//                // Tính tổng số lượng xuất
//                List<ExportReceiptDetail> exportDetails = exportReceiptDetailsRepository.findDetailsByProductVersionId(productVersion.getVersionId());
//                int totalExportQuantity = exportDetails.stream()
//                        .mapToInt(detail -> detail.getQuantity() != null ? detail.getQuantity() : 0)
//                        .sum();
//
//                // Cập nhật stockQuantity
//                productVersion.setStockQuantity(totalImportQuantity - totalExportQuantity);
//                productVersionRepository.save(productVersion);
//            }
//        } catch (Exception e) {
//            throw new RuntimeException("Lỗi khi sửa dữ liệu số lượng tồn kho: " + e.getMessage(), e);
//        }
//    }
}
