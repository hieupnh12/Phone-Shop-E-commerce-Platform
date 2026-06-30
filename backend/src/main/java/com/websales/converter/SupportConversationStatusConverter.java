package com.websales.converter;

import com.websales.enums.SupportConversationStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SupportConversationStatusConverter implements AttributeConverter<SupportConversationStatus, String> {
    @Override
    public String convertToDatabaseColumn(SupportConversationStatus status) {
        return status == null ? null : status.name();
    }

    @Override
    public SupportConversationStatus convertToEntityAttribute(String dbData) {
        return dbData == null ? null : SupportConversationStatus.valueOf(dbData);
    }
}
