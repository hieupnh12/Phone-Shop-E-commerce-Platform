// src/services/customerService.js
import axiosClient from "../api";
import { GET, POST, PUT } from "../constants/httpMethod";
const customerService = {
  getMyCustomerInfo: () => axiosClient[GET]("/customer/me"),

  updateCustomer: (id, customerData) =>
    axiosClient[PUT](`/customer/update/${id}`, customerData),

  createCustomer: (form) =>
    axiosClient[POST](`/customer`, form),

  getAllInfo: (keyword, page, size) => {
    const safePage = Number(page) || 0;
    const safeSize = Number(size) || 10;

    const paramsObj = {
      keyword: keyword || "",
      page: safePage,
      size: safeSize,
    };

    const urlParams = new URLSearchParams();
    for (const [key, value] of Object.entries(paramsObj)) {
      if (value !== undefined && value !== null && value !== "") {
        urlParams.append(key, value);
      }
    }

    return axiosClient.get(`/customer/search?${urlParams.toString()}`);
  },

  // Method mới để tìm kiếm theo số điện thoại hoặc email
  searchByPhoneOrEmail: (keyword, page, size) => {
    const safePage = Number(page) || 0;
    const safeSize = Number(size) || 10;
    const params = new URLSearchParams({
      keyword: keyword || "",
      page: safePage,
      size: safeSize,
    });
    return axiosClient.get(`/customer/search/phone-or-email?${params.toString()}`);
  },

  // Method để lấy gợi ý khi gõ 4 số đầu
  getPhoneSuggestions: (prefix) => {
    if (!prefix || prefix.length < 4) {
      return Promise.resolve({ result: [] });
    }
    return axiosClient.get(`/customer/suggestions/phone?prefix=${encodeURIComponent(prefix)}`);
  },
};
export default customerService;
