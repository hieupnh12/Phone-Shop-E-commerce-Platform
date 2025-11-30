package com.websales.constant;

public final class PermissionKeys {

    private PermissionKeys() {}

    // --- MODULE: PRODUCT ---
    public static final String PRODUCT_VIEW = "PRODUCT:VIEW:ALL";
    public static final String PRODUCT_CREATE = "PRODUCT:CREATE:ALL";
    public static final String PRODUCT_UPDATE = "PRODUCT:UPDATE:ALL";
    public static final String PRODUCT_DELETE = "PRODUCT:DELETE:ALL";
    public static final String PRODUCT_MANAGE_STOCK = "PRODUCT:MANAGE:STOCK";
    public static final String CATEGORY_MANAGE = "CATEGORY:MANAGE:ALL";


    // --- MODULE: ORDER ---
    public static final String ORDER_VIEW = "ORDER:VIEW:ALL";
    public static final String ORDER_DETAIL_VIEW = "ORDER:VIEW:DETAIL";
    public static final String ORDER_UPDATE_STATUS = "ORDER:UPDATE:STATUS";
    public static final String ORDER_CANCEL = "ORDER:CANCEL:ANY";
    public static final String ORDER_PROCESS_RETURN = "ORDER:PROCESS:RETURN";


    // --- MODULE: CUSTOMER ---
    public static final String CUSTOMER_VIEW = "CUSTOMER:VIEW:ALL";
    public static final String CUSTOMER_UPDATE = "CUSTOMER:UPDATE:BASIC";
    public static final String CUSTOMER_MANAGE_ACCOUNT = "CUSTOMER:MANAGE:ACCOUNT";


    // --- MODULE: STAFF/SYSTEM ---
    public static final String STAFF_VIEW = "STAFF:VIEW:ALL";
    public static final String STAFF_MANAGE_ROLES = "STAFF:MANAGE:ROLES";
    public static final String REPORT_VIEW_SALES = "REPORT:VIEW:SALES";
    public static final String REPORT_VIEW_STOCK = "REPORT:VIEW:STOCK";
    public static final String SYSTEM_VIEW_AUDIT = "SYSTEM:VIEW:AUDIT";
    public static final String STAFF_UPDATE = "STAFF:UPDATE:BASIC";
    public static final String STAFF_CREATE =  "STAFF:CREATE:ALL";

    public static final String[] ALL_PERMISSIONS = {
            PRODUCT_VIEW, PRODUCT_CREATE, PRODUCT_UPDATE, PRODUCT_DELETE, PRODUCT_MANAGE_STOCK, CATEGORY_MANAGE,
            ORDER_VIEW, ORDER_DETAIL_VIEW, ORDER_UPDATE_STATUS, ORDER_CANCEL, ORDER_PROCESS_RETURN,
            CUSTOMER_VIEW, CUSTOMER_UPDATE, CUSTOMER_MANAGE_ACCOUNT,
            STAFF_VIEW, STAFF_MANAGE_ROLES, REPORT_VIEW_SALES, REPORT_VIEW_STOCK, SYSTEM_VIEW_AUDIT, STAFF_UPDATE,
            STAFF_CREATE,
    };
}