import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import constants from "../constants/index.js";
import loginApi from "../services/loginService.js";
import {profileService} from "../services/api";

const AuthContext = createContext();

export const useAuthFullOptions = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleCustomerLoginSuccess = async (token) => {
    if (token) {
      Cookies.set(constants.ACCESS_TOKEN_KEY, token);
      await getCurrentUser();
    }
  };
  useEffect(() => {
    const token = Cookies.get(constants.ACCESS_TOKEN_KEY);
    if (token) {
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const getCurrentUser = async () => {
    try {
      const role = getUserRole(); // Lấy vai trò (ROLE_SALE, USER,...)
      console.log("🔍 getUserRole returned:", role);
      let response;

      const isEmployeeRole = role && role !== 'USER' && role.startsWith('ROLE_');

      if (isEmployeeRole) {
        response = await loginApi.getInfo();
      } else if (role === 'USER') {
        response = await profileService.getCustomerInfo();
      } else {
        // Nếu không có role, có thể là customer token mới (chỉ có scopes)
        // Thử gọi getCustomerInfo() để xem có phải customer không
        console.log("⚠️ No role found, trying to get customer info...");
        try {
          response = await profileService.getCustomerInfo();
          console.log("✅ Successfully got customer info without role");
        } catch (err) {
          console.log("❌ Failed to get customer info:", err);
          setLoading(false);
          return;
        }
      }

      // Backend trả {customerId, fullName, ...} hoặc {result: {...}}
      const userData = response?.result || response;
      console.log("✅ Setting user:", userData);
      setUser(userData);

    } catch (error) {
      console.error("❌ Error in getCurrentUser:", error);
      // Chỉ remove token nếu lỗi là 401 (Unauthorized)
      if (error.response?.status === 401) {
        Cookies.remove(constants.ACCESS_TOKEN_KEY);
        setUser(null);
      } else {
        // Với các lỗi khác, giữ nguyên token và user
        console.warn("⚠️ Non-401 error, keeping token and user state");
      }
    } finally {
      setLoading(false);
    }
  };

  const loginEmployee = async (account) => {
    const response = await loginApi.postLogin(account);
    const token = response?.result?.token || response?.token;

    if (token) {
      Cookies.set(constants.ACCESS_TOKEN_KEY, token);

      await getCurrentUser();
      
    }

    return response;
  };

  const logout = async () => {
    const response = await loginApi.postLogout();
    Cookies.remove(constants.ACCESS_TOKEN_KEY);
    setUser(null);
    return response;
    
  };

  const logoutCustomer = async () => {
    const response = await loginApi.postLogout();
    Cookies.remove(constants.ACCESS_TOKEN_KEY);
    setUser(null);
    return response;
  };

  const sendOtp = async (sdt) => {
    const response = await loginApi.postLoginWithSDT(sdt);
    return response;
  };

  const verifyOtp = async (info) => {
    console.log("🔍 verifyOtp called with:", info);
    const response = await loginApi.verifySDT(info);
    console.log("🔍 verifySDT response:", response);
    const token = response?.result;

    if (token) {
      console.log("✅ Token received:", token.substring(0, 20) + "...");
      await handleCustomerLoginSuccess(token);
      console.log("✅ handleCustomerLoginSuccess completed");
    } else {
      console.log("⚠️ No token in response");
    }
    return response;
  }

  const value = {
    user,
    setUser,
    loading,
    loginEmployee,
    logout,
    getCurrentUser,
    logoutCustomer,
    sendOtp,
    verifyOtp,
    handleCustomerLoginSuccess
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const getUserRole = () => {
  const token =
      Cookies.get(constants.ACCESS_TOKEN_KEY);
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);

    // Ưu tiên lấy role từ claim "role"
    if (decoded.role) {
      return decoded.role;
    }

    // Nếu không có role claim, tìm ROLE_ trong scopes
    if (decoded.scopes && decoded.scopes.length > 0) {
      const roleScope = decoded.scopes.find(scope => scope.startsWith('ROLE_'));
      if (roleScope) {
        return roleScope;
      }
      // Nếu không có ROLE_ scope nhưng có scopes, có thể là customer token
      // Return "USER" để đảm bảo getCurrentUser() chạy đúng
      return "USER";
    }

    return null;

  } catch (e) {
    console.error("Lỗi khi giải mã token:", e);
    return null;
  }
};

export { AuthContext };
