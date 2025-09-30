import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
 const role = 12//getUserRole();
  if (role !== "ROLE_ADMIN") {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}


/**
 * export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.roles?.[0] || null; // giả sử có roles trong payload
  } catch (e) {
    return null;
  }
};
 */