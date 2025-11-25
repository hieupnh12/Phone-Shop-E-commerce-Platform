package com.websales.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record StatisticProductResponse(
        ProductInfoDTO topProduct,
        long totalQuantity,
        ProductInfoDTO inventoryProduct,
        List<ProductInfoDTO> topProducts,
        List<BrandRevenueDTO> byBrand
) {
    // Sản phẩm cơ bản: tên, bán ra, tồn kho
    public record ProductInfoDTO(
            String name,
            long soldQuantity,
            long stockQuantity
    ) {}

    // Doanh thu theo thương hiệu
    public record BrandRevenueDTO(
            String brand,
            long quantity
    ) {}
}
