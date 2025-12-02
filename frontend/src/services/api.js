// src/services/api.js
import axios from "axios";
import Cookies from "js-cookie";

// Hardcode baseURL để đảm bảo đúng - ignore env variable nếu có vấn đề
// Nếu cần dùng env variable, uncomment dòng dưới và comment dòng hardcode
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/phoneShop';
const API_BASE_URL = "http://localhost:8080/phoneShop";

// Debug: Log baseURL để kiểm tra
console.log("🔧 API Base URL:", API_BASE_URL);
console.log("🔧 REACT_APP_API_URL env:", process.env.REACT_APP_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // important for session-based auth
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const cookieToken = Cookies.get("token");
    const localToken = localStorage.getItem("token");
    const token = cookieToken || localToken;

    console.log("🔍 Token check:", {
      hasCookieToken: !!cookieToken,
      hasLocalToken: !!localToken,
      hasToken: !!token,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token added to request");
    } else {
      console.warn("⚠️ No token found for request:", config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Helper function to determine if admin or customer and redirect
    const handleUnauthorized = () => {
      // Remove token from both Cookies and localStorage
      Cookies.remove("token");
      localStorage.removeItem("token");

      // Determine if this is an admin request
      const isAdminRequest =
        error.config?.url && error.config.url.includes("/admin");
      const isAdminPath = window.location.pathname.includes("/admin");

      if (isAdminRequest || isAdminPath) {
        // Admin: redirect to admin-login
        window.location.href = "/admin-login";
      } else {
        // Customer: redirect to login
        window.location.href = "/login";
      }
    };

    // Handle 401 Unauthorized
    if (status === 401) {
      handleUnauthorized();
    }

    // Handle 500 Internal Server Error
    if (status === 500) {
      handleUnauthorized();
    }

    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (email, password) =>
    api.post("/auth/login", { email, password }).then((r) => r.data),
  register: (userData) =>
    api.post("/auth/register", userData).then((r) => r.data),
  getCurrentUser: () => api.get("/auth/me").then((r) => r.data),
  refreshToken: () => api.post("/auth/refresh").then((r) => r.data),
};

// Product services
export const productService = {
  getProducts: (filters = {}) =>
    api.get("/products", { params: filters }).then((r) => r.data),
  getProduct: (id) => api.get(`/products/${id}`).then((r) => r.data),
  getFeaturedProducts: () => api.get("/products/featured").then((r) => r.data),
  getCategories: () => api.get("/categories").then((r) => r.data),
  searchProducts: (query) =>
    api
      .get(`/products/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.data),
};

// Cart services (dùng IMEI theo schema mới)
export const cartService = {
  // GET /api/cart  -> { success, cartItems:[...], grandTotal }
  getCart: () => api.get("/cart").then((r) => r.data),

  // POST /api/cart/add  body: { imei, quantity: 1 }
  addByImei: async (imei) => {
    const res = await api
      .post("/cart/add", { imei, quantity: 1 })
      .then((r) => r.data);
    // notify other components (Header) that cart changed
    try {
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (e) {
      /* noop */
    }
    return res;
  },

  // POST /cart/remove  body: { productVersionId }
  removeByProductVersionId: async (productVersionId) => {
    const res = await api
      .post("/cart/remove", { productVersionId })
      .then((r) => r.data);
    try {
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (e) {
      /* noop */
    }
    return res;
  },
  updateQuantity: async (productVersionId, quantity) => {
    const res = await api
      .post("/cart/update-quantity", { productVersionId, quantity })
      .then((r) => r.data);
    try {
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (e) {
      /* noop */
    }
    return res;
  },

  previewPayment: async (orderData) => {
    const res = await api
      .post("/cart/preview-payment", orderData)
      .then((r) => r.data);
    return res;
  },

  createOrder: async (orderData) => {
    const res = await api.post("/cart/checkout", orderData).then((r) => r.data);
    try {
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (e) {
      /* noop */
    }
    return res;
  },

  clearCart: async () => {
    const data = await api.get("/cart").then((r) => r.data);
    const items = data?.cartItems || [];
    for (const it of items) {
      await api
        .post("/cart/remove", { productVersionId: it.productVersionId })
        .then((r) => r.data);
    }
    try {
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (e) {
      /* noop */
    }
  },
};

export const orderService = {
  createOrder: (orderData) =>
    api.post("/orders", orderData).then((r) => r.data),
  getOrders: () => api.get("/orders").then((r) => r.data),
  getMyOrders: () => api.get("/orders/me").then((r) => r.data), // Get orders for current logged-in customer
  getOrder: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  updateOrderStatus: (id, status) =>
    api.put(`/orders/${id}/status`, { status }).then((r) => r.data),
};

export const customerService = {
  getMyCustomerInfo: () => api.get("/customer/me").then((r) => r.data),
  updateCustomer: (id, customerData) =>
    api.put(`/customer/update/${id}`, customerData).then((r) => r.data),
  // Address book services
  getAddresses: () => {
    console.log("Calling GET /customer/address-book");
    return api
      .get("/customer/address-book")
      .then((r) => {
        console.log("GET addresses response:", r.data);
        return r.data?.result || r.data || [];
      })
      .catch((err) => {
        console.error("Error getting addresses:", err);
        throw err;
      });
  },
  addAddress: (addressData) => {
    console.log("Calling POST /customer/address-book with data:", addressData);
    return api
      .post("/customer/address-book", addressData)
      .then((r) => {
        console.log("POST address response:", r.data);
        return r.data?.result || r.data;
      })
      .catch((err) => {
        console.error("Error adding address:", err);
        throw err;
      });
  },
  updateAddress: (id, addressData) => {
    console.log(
      "Calling PUT /customer/address-book/" + id + " with data:",
      addressData
    );
    return api
      .put(`/customer/address-book/${id}`, addressData)
      .then((r) => {
        console.log("PUT address response:", r.data);
        return r.data?.result || r.data;
      })
      .catch((err) => {
        console.error("Error updating address:", err);
        throw err;
      });
  },
  deleteAddress: (id) => {
    console.log("Calling DELETE /customer/address-book/" + id);
    return api
      .delete(`/customer/address-book/${id}`)
      .then((r) => {
        console.log("DELETE address response:", r.data);
        return r.data;
      })
      .catch((err) => {
        console.error("Error deleting address:", err);
        throw err;
      });
  },
};

export const userService = {
  getProfile: () => api.get("/users/profile").then((r) => r.data),
  updateProfile: (userData) =>
    api.put("/users/profile", userData).then((r) => r.data),
  changePassword: (passwordData) =>
    api.put("/users/change-password", passwordData).then((r) => r.data),
  getAddresses: () => api.get("/users/addresses").then((r) => r.data),
  addAddress: (addressData) =>
    api.post("/users/addresses", addressData).then((r) => r.data),
  updateAddress: (id, addressData) =>
    api.put(`/users/addresses/${id}`, addressData).then((r) => r.data),
  deleteAddress: (id) =>
    api.delete(`/users/addresses/${id}`).then((r) => r.data),
};

export const adminService = {
  // Products
  createProduct: (productData) =>
    api.post("/admin/products", productData).then((r) => r.data),
  updateProduct: (id, productData) =>
    api.put(`/admin/products/${id}`, productData).then((r) => r.data),
  deleteProduct: (id) =>
    api.delete(`/admin/products/${id}`).then((r) => r.data),

  // Categories
  createCategory: (categoryData) =>
    api.post("/admin/categories", categoryData).then((r) => r.data),
  updateCategory: (id, categoryData) =>
    api.put(`/admin/categories/${id}`, categoryData).then((r) => r.data),
  deleteCategory: (id) =>
    api.delete(`/admin/categories/${id}`).then((r) => r.data),

  // Orders
  getAllOrders: (filters = {}) =>
    api.get("/admin/orders", { params: filters }).then((r) => r.data),
  updateOrderStatus: (id, status) =>
    api.put(`/admin/orders/${id}/status`, { status }).then((r) => r.data),

  // Users
  getAllUsers: (filters = {}) =>
    api.get("/admin/users", { params: filters }).then((r) => r.data),
  updateUserRole: (id, role) =>
    api.put(`/admin/users/${id}/role`, { role }).then((r) => r.data),

  // Dashboard
  getDashboardStats: () =>
    api.get("/admin/dashboard/stats").then((r) => r.data),

  getAllRoles: () => api.get("/role").then((r) => r.data),
  getAllPermissions: () => api.get("/role/permission").then((r) => r.data),

  updateRole: (id, updateData) =>
    api.put(`/role/${id}`, updateData).then((r) => r.data),

  createRole: (roleData) => api.post("/role", roleData).then((r) => r.data),

  deleteRole: (id) => api.delete(`/role/${id}`).then((r) => r.data),
};

export const cusAuth = {
  getCustomer: () => api.get("/customer").then((res) => res.data.result),
};

export const profileService = {
  updateCustomer: (id, requestData) =>
    api
      .put(`/customer/update/${id}`, requestData) // Gọi endpoint PUT /customer/update/{id} (cho admin)
      .then((res) => res.data.result),

  updateMyProfile: (requestData) =>
    api
      .put(`/customer/me`, requestData) // Gọi endpoint PUT /customer/me (cho customer update profile của chính mình)
      .then((res) => res.data.result),

  getCustomerInfo: () =>
    api
      .get(`/customer/me`) // Gọi endpoint /customer/me
      .then((res) => res.data.result),

  getTotalOrders: (customerId) =>
    api
      .get(`/customer/total_orders/${customerId}`)
      .then((res) => res.data.result),

  getOrdersByCustomer: (customerId) =>
    api.get(`/customer/order/${customerId}`).then((res) => res.data.result),

  getOrderDetail: (orderId) =>
    api.get(`/customer/order_detail/${orderId}`).then((res) => res.data.result),
};

export const warrantyRequestService = {
  // Create warranty/return request
  createRequest: (requestData) =>
    api.post("/return-warranty-requests", requestData).then((res) => res.data),

  // Get my warranty requests (for customer)
  getMyRequests: () =>
    api
      .get("/return-warranty-requests/me")
      .then((res) => res.data.result || res.data),

  // Get all requests (for employee/admin)
  getAllRequests: (
    page = 0,
    size = 20,
    sort = "requestId,desc",
    status = null,
    startDate = null,
    endDate = null
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: sort,
    });
    // Chỉ thêm status vào params nếu nó có giá trị và không phải empty string
    if (status && status.trim() !== "") {
      params.append("status", status);
    }
    // Thêm date filters nếu có
    if (startDate && startDate.trim() !== "") {
      params.append("startDate", startDate);
    }
    if (endDate && endDate.trim() !== "") {
      params.append("endDate", endDate);
    }
    return api
      .get(`/return-warranty-requests?${params.toString()}`)
      .then((res) => {
        console.log("Warranty requests API response:", res.data);
        console.log("Response result:", res.data?.result);
        // Backend trả về ApiResponse<Page<ReturnWarrantyRequestResponse>>
        // Structure: { code, message, result: Page }
        return res.data.result || res.data;
      })
      .catch((err) => {
        console.error("Warranty requests API error:", err);
        console.error("Error response:", err.response?.data);
        throw err;
      });
  },

  // Get request by ID
  getRequestById: (requestId) =>
    api
      .get(`/return-warranty-requests/${requestId}`)
      .then((res) => res.data.result || res.data),

  // Update request status (for employee/admin)
  updateRequestStatus: (requestId, updateData) =>
    api
      .put(`/return-warranty-requests/${requestId}/status`, updateData)
      .then((res) => res.data.result || res.data),

  // Get requests assigned to current employee
  getMyAssignedRequests: (page = 0, size = 20, sort = "requestId,desc") => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: sort,
    });
    return api
      .get(`/return-warranty-requests/my-assigned?${params.toString()}`)
      .then((res) => {
        console.log("My assigned requests API response:", res.data);
        return res.data.result || res.data;
      })
      .catch((err) => {
        console.error("My assigned requests API error:", err);
        throw err;
      });
  },

  // Unassign request (remove from employee's list)
  unassignRequest: (requestId) =>
    api
      .put(`/return-warranty-requests/${requestId}/unassign`)
      .then((res) => res.data.result || res.data),
};

export default api;
