import axiosClient from "../api";
import { GET, POST } from "../constants/httpMethod";

const PRODUCT_API_ENDPOINT = '/product';

const productApi = {

  // Lấy danh sách sản phẩm với phân trang và lọc
  getAllProducts: (page = 0 , size = 1000) => {
    return axiosClient[GET](`${PRODUCT_API_ENDPOINT}?page=${page}&size=${size}`);
  }
}


  export default productApi;