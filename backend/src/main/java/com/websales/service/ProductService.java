package com.websales.service;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.websales.dto.request.ImageRequest;
import com.websales.dto.request.ProductExtraRequest;
import com.websales.dto.request.ProductFullRequest;
import com.websales.dto.request.ProductVersionRequest;
import com.websales.dto.response.ProductFULLResponse;
import com.websales.dto.response.ProductResponse;
import com.websales.dto.response.ProductVersionResponse;
import com.websales.entity.*;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
//     ProductItemRepository productItemRepository;
//     ProductItemMapper productItemMapper;


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
    public ProductFULLResponse createProductFull(ProductFullRequest request, MultipartFile image) throws IOException {
        // Kiểm tra đầu vào
        if (request == null || request.getProducts() == null || request.getVersions() == null || request.getVersions().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Long productId = request.getIdProduct();
        if (productId == null) {
            throw new AppException(ErrorCode.PRODUCT_NOT_EXIST);
        }

        // Tìm sản phẩm theo ID
        Product product = productRepository.findById(productId)
                .filter(i -> i.getStatus() ==  false )
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

        // Sử dụng mapper để cập nhật sản phẩm
        product = productMapper.toProductFull(request, origin, os, br, wa);

        // Xử lý ảnh nếu có
        if (image != null && !image.isEmpty()) {
            ImageRequest imageRequest = ImageRequest.builder().image(image).build();
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
            Ram ram =  ramRepo.findById(versionRequest.getIdRam()).orElseThrow(() -> new AppException(ErrorCode.RAM_NOT_FOUND));
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




    @Transactional
    public ProductResponse createImageProduct(ImageRequest request, Long id) throws IOException {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại với ID: " + id));

        System.out.println("Processing request with image: " + (request.getImage() != null ? request.getImage().getOriginalFilename() : "null"));
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            Product updatedProduct = productMapper.toImageProduct(request, cloudinary);
            product.setImage(updatedProduct.getImage()); // Cập nhật image
            System.out.println("Updated product image: " + updatedProduct.getImage());
        } else {
            System.out.println("No image provided in request");
        }

        Product savedProduct = productRepository.save(product);
        return productMapper.toProductResponse(savedProduct);
    }




//    public Page<ProductFULLResponse> getAllProducts(Pageable pageable) {
//        Page<Product> products = productRepository.findAllWithRelations(pageable);
//        return products.map(productMapper::toProductFULLResponse);
//    }
//
//
//
//    public Page<ProductFULLResponse> listAllProducts(Pageable pageable) {
//        Page<Product> products = productRepository.findProductsWithRelations(pageable);
//        products.forEach(product -> {
//            product.getProductVersion().forEach(version -> {
//                // Lọc ProductItem với export_id IS NULL
//                version.setProductItems(
//                        version.getProductItems().stream()
//                                .filter(pi -> pi.getExport_id() == null)
//                                .collect(Collectors.toList())
//                );
//            });
//        });
//        return products
//                .map(productMapper::toProductFULLResponse);
//    }
//
//
//
//    public Product getProductById(Long id) {
//        long start = System.nanoTime();
//        Product product = productRepository.findById(id)
//                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_EXIST));
//        long end = System.nanoTime();
//        log.info("getProductById took {} ms", (end - start) / 1_000_000);
//        return product;
//    }
//
//
//
//    @Transactional
//    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
//        log.info("Nhận được ProductUpdateRequest với originId: {}", request.getOriginId());
//        // Lấy sản phẩm hiện có
//        Product product = getProductById(id); // Đảm bảo lấy sản phẩm với productId = 18
//
//        // Lấy các thực thể liên quan
//        Origin origin = originService.getOriginById(request.getOriginId());
//        WarehouseArea wa = warehouseAreaService.getWarehouseAreaById(request.getWarehouseAreaId());
//        if (!wa.isStatus()) {
//            throw new AppException(ErrorCode.WAREHOUSE_UNAVAILABLE);
//        }
//        Brand br = brandService.GetBrandById(request.getBrandId());
//        OperatingSystem os = operatingSystemService.getOSById(request.getOperatingSystemId());
//
//        // Cập nhật các trường của sản phẩm hiện có
//        productMapper.toProductUpdate(request, product, origin, os, br, wa);
//
//        // Lưu sản phẩm đã cập nhật
//        Product savedProduct = productRepository.save(product);
//        return productMapper.toProductResponse(savedProduct);
//    }
//
//
//
//
//
//    @Transactional
//    public void deleteProduct(Long productId) {
//        // Kiểm tra xem sản phẩm có ProductItem liên quan không
//        if (productRepository.hasProductItems(productId)) {
//            throw new IllegalStateException("Không thể xóa sản phẩm vì tồn tại ProductItem liên quan.");
//        }
//        // Xóa các ProductVersion không có ProductItem
//        productRepository.deleteProductVersionsWithoutItems(productId);
//        // Xóa sản phẩm
//        productRepository.deleteProductById(productId);
//    }
//
//
//
//    // cac method khong phai la CRUD
//
//
//    public Page<ProductFULLResponse> SearchProduct(String brandName,
//                                                   String warehouseAreaName,
//                                                   String originName,
//                                                   String operatingSystemName,
//                                                   String productName,
//                                                   Pageable pageable) {
//        return productRepository.findProductsWithFilters(
//                        brandName,warehouseAreaName,originName,operatingSystemName,productName,pageable)
//                .map(productMapper::toProductFULLResponse);
//    }
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
//
//    // Phương thức tính stock_quantity cho Product
//    public int calculateStockQuantity(Product product) {
//        return productRepository.calculateStockQuantity(product);
//    }
//
//
//    // Phương thức cập nhật stock_quantity cho Product
//    @Transactional
//    public void updateProductStockQuantity(Long productId) {
//        Product product = getProductById(productId);
//        int totalStock = calculateStockQuantity(product);
//        product.setStockQuantity(totalStock);
//        productRepository.save(product);
//    }
//
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
