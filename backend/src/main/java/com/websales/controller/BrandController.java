package com.websales.controller;


import com.websales.service.BrandService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping ("/brand")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BrandController {
        BrandService brandService;
//
//        @PostMapping
//        public Brand createBrand(@RequestBody @Valid BrandRequest request) {
//            return brandService.CreateBrand(request);
//        }
//
//
//        @GetMapping
//        public List<BrandResponse> GetAllBrand(){
//            return brandService.GetAllBrands();
//        }
//
//
//        @DeleteMapping("/{brandid}")
//        public void deleteBrand(@PathVariable Long brandid){
//            brandService.DeleteBrandById(brandid);
//            System.out.println("successfully deleted brand");
//        }
//
//
//        @PutMapping("/{brandid}")
//        public BrandResponse updateBrand(@PathVariable Long brandid,@RequestBody BrandRequest request) {
//            return brandService.UpdateBrand(brandid,request);
//
//        }



}
