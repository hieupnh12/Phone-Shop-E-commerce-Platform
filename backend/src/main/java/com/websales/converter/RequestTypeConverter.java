package com.websales.converter;

import com.websales.enums.RequestType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class RequestTypeConverter implements AttributeConverter<RequestType, String> {

    @Override
    public String convertToDatabaseColumn(RequestType attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name(); // Lưu dạng uppercase: WARRANTY, EXCHANGE
    }

    @Override
    public RequestType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        try {
            // Convert cả lowercase và uppercase sang enum
            return RequestType.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Nếu không tìm thấy enum, trả về WARRANTY làm mặc định
            return RequestType.WARRANTY;
        }
    }
}

