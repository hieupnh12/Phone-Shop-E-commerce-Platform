import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import constants from "../constants/index.js";

/**
 * Lấy tất cả scopes từ JWT token
 * @returns {string[]} Array of scopes (e.g., ["ROLE_ADMIN", "PRODUCT_CREATE_ALL", ...])
 */
export const getUserScopes = () => {
  const token = Cookies.get(constants.ACCESS_TOKEN_KEY);
  if (!token) return [];
  
  try {
    const decoded = jwtDecode(token);
    return decoded.scopes || [];
  } catch (e) {
    console.error("Lỗi khi giải mã token:", e);
    return [];
  }
};

/**
 * Lấy role đầu tiên từ JWT token
 * @returns {string|null} Role name (e.g., "ROLE_ADMIN") or null
 */
export const getUserRole = () => {
  const scopes = getUserScopes();
  const role = scopes.find(scope => scope.startsWith("ROLE_"));
  return role || null;
};

/**
 * Kiểm tra user có permission cụ thể không
 * @param {string} permission - Permission name (e.g., "PRODUCT_CREATE_ALL")
 * @returns {boolean}
 */
export const hasPermission = (permission) => {
  const scopes = getUserScopes();
  // Spring Security tự động thêm prefix "SCOPE_" khi check
  // Nhưng trong JWT scopes không có prefix này
  // Vậy cần check cả với và không có prefix
  return scopes.includes(permission) || scopes.includes(`SCOPE_${permission}`);
};

/**
 * Kiểm tra user có bất kỳ permission nào trong danh sách không
 * @param {string[]} permissions - Array of permission names
 * @returns {boolean}
 */
export const hasAnyPermission = (permissions) => {
  if (!permissions || permissions.length === 0) return false;
  return permissions.some(permission => hasPermission(permission));
};

/**
 * Kiểm tra user có tất cả permissions trong danh sách không
 * @param {string[]} permissions - Array of permission names
 * @returns {boolean}
 */
export const hasAllPermissions = (permissions) => {
  if (!permissions || permissions.length === 0) return false;
  return permissions.every(permission => hasPermission(permission));
};

/**
 * Kiểm tra user có role cụ thể không
 * @param {string|string[]} roles - Role name(s) (e.g., "ROLE_ADMIN" or ["ROLE_ADMIN", "ROLE_SALE"])
 * @returns {boolean}
 */
export const hasRole = (roles) => {
  const userRole = getUserRole();
  if (!userRole) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(userRole);
  }
  return userRole === roles;
};

/**
 * Kiểm tra user có phải là employee không (có role bắt đầu bằng ROLE_)
 * @returns {boolean}
 */
export const isEmployee = () => {
  const role = getUserRole();
  return role !== null && role.startsWith("ROLE_");
};

/**
 * Kiểm tra user có phải là customer không
 * @returns {boolean}
 */
export const isCustomer = () => {
  const scopes = getUserScopes();
  // Customer token không có ROLE_ prefix, chỉ có USER hoặc không có role
  return !scopes.some(scope => scope.startsWith("ROLE_"));
};

// Permission constants để dùng trong code (match với backend PermissionKeys scope format)
export const PERMISSIONS = {
  // PRODUCT
  PRODUCT_VIEW_ALL: "PRODUCT_VIEW_ALL",
  PRODUCT_CREATE_ALL: "PRODUCT_CREATE_ALL",
  PRODUCT_UPDATE_ALL: "PRODUCT_UPDATE_ALL",
  PRODUCT_DELETE_ALL: "PRODUCT_DELETE_ALL",
  PRODUCT_MANAGE_STOCK: "PRODUCT_MANAGE_STOCK",
  CATEGORY_MANAGE_ALL: "CATEGORY_MANAGE_ALL",
  
  // ORDER
  ORDER_VIEW_ALL: "ORDER_VIEW_ALL",
  ORDER_VIEW_DETAIL: "ORDER_VIEW_DETAIL",
  ORDER_CREATE_ALL: "ORDER_CREATE_ALL",
  ORDER_UPDATE_STATUS: "ORDER_UPDATE_STATUS",
  ORDER_CANCEL_ANY: "ORDER_CANCEL_ANY",
  ORDER_PROCESS_RETURN: "ORDER_PROCESS_RETURN",
  
  // CUSTOMER
  CUSTOMER_VIEW_ALL: "CUSTOMER_VIEW_ALL",
  CUSTOMER_UPDATE_BASIC: "CUSTOMER_UPDATE_BASIC",
  CUSTOMER_MANAGE_ACCOUNT: "CUSTOMER_MANAGE_ACCOUNT",
  
  // STAFF/SYSTEM
  STAFF_VIEW_ALL: "STAFF_VIEW_ALL",
  STAFF_UPDATE_BASIC: "STAFF_UPDATE_BASIC",
  STAFF_CREATE_ALL: "STAFF_CREATE_ALL",
  STAFF_MANAGE_ROLES: "STAFF_MANAGE_ROLES",
  SYSTEM_VIEW_AUDIT: "SYSTEM_VIEW_AUDIT",
  
  // REPORT
  REPORT_VIEW_SALES: "REPORT_VIEW_SALES",
  REPORT_VIEW_STOCK: "REPORT_VIEW_STOCK",
  
  // WARRANTY
  WARRANTY_VIEW_ALL: "WARRANTY_VIEW_ALL",
  WARRANTY_UPDATE_BASIC: "WARRANTY_UPDATE_BASIC",
};

