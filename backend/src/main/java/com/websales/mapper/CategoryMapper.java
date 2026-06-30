package com.websales.mapper;

import com.websales.dto.response.CategoryResponse;
import com.websales.entity.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryResponse toCategoryResponse(Category category);
}
