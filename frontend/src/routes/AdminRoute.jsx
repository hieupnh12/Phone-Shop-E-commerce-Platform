import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useRoleAuth } from "../reducers/authReducer";
import Loading from "../components/common/Loading";

export default function AdminRoute({ allowedRoles }) {
  const { isAuth, authLoading, roleLoading, isAllowed } = useRoleAuth(allowedRoles);
  if (authLoading || roleLoading) return <Loading fullScreen type="dots" />;
  if (!isAuth || !isAllowed) return <Navigate to="/login" replace />;
  return <Outlet />;
}
