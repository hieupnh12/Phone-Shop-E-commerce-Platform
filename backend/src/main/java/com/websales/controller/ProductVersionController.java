package com.websales.controller;



import com.websales.dto.request.ProductVersionRequest;
import com.websales.dto.request.ProductVersionUpdateRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.ProductVersionResponse;
import com.websales.service.ProductService;
import com.websales.service.ProductVersionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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


}
