package com.websales.controller;



import com.websales.dto.request.*;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.ProductVersionResponse;
import com.websales.service.ProductService;
import com.websales.service.ProductVersionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

}
