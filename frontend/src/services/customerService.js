// src/services/customerService.js
import axiosClient from "../api";
import { GET, PUT } from "../constants/httpMethod";
const customerService = {
  getMyCustomerInfo: () => axiosClient[GET]('/customer/me'),
  updateCustomer: (id, customerData) =>
    axiosClient[PUT](`/customer/update/${id}`, customerData),
};
export default customerService;
