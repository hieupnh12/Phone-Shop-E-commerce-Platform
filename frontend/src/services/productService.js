import axiosClient from "../api";
import { GET, POST, PATCH, PUT, DELETE } from "../constants/httpMethod";

const PRODUCT_API = "/product";
const PRODUCT_VERSION_API = "/productVersion";

const productService = {

  initProduct: () => {
    return axiosClient[POST](`${PRODUCT_API}/init`, {});
  },


  getProducts: (page = 0, size = 10) => {
    return axiosClient[GET](`${PRODUCT_API}`, {
      params: { page, size },
    });
  },

  searchProducts: (filters = {}, page = 0, size = 10) => {
    return axiosClient[GET](`${PRODUCT_API}/search`, {
      params: {
        ...filters,
        page,
        size,
      },
    });
  },

  createProduct: async (productData, imageFile) => {
    const formData = new FormData();
    

    formData.append("product", new Blob([JSON.stringify(productData.product)], { type: "application/json" }));
    

    if (imageFile) {
      formData.append("image", imageFile);
    }

    return axiosClient.post(`${PRODUCT_API}/full/confirm`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).then(r => r.data);
  },


  updateProduct: (productId, updateData) => {
    return axiosClient[PATCH](`${PRODUCT_API}/${productId}`, updateData);
  },

  deleteProduct: (productId) => {
    return axiosClient[DELETE](`${PRODUCT_API}/${productId}`);
  },

  updateProductVersion: (versionId, updateData) => {
    return axiosClient[PUT](`${PRODUCT_VERSION_API}/${versionId}`, updateData);
  },
};

export default productService;
