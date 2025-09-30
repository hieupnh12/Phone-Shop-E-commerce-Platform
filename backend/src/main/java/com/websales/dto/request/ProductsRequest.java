package com.websales.dto.request;


import com.websales.entity.Product;
import com.websales.validation.UniqueName;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductsRequest {
    @NotBlank
    @Size(min = 2, max = 255)
    @UniqueName(entity = Product.class, fieldName = "productName")
    String productName;

    @NotNull
    @Positive
    Long originId;

    @NotBlank
    @Size(max = 255)
    String processor;

    @NotNull
    @Min(1000)
    @Max(10000)
    Integer battery;

    @NotNull
    @DecimalMin("3.0")
    @DecimalMax("10.0")
    Double screenSize;

    @NotNull
    @Positive
    Long operatingSystemId;

    @NotNull
    @Min(1)
    Integer chipset;

    @NotBlank
    @Size(max = 255)
    String rearCamera;

    @NotBlank
    @Size(max = 255)
    String frontCamera;

    @NotNull
    @Min(1)
    @Max(36)
    Integer warrantyPeriod;

    @NotNull
    @Positive
    Long brandId;

    @NotNull
    @Positive
    Long warehouseAreaId;

    @NotNull
    Boolean status;


}
