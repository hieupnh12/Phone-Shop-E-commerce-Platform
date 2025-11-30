package com.websales.controller;



import com.websales.dto.request.ProductFullRequest;
import com.websales.dto.request.ProductUpdateRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.ProductFULLResponse;
import com.websales.dto.response.ProductResponse;
import com.websales.service.CountQuantityOfAll;
import com.websales.service.ProductService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/product")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductController {
    @Autowired
    private ProductService productService;
    CountQuantityOfAll countQuantityOfAll;

        @PostMapping("/init")
        public ApiResponse<ProductFULLResponse> InitProduct(){
             return ApiResponse.<ProductFULLResponse>builder()
                     .result(productService.initProduct())
                     .build();
        }



        // Tạo mới Product với ảnh, sử dụng multipart/form-data
        @PostMapping(value="/full/confirm",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasAuthority('SCOPE_PRODUCT_CREATE_ALL')")
        public ApiResponse<ProductFULLResponse> addProduct(
                @RequestPart(value = "product") @Valid ProductFullRequest request,
                @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
            return ApiResponse.<ProductFULLResponse>builder()
                              .result(productService.createProductFull(request,image))
                              .build();
        }


//    @PutMapping(value = "/upload_image/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ApiResponse<ProductResponse> updateImageProduct(@PathVariable("id") Long id,
//                                                           @RequestPart("image") MultipartFile image) {
//        ApiResponse<ProductResponse> api = new ApiResponse<>();
//        try {
//            ImageRequest request = ImageRequest.builder().image(image).build();
//            ProductResponse response = productService.createImageProduct(request, id);
//            api.setResult(response);
//            return api;
//        } catch (IOException e) {
//            api.setCode(500);
//            api.setMessage("Lỗi khi tải hình ảnh: " + e.getMessage());
//            return api;
//        }
//    }
////    @PostMapping
////    public ApiResponse<ProductResponse> createProductWithVersions(@RequestBody CreateProductWithVersionsRequest request) {
////        ApiResponse<ProductResponse> resp = new ApiResponse<>();
////        resp.setResult(productService.createProductWithVersions(request));
////        return resp;
////    }
//
//
//    @GetMapping
//    ApiResponse<Page<ProductFULLResponse>> getAll( @RequestParam(defaultValue = "0") int page,
//                                                   @RequestParam(defaultValue = "10") int size) { //Thêm @PageableDefault để mặc định trả về 10 bản ghi mỗi trang. Người dùng có thể truyền
//        ApiResponse<Page<ProductFULLResponse>> resp = new ApiResponse<>();
//        Pageable pageable = PageRequest.of(page, size);
//        resp.setCode(1010);
//        resp.setResult(productService.getAllProducts(pageable));
//        return resp;
//    }


    @GetMapping()
     ApiResponse<Page<ProductFULLResponse>> getAllProduct(@RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "0") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.<Page<ProductFULLResponse>>builder()
                .result(productService.listAllProducts(pageable))
                .build();
    }

    @GetMapping("/{idproduct}")
    ApiResponse<ProductFULLResponse> getProduct(@PathVariable("idproduct") Long idproduct) {
        return ApiResponse.<ProductFULLResponse>builder()
                .result(productService.getProductFULLById(idproduct))
                .build();

    }


    @PatchMapping("/{idproduct}")
    @PreAuthorize("hasAuthority('SCOPE_PRODUCT_UPDATE_ALL')")
    ApiResponse<ProductResponse> updateProduct(@PathVariable("idproduct") Long idproduct, @RequestBody ProductUpdateRequest request) {

        ApiResponse<ProductResponse> api = new ApiResponse<>();
        api.setResult(productService.updateProduct(idproduct, request));
        return api;
    }


    @DeleteMapping("/{idproduct}")
    @PreAuthorize("hasAuthority('SCOPE_PRODUCT_DELETE_ALL')")
    public ApiResponse<Void> deleteProduct(@PathVariable("idproduct") Long idproduct) {
        productService.deleteProduct(idproduct);
        return  ApiResponse.<Void>builder()
                .message("DELETE PRODUCT SUCCESSFULLY")
                .build();
    }


//    //test ket hop productversion va product
//
//
//    //cach 2 : su dụng trigger bang class StockQuantityInitializer
//    //cach 1 : cap nhat lai stockquantity cho All Product thu cong
//    @PutMapping("/update-all-stocks")
//    public ApiResponse<String> updateAllProductStocks() {
//        ApiResponse<String> api = new ApiResponse<>();
//        api.setCode(1200);
//        productService.updateAllProductStockQuantities();
//        api.setMessage("ALl Product updated successfully");
//        return api;
//    }
//
//
//    //load anh len front_end
//    @PostMapping("/upload_image/{productId}")
//    public ApiResponse<ImageResponse> uploadImage(@PathVariable("productId") Long productId,
//                                                  @RequestParam("image") MultipartFile file) throws IOException {
//        String imageUrl = productService.uploadImage(productId, file);
//        ApiResponse<ImageResponse> api = new ApiResponse<>();
//        api.setCode(1200);
//        api.setMessage(imageUrl);
//        return api;
//    }


    @GetMapping("/search")
    public Page<ProductFULLResponse> searchProducts(
            @RequestParam(required = false) String brandName,
            @RequestParam(required = false) String warehouseAreaName,
            @RequestParam(required = false) String originName,
            @RequestParam(required = false) String operatingSystemName,
            @RequestParam(required = false) String productName,
//            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) String battery,
            @RequestParam(required = false) String scanFrequency,
            @RequestParam(required = false) String screenSize,
            @RequestParam(required = false) String screenResolution,
            @RequestParam(required = false) String screenTech,
            @RequestParam(required = false) String chipset,
            @RequestParam(required = false) String rearCamera,
            @RequestParam(required = false) String frontCamera,
//            @RequestParam(required = false) String image,
            @RequestParam(required = false) Integer warrantyPeriod,
//            @RequestParam(required = false) Integer stockQuantity,
            @RequestParam(required = false) Boolean status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productService.SearchProduct(
                brandName, warehouseAreaName, originName, operatingSystemName, productName,
                battery, scanFrequency, screenSize, screenResolution, screenTech, chipset,
                rearCamera, frontCamera, warrantyPeriod, status, pageable);
    }

    @GetMapping("/count")
    public ApiResponse<Long> countProduct() {
     return ApiResponse.<Long>builder()
             .result(productService.CountProduct())
             .build();
    }









}
