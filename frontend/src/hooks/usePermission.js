import { useMemo } from "react";
import { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, getUserScopes, getUserRole, PERMISSIONS } from "../utils/permissionUtils";

/**
 * Hook để check permission trong component
 * @returns {object} Object chứa các functions và data về permission
 */
export const usePermission = () => {
  const scopes = useMemo(() => getUserScopes(), []);
  const role = useMemo(() => getUserRole(), []);

  return {
    scopes,
    role,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isEmployee: role !== null && role.startsWith("ROLE_"),
    isCustomer: !scopes.some(scope => scope.startsWith("ROLE_")),
  };
};

// Export PERMISSIONS để dùng trong components
export { PERMISSIONS };

