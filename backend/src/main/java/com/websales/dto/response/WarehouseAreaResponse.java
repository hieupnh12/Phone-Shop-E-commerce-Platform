package com.websales.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarehouseAreaResponse {
    String idWarehouseArea;
    String nameWarehouseArea;

    String note;

    boolean status;
}