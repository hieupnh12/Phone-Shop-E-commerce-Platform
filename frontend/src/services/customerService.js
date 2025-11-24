// src/services/customerService.js
import axiosClient from "../api";
import { GET, PUT } from "../constants/httpMethod";
const customerService = {
  // axiosClient interceptor đã trả về response.data rồi, không cần .then(r => r.data)
  getMyCustomerInfo: () => axiosClient[GET]('/customer/me'),
  updateCustomer: (id, customerData) =>
    axiosClient[PUT](`/customer/update/${id}`, customerData),
};
export default customerService;
