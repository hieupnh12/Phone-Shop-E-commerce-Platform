package com.websales.dto.request;


import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductExtraRequest {
    @NotBlank(message = "Product name must not be blank")
    @Size(max = 255, message = "Product name must be less than 255 characters")
    String nameProduct;

//    @NotBlank(message = "Image URL must not be blank")
//    @Size(max = 255, message = "Image URL must be less than 255 characters")
//    String image;

          @NotNull(message = "Origin ID must not be null")
          Long originId;

    @NotNull(message = "Battery capacity is required")
    @Positive(message = "Battery must be a positive number")
    Integer battery;

    @NotBlank(message = "Scan frequency must not be blank")
    @Size(max = 100, message = "Scan frequency must be less than 100 characters")
    String scanFrequency;

    @NotNull(message = "Screen size is required")
    @DecimalMin(value = "0.1", message = "Screen size must be greater than 0")
    Double screenSize;

          @NotNull(message = "Operating system ID is required")
          Long operatingSystemId;

    @NotBlank(message = "Screen resolution must not be blank")
    @Size(max = 100, message = "Screen resolution must be less than 100 characters")
    String screenResolution;

    @NotBlank(message = "Screen technology must not be blank")
    @Size(max = 100, message = "Screen technology must be less than 100 characters")
    String screenTech;

    @NotNull(message = "Chipset is required")
    @Positive(message = "Chipset must be a positive number")
    Integer chipset;

    @NotBlank(message = "Rear camera must not be blank")
    @Size(max = 255, message = "Rear camera info must be less than 255 characters")
    String rearCamera;

    @NotBlank(message = "Front camera must not be blank")
    @Size(max = 255, message = "Front camera info must be less than 255 characters")
    String frontCamera;

    @NotNull(message = "Warranty period is required")
    @PositiveOrZero(message = "Warranty period must be non-negative")
    Integer warrantyPeriod;

            @NotNull(message = "Brand ID must not be null")
            Integer brandId;

             @NotNull(message = "Warehouse area ID must not be null")
             String warehouseAreaId;

    @NotNull(message = "Stock quantity must not be null")
    @PositiveOrZero(message = "Stock quantity cannot be negative")
    Integer stockQuantity;


             Long categoryId;

    @NotNull(message = "Status must not be null")
    Boolean status;


}
