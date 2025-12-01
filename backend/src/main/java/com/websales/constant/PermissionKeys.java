package com.websales.constant;

public final class PermissionKeys {

    private PermissionKeys() {}



    // PRODUCT
    public static final String SCOPE_PRODUCT_VIEW_ALL = "PRODUCT_VIEW_ALL";
    public static final String SCOPE_PRODUCT_CREATE_ALL = "PRODUCT_CREATE_ALL";
    public static final String SCOPE_PRODUCT_UPDATE_ALL = "PRODUCT_UPDATE_ALL";
    public static final String SCOPE_PRODUCT_DELETE_ALL = "PRODUCT_DELETE_ALL";
    public static final String SCOPE_PRODUCT_MANAGE_STOCK = "PRODUCT_MANAGE_STOCK";
    public static final String SCOPE_CATEGORY_MANAGE_ALL = "CATEGORY_MANAGE_ALL";

    // ORDER
    public static final String SCOPE_ORDER_VIEW_ALL = "ORDER_VIEW_ALL";
    public static final String SCOPE_ORDER_VIEW_DETAIL = "ORDER_VIEW_DETAIL";
    public static final String SCOPE_ORDER_CREATE_ALL = "ORDER_CREATE_ALL";
    public static final String SCOPE_ORDER_UPDATE_STATUS = "ORDER_UPDATE_STATUS";
    public static final String SCOPE_ORDER_CANCEL_ANY = "ORDER_CANCEL_ANY";
    public static final String SCOPE_ORDER_PROCESS_RETURN = "ORDER_PROCESS_RETURN";

    // CUSTOMER
    public static final String SCOPE_CUSTOMER_VIEW_ALL = "CUSTOMER_VIEW_ALL";
    public static final String SCOPE_CUSTOMER_UPDATE_BASIC = "CUSTOMER_UPDATE_BASIC";
    public static final String SCOPE_CUSTOMER_MANAGE_ACCOUNT = "CUSTOMER_MANAGE_ACCOUNT";

    // STAFF/SYSTEM
    public static final String SCOPE_STAFF_VIEW_ALL = "STAFF_VIEW_ALL";
    public static final String SCOPE_STAFF_UPDATE_BASIC = "STAFF_UPDATE_BASIC";
    public static final String SCOPE_STAFF_CREATE_ALL = "STAFF_CREATE_ALL";
    public static final String SCOPE_STAFF_MANAGE_ROLES = "STAFF_MANAGE_ROLES";
    public static final String SCOPE_SYSTEM_VIEW_AUDIT = "SYSTEM_VIEW_AUDIT";

    // REPORT
    public static final String SCOPE_REPORT_VIEW_SALES = "REPORT_VIEW_SALES";
    public static final String SCOPE_REPORT_VIEW_STOCK = "REPORT_VIEW_STOCK";

    //WARRANTY
    public static final String SCOPE_WARRANTY_VIEW_ALL = "WARRANTY_VIEW_ALL";
    public static final String SCOPE_WARRANTY_UPDATE_BASIC  = "WARRANTY_UPDATE_BASIC";




    public static final String[] ALL_PERMISSIONS = {
            SCOPE_PRODUCT_VIEW_ALL,SCOPE_PRODUCT_CREATE_ALL, SCOPE_PRODUCT_UPDATE_ALL,
            SCOPE_CUSTOMER_VIEW_ALL,SCOPE_ORDER_PROCESS_RETURN,SCOPE_ORDER_CANCEL_ANY
            ,SCOPE_ORDER_UPDATE_STATUS,SCOPE_ORDER_CREATE_ALL,SCOPE_PRODUCT_DELETE_ALL,
            SCOPE_PRODUCT_MANAGE_STOCK,SCOPE_CATEGORY_MANAGE_ALL,SCOPE_ORDER_VIEW_ALL
            ,SCOPE_CUSTOMER_UPDATE_BASIC,
            SCOPE_STAFF_VIEW_ALL,
            SCOPE_CUSTOMER_MANAGE_ACCOUNT,
            SCOPE_STAFF_UPDATE_BASIC,
            SCOPE_STAFF_CREATE_ALL,
            SCOPE_STAFF_MANAGE_ROLES,
            SCOPE_SYSTEM_VIEW_AUDIT,
            SCOPE_REPORT_VIEW_SALES,
            SCOPE_REPORT_VIEW_STOCK,
            SCOPE_ORDER_VIEW_DETAIL,
            SCOPE_WARRANTY_VIEW_ALL,
            SCOPE_WARRANTY_UPDATE_BASIC

    };

}