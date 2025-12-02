import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthFullOptions } from "../contexts/AuthContext";
import { usePermission } from "../hooks/usePermission";
import Loading from "../components/common/Loading";

/**
 * Route guard để bảo vệ admin routes
 * Cho phép tất cả employee (có role bắt đầu bằng "ROLE_") truy cập
 * Không cần hardcode danh sách roles, tự động hỗ trợ role mới
 * 
 * @param {string[]} allowedRoles - (Optional) Danh sách roles được phép. 
 *                                  Nếu không truyền hoặc rỗng, cho phép tất cả employee.
 *                                  Nếu truyền, chỉ cho phép các role trong danh sách (backward compatibility).
 */
export default function AdminRoute({ allowedRoles }) {
  const { user, loading: authLoading } = useAuthFullOptions();
  const { isEmployee, hasRole } = usePermission();

  // Nếu đang loading, hiển thị loading screen
  if (authLoading) return <Loading fullScreen type="dots" />;

  // Nếu không đăng nhập hoặc không phải employee, redirect về login
  if (!user || !isEmployee) {
    return <Navigate to="/admin-login" replace />;
  }

  // Nếu có allowedRoles được chỉ định (backward compatibility), kiểm tra role cụ thể
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = hasRole(allowedRoles);
    if (!hasAllowedRole) {
      return <Navigate to="/admin-login" replace />;
    }
  }

  return <Outlet />;
}
