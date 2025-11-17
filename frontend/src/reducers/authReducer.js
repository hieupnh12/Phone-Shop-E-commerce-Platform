// hooks/useRoleAuth.js
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "../contexts/AuthContext";
import { useAuth } from ".";

export const useRoleAuth = (allowedRoles = []) => {
  const { data: isAuth, isLoading: authLoading } = useAuth();

  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: ["userRole"],
    queryFn: () => {
      const r = getUserRole();
      if (!r) throw new Error("No role");
      return r;
    },
    enabled: !!isAuth,
  });

  const isAllowed = allowedRoles.includes(role);

  return { isAuth, authLoading, role, roleLoading, isAllowed };
};