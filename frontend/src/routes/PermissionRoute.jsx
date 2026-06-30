import React from "react";
import { Navigate } from "react-router-dom";
import { usePermission } from "../hooks/usePermission";
import { hasRole } from "../utils/permissionUtils";
import Loading from "../components/common/Loading";

/**
 * Route guard component để check permission trước khi render component
 * @param {object} props
 * @param {string|string[]} props.requiredPermission - Permission(s) cần thiết
 * @param {React.ReactNode} props.children - Component cần render nếu có permission
 * @param {string} props.fallbackPath - Path để redirect nếu không có permission (default: "/admin")
 */
export default function PermissionRoute({ 
  requiredPermission, 
  children, 
  fallbackPath = "/admin",
  allowAdmin = false,
}) {
  const { hasPermission, hasAnyPermission, isEmployee } = usePermission();

  // Nếu không phải employee, redirect
  if (!isEmployee) {
    return <Navigate to="/admin-login" replace />;
  }

  // Check permission
  let hasAccess = false;
  if (allowAdmin && hasRole("ROLE_ADMIN")) {
    hasAccess = true;
  } else if (Array.isArray(requiredPermission)) {
    hasAccess = hasAnyPermission(requiredPermission);
  } else if (requiredPermission) {
    hasAccess = hasPermission(requiredPermission);
  } else {
    hasAccess = true;
  }

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}

