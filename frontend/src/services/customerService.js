// src/services/customerService.js
import axiosClient from "../api";
import { GET, PUT } from "../constants/httpMethod";
const customerService = {
  getMyCustomerInfo: () => axiosClient[GET]('/customer/me').then(r => r.data),
  updateCustomer: (id, customerData) =>
    axiosClient[PUT](`/customer/update/${id}`, customerData).then(r => r.data),
};
export default customerService;
