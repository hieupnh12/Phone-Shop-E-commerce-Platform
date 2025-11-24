package com.websales.controller;


import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.CategoryResponse;
import com.websales.service.CategoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CategoryController {
    CategoryService categoryService;

    @GetMapping
    public ApiResponse<CategoryResponse> getAllCategories() {
        return ApiResponse.<CategoryResponse>builder()
                .result(categoryService.findCategory())
                .build();
    }

}
