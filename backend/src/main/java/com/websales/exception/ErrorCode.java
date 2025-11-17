package com.websales.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    SMS_FAILED(2000,"Gửi SMS thất bại. Vui lòng thử lại sau",HttpStatus.BAD_REQUEST),
    NOT_FIND_OTP(2001,"Không tìm thấy OTP",HttpStatus.BAD_REQUEST),
    OTP_EXPIRED(2002,"OTP đã hết hạn",HttpStatus.BAD_REQUEST),
    OTP_WRONG(2003,"OTP không đúng",HttpStatus.BAD_REQUEST),
    PRODUCT_NOT_EXIST(2004,"Product Not Exist", HttpStatus.NOT_FOUND),
    NAME_ALREADY_EXIST(2005,"Name Exist! ", HttpStatus.CONFLICT),
    SUPPLIER_NOT_EXIST(2006,"Supplier Not Exist", HttpStatus.NOT_FOUND),
    IMPORT_DETAIL_NOT_EXIST(2007,"ImportDetail Not Exist", HttpStatus.NOT_FOUND),
    FORM_ERROR(2008,"Form  Not Correct Because Not True JSON or Type ",  HttpStatus.UNSUPPORTED_MEDIA_TYPE),
    JSON_MAPPING_ERROR(2009,"Json Mapping Error",  HttpStatus.BAD_REQUEST),
    MISSING_REQUEST_PART(2010, "Missing request part", HttpStatus.BAD_REQUEST),
    INVALID_PARAMETER_TYPE(2011, "Invalid parameter type", HttpStatus.BAD_REQUEST),
    INVALID_JSON_FORMAT(2012, "Invalid JSON format or encoding", HttpStatus.BAD_REQUEST),
    IMPORT_RECEIPT_NOT_FOUND(2013, "Import Receipt Not Exist", HttpStatus.NOT_FOUND),
    PRODUCT_VERSION_NOT_FOUND(2014, "Product Version Not Exist", HttpStatus.NOT_FOUND),
    PRODUCT_ITEM_NOT_FOUND(2015, "Product Item Not Exist", HttpStatus.NOT_FOUND),
    EXPORT_RECEIPT_NOT_FOUND(2016, "Export Receipt Not Exist", HttpStatus.NOT_FOUND),
    EXPORT_DETAIL_NOT_FOUND(2017, "Export Detail Not Exist", HttpStatus.NOT_FOUND),
    INVALID_REQUEST(2018, "Invalid Request", HttpStatus.BAD_REQUEST),
    QUERY_TIMEOUT(2019, "Query Timeout", HttpStatus.SERVICE_UNAVAILABLE),
    CONCURRENT_MODIFICATION(2020, "Concurrent Modification", HttpStatus.CONFLICT),
    REQUEST_FIRST_NOT_FOUND(2021, "Request First Not Exist", HttpStatus.NOT_FOUND),
    IMEI_NOT_FOUND(2022, "IMEI Not Exist", HttpStatus.NOT_FOUND),
    NOT_SAME_VERSION(2023, "Not Same Version", HttpStatus.CONFLICT),
    PRODUCT_ITEM_HAD_EXPORT(2024, "Product Item Had Export", HttpStatus.NOT_FOUND),
    INVALID_QUANTITY(2025, "Invalid Quantity", HttpStatus.BAD_REQUEST),
    IMEI_DUPLICATE(2026, "Duplicate IMEI", HttpStatus.CONFLICT),
    ORIGIN_NOT_FOUND(2027, "Origin Not Exist", HttpStatus.NOT_FOUND),
    BRAND_NOT_FOUND(2028, "Brand Not Exist", HttpStatus.NOT_FOUND),
    OPERATING_SYSTEM_NOT_FOUND(2029, "Operating System Not Exist", HttpStatus.NOT_FOUND),
    RAM_NOT_FOUND(2030, "Ram Not Exist", HttpStatus.NOT_FOUND),
    ROM_NOT_FOUND(2031, "Rom Not Exist", HttpStatus.NOT_FOUND),
    COLOR_NOT_FOUND(2032, "Color Not Exist", HttpStatus.NOT_FOUND),
    IMPORT_RECEIPT_DETAIL_ALREADY_EXISTS(2033, "Import Receipt Detail Already Exists", HttpStatus.CONFLICT),
    PRODUCT_VERSION_QUANTITY_NOT_ENOUGH_TO_EXPORT(2034, "Product Quantity Not Enough To Export", HttpStatus.BAD_REQUEST),
    ERROR_UPDATE_QUANTITY(2035, "Error Update Quantity", HttpStatus.BAD_REQUEST),
     CATEGORY_NOT_FOUND(2036, "Category Not Exist", HttpStatus.NOT_FOUND),
   WRONG_FORM_IMEI(2037, "Wrong Form IMEI", HttpStatus.BAD_REQUEST),
    INVALID_KEY(1001, "Invalid message key", HttpStatus.BAD_REQUEST),
    ACCOUNT_NOT_EXIST(1002, "Wrong user name or password please try again !", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003,  "Username must be at least {min} characters ", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004,  "Password  must be at least {min} characters", HttpStatus.BAD_REQUEST),
    EMPLOYEE_NOT_EXIST(1005, "Employee not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "UNAUTHENTICATED", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission ", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Staff birth date must be from {min} age to {max}", HttpStatus.BAD_REQUEST),
    NOT_FOUND_EMAIL(1009, "Can not found email ", HttpStatus.NOT_FOUND),
    INVALID_TOKEN(1010, "Invalid token", HttpStatus.UNAUTHORIZED),
    EXPIRED_TOKEN(1011, "Time expired", HttpStatus.UNAUTHORIZED),
    PASSWORD_NOT_MATCH(1012, "Password not match", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXIT(1013, "Role not exit", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(1014, "Invalid email format", HttpStatus.BAD_REQUEST),
    PHONE_NUMBER_INVALID(1015, "Phone number must be 10 digits and start with 0", HttpStatus.BAD_REQUEST),
    FULL_NAME_NOT_BLANK(1016, "Please enter full name", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1017, "Wrong password", HttpStatus.BAD_REQUEST),
    INVALID_DATE_FORMAT(1018, "Invalid date format", HttpStatus.BAD_REQUEST),
    EMAIL_EXITED(1018, "Email already exited", HttpStatus.CONFLICT),
    ACCOUNT_EXITED(1019, "Account already exited", HttpStatus.CONFLICT),
    ROLE_EXITED(1020, "Role already exited", HttpStatus.CONFLICT),
    AUTHENTICATED_PASSWORD(1021, "Wrong user name or password please try again !", HttpStatus.BAD_REQUEST),
    AUTHENTICATED_PASSWORD_NOT_NULL(1022, "Please enter password", HttpStatus.BAD_REQUEST),
    AUTHENTICATED_USERNAME_NOT_NULL(1023, "Please enter user name", HttpStatus.BAD_REQUEST),
    TOKEN_STILL_VALID(1024, "A link reset password already send. Please check your email.",HttpStatus.BAD_REQUEST),
    ACCOUNT_INACTIVE(1025, "Account is inactive.",HttpStatus.BAD_REQUEST),
    FUNCTION_NOT_EXIST(1026, "Function not exist.",HttpStatus.BAD_REQUEST),
    CUSTOMER_NOT_EXIST(1027, "Customer not exist.",HttpStatus.BAD_REQUEST),
    INVENTORY_NOT_FOUND(1028, "Inventory not exist.",HttpStatus.BAD_REQUEST),
    PHONE_NUMBER_AVAILABLE(1029, "Phone number available  .",HttpStatus.BAD_REQUEST),
    PASSWORD_WEAK(1030, "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ in hoa, chữ thường, chữ số và ký tự đặc biệt @$!%*?&.",HttpStatus.BAD_REQUEST),
    LONG_USER_NAME(1031, "Cảnh báo: họ và tên không được vượt quá {max} kí tự", HttpStatus.BAD_REQUEST),
    WAREHOUSE_NOT_EXIST(1032, "Khong ton tai ", HttpStatus.BAD_REQUEST),
    WAREHOUSE_UNAVAILABLE(1033, "Khong ton tai ", HttpStatus.BAD_REQUEST),
    UNCATEGORIZE_EXCEPTION(1034, "Khong ton tai ", HttpStatus.BAD_REQUEST),
    OTP_VERIFY(1035,"OTP đã su dung",HttpStatus.BAD_REQUEST),
    OTP_ALREADY_VERIFIED(1036,"OTP already verified",HttpStatus.BAD_REQUEST),
    OTP_TOO_MANY_ATTEMPTS(1037,"OTP nhap sai qua 5 lan",HttpStatus.BAD_REQUEST),
    OTP_SEND_TOO_FAST(1038,"OTP gui qua nhanh",HttpStatus.BAD_REQUEST),
    OTP_SEND_LIMIT(1039,"OTP co the gui toi da 5 lan tren 10 phut",HttpStatus.BAD_REQUEST),

    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private int code;
    private String message;
    private HttpStatusCode statusCode;


}