import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useRoleAuth } from "../reducers/authReducer";

export default function AdminRoute({ allowedRoles }) {
  const { isAuth, authLoading, roleLoading, isAllowed } = useRoleAuth(allowedRoles);
  if (authLoading || roleLoading) return <p>Loading...</p>;
  if (!isAuth || !isAllowed) return <Navigate to="/login" replace />;
  return <Outlet />;
}
