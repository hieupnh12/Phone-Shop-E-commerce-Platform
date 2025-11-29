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
};
export default customerService;
