import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import constants from "../constants/index.js";
import loginApi from "../services/loginService.js";
import {profileService} from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleCustomerLoginSuccess = (token) => {
    if (token) {
      Cookies.set(constants.ACCESS_TOKEN_KEY, token);
      getCurrentUser();
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
      let response;

      const isEmployeeRole = role && role !== 'USER' && role.startsWith('ROLE_');

      if (isEmployeeRole) {
        response = await loginApi.getInfo();
      } else if (role === 'USER') {
        response = await profileService.getCustomerInfo();
      } else {
        setLoading(false);
        return;
      }

      setUser(response?.result);

    } catch (error) {
      console.error("Lỗi khi fetch thông tin người dùng:", error);
      Cookies.remove(constants.ACCESS_TOKEN_KEY);
      setUser(null);
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
    const response = await loginApi.verifySDT(info);
    const token = response?.result;

    if (token) {
      // Cookies.set(constants.ACCESS_TOKEN_KEY, token);
      // setUser(info?.rawPhone);
      handleCustomerLoginSuccess(token);
    }
    return response;
  }

  const value = {
    user,
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

    if (decoded.scopes && decoded.scopes.length > 0) {
      return decoded.scopes[0];
    }

    return decoded.role || null;

  } catch (e) {
    console.error("Lỗi khi giải mã token:", e);
    return null;
  }
};

// Named export for direct context access in route wrappers
export { AuthContext };
