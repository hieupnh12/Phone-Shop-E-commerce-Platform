// src/services/customerService.js
import axiosClient from "../api";
import { GET, PUT } from "../constants/httpMethod";
const customerService = {
  getMyCustomerInfo: () => axiosClient[GET]('/customer/me'),
  updateCustomer: (id, customerData) =>
    axiosClient[PUT](`/customer/update/${id}`, customerData),

  getAllInfo: (keyword, page, size) => {
  return axiosClient.get("/customer/search", {
    params: { keyword, page, size }
  });
}
};
export default customerService;
