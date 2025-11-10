package com.websales.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {

    WAREHOUSE_UNAVAILABLE(2001,"Warehouse area is currently unavailable, cannot add product.",HttpStatus.SERVICE_UNAVAILABLE),
    WAREHOUSE_NOT_EXIST(2002, "Warehouse Not Exist", HttpStatus.NOT_FOUND),
    WAREHOUSE_INVALID(2003,"Name must be at least 3 characters", HttpStatus.BAD_REQUEST),
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


    INVALID_KEY(1001, "Invalid message key", HttpStatus.BAD_REQUEST),


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