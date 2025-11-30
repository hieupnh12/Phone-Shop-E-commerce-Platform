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

    public static final String SYSTEM_VIEW_AUDIT = "SYSTEM:VIEW:AUDIT";
    public static final String STAFF_UPDATE = "STAFF:UPDATE:BASIC";
    public static final String STAFF_CREATE =  "STAFF:CREATE:ALL";

    //STAFF

    //ROLE
    public static final String STAFF_MANAGE_ROLES = "STAFF:MANAGE:ROLES";


    //REPOST
    public static final String REPORT_VIEW_SALES = "REPORT:VIEW:SALES";
    public static final String REPORT_VIEW_STOCK = "REPORT:VIEW:STOCK";


    public static final String[] ALL_PERMISSIONS = {
            PRODUCT_VIEW, PRODUCT_CREATE, PRODUCT_UPDATE, PRODUCT_DELETE, PRODUCT_MANAGE_STOCK, CATEGORY_MANAGE,
            ORDER_VIEW, ORDER_DETAIL_VIEW, ORDER_UPDATE_STATUS, ORDER_CANCEL, ORDER_PROCESS_RETURN,
            CUSTOMER_VIEW, CUSTOMER_UPDATE, CUSTOMER_MANAGE_ACCOUNT,
            STAFF_VIEW, STAFF_MANAGE_ROLES, REPORT_VIEW_SALES, REPORT_VIEW_STOCK, SYSTEM_VIEW_AUDIT, STAFF_UPDATE,
            STAFF_CREATE,
    };

    // --- SCOPE FORMAT (for JWT and @PreAuthorize) ---
    // Format: MODULE_ACTION_RESOURCE (with underscore, no colon)
    // These are the actual scopes that appear in JWT after buildScopeList()
    // Spring Security adds "SCOPE_" prefix automatically via SecurityConfig

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
}