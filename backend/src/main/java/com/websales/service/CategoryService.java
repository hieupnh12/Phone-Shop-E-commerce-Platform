package com.websales.service;

import com.websales.dto.response.CategoryResponse;
import com.websales.entity.Category;
import com.websales.mapper.CategoryMapper;
import com.websales.repository.CategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor  // thay cho autowrid
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true) //bo private final
@Slf4j
public class CategoryService {
    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;

    public CategoryResponse findCategory() {
        Category ce = categoryRepository.findAll().get(0);
        return categoryMapper.toCategoryResponse(ce);
    }


}
