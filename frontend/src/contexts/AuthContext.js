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

  // Check token on mount và lấy user info
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
      const response = await profileService.getCustomerInfo();
      setUser(response?.result);
    } catch (error) {
      // Token invalid, clear it
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
    }
    const responseInfo = await loginApi.getInfo();
    const userData = responseInfo?.result;
    if (userData) {
      setUser(userData);
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
    Cookies.remove(constants.ACCESS_TOKEN_KEY);
    setUser(null);
  };

  const sendOtp = async (sdt) => {
    const response = await loginApi.postLoginWithSDT(sdt);
    return response;
  };

  const verifyOtp = async (info) => {
    const response = await loginApi.verifySDT(info);
    const token = response?.result;

    if (token) {
      Cookies.set(constants.ACCESS_TOKEN_KEY, token);
      setUser(info?.rawPhone);
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
    verifyOtp
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const getUserRole = () => {
  const token =
    Cookies.get(constants.ACCESS_TOKEN_KEY);
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.scopes?.[0] || decoded.role || null;
  } catch (e) {
    return null;
  }
};

// Named export for direct context access in route wrappers
export { AuthContext };
