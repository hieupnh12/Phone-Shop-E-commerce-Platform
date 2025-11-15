package com.websales.validation;

import java.util.regex.Pattern;

public final class PhoneUtils {

    private static final Pattern VN_PHONE_PATTERN = Pattern.compile(
            "^(\\+?84|0)(3|5|7|8|9)([0-9]{8})$"
    );

    private PhoneUtils() {}

    public static String normalize(String rawPhone) {
        if (rawPhone == null || rawPhone.isBlank()) {
            throw new IllegalArgumentException("Số điện thoại không được để trống");
        }

        String cleaned = rawPhone.replaceAll("\\D", "");

        if (cleaned.startsWith("0") && cleaned.length() == 10) {
            return "84" + cleaned.substring(1);
        }

        if (cleaned.startsWith("84") && cleaned.length() == 11) {
            return cleaned;
        }

        throw new IllegalArgumentException("Số điện thoại không hợp lệ: " + rawPhone);
    }

    public static boolean isValidVietnamPhone(String phone) {
        try {
            normalize(phone);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}