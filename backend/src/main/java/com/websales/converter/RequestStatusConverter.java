package com.websales.converter;

import com.websales.enums.RequestStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class RequestStatusConverter implements AttributeConverter<RequestStatus, String> {

    @Override
    public String convertToDatabaseColumn(RequestStatus attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name(); // Lưu dạng uppercase: PENDING, ACCEPTED, etc.
    }

    @Override
    public RequestStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        try {
            // Convert cả lowercase và uppercase sang enum
            return RequestStatus.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Nếu không tìm thấy enum, trả về PENDING làm mặc định
            return RequestStatus.PENDING;
        }
    }
}

