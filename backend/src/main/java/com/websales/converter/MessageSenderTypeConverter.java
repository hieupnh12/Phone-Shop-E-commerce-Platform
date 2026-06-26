package com.websales.converter;

import com.websales.enums.MessageSenderType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MessageSenderTypeConverter implements AttributeConverter<MessageSenderType, String> {
    @Override
    public String convertToDatabaseColumn(MessageSenderType type) {
        return type == null ? null : type.name();
    }

    @Override
    public MessageSenderType convertToEntityAttribute(String dbData) {
        return dbData == null ? null : MessageSenderType.valueOf(dbData);
    }
}
