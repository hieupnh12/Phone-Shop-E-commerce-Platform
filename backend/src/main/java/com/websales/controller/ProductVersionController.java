package com.websales.controller;



import com.websales.dto.request.*;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.ProductVersionResponse;
import com.websales.service.ProductService;
import com.websales.service.ProductVersionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/productVersion")
public class ProductVersionController {

    @Autowired
    ProductVersionService pvs;
    @Autowired
    private ProductService productService;


    @PutMapping("/{id}")
      ApiResponse<ProductVersionResponse> update(@PathVariable String id, @RequestBody @Valid ProductVersionUpdateRequest request) {
          ApiResponse<ProductVersionResponse> resp = new ApiResponse<>();
          resp.setCode(1011);
          resp.setMessage("Product version update successful");
          resp.setResult(pvs.UpdateProductVersion(request,id));
          return resp;
      }

    @PostMapping(value = "/upload_image/{idVersion}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ProductVersionResponse> updateImageVersion( // Sửa tên method
                                                                   @PathVariable("idVersion") @Valid String id,
                                                                   @RequestPart(value = "image", required = false) List<MultipartFile> images) throws IOException { // Sửa: Thêm tên biến 'images'

        ImageVersionRequest request = ImageVersionRequest.builder().images(images).build(); // Build DTO từ list
        ProductVersionResponse response = pvs.updateImageVersion(request,id); // Gọi service đã sửa

        return ApiResponse.<ProductVersionResponse>builder()
                .result(response)
                .build();
    }


    @GetMapping("/searchVersion")
    public ApiResponse<ProductVersionResponse> searchVersion(
            @RequestParam(required = false) String ramName,
            @RequestParam(required = false) String romName,
            @RequestParam(required = false) String colorName,
            @RequestParam(required = false) String productName) {
        return ApiResponse.<ProductVersionResponse>builder()
                .result(pvs.SearchProductVersion(ramName,romName,colorName,productName))
                .build();
    }


    @GetMapping("/searchVersionFULLVIP")
    public Page<ProductVersionResponse> searchVersionCombined(
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
//            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) String romName,
            @RequestParam(required = false) String ramName,
            @RequestParam(required = false) String colorName,
            @RequestParam(required = false) BigDecimal importPrice,
            @RequestParam(required = false) BigDecimal exportPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return pvs.SearchProductVersionCombined(
                brandName, warehouseAreaName, originName, operatingSystemName, productName,
                battery, scanFrequency, screenSize, screenResolution, screenTech, chipset,
                rearCamera, frontCamera, warrantyPeriod,
                romName, ramName, colorName, importPrice, exportPrice, pageable);
    }


}
