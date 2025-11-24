// src/services/api.js
import axios from 'axios';
import Cookies from 'js-cookie';

// Hardcode baseURL để đảm bảo đúng - ignore env variable nếu có vấn đề
// Nếu cần dùng env variable, uncomment dòng dưới và comment dòng hardcode
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/phoneShop';
const API_BASE_URL = 'http://localhost:8080/phoneShop';

// Debug: Log baseURL để kiểm tra
console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🔧 REACT_APP_API_URL env:', process.env.REACT_APP_API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // important for session-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests (if you use JWT alongside session, keep it)
api.interceptors.request.use(
  (config) => {
    // Debug: Check token sources
    const cookieToken = Cookies.get('token');
    const localToken = localStorage.getItem('token');
    const token = cookieToken || localToken;
    
    console.log('🔍 Token check:', {
      hasCookieToken: !!cookieToken,
      hasLocalToken: !!localToken,
      hasToken: !!token,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to request');
    } else {
      console.warn('⚠️ No token found for request:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If API returns 401, remove token and redirect to login
      //localStorage.removeItem('token');
      // If API returns 401, remove token from both Cookies and localStorage
      Cookies.remove('token');
      // optionally you might want to only redirect for certain endpoints
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }).then(r => r.data),
  register: (userData) => api.post('/auth/register', userData).then(r => r.data),
  getCurrentUser: () => api.get('/auth/me').then(r => r.data),
  refreshToken: () => api.post('/auth/refresh').then(r => r.data),
};

// Product services
export const productService = {
  getProducts: (filters = {}) => api.get('/products', { params: filters }).then(r => r.data),
  getProduct: (id) => api.get(`/products/${id}`).then(r => r.data),
  getFeaturedProducts: () => api.get('/products/featured').then(r => r.data),
  getCategories: () => api.get('/categories').then(r => r.data),
  searchProducts: (query) => api.get(`/products/search?q=${encodeURIComponent(query)}`).then(r => r.data),
};

// Cart services (dùng IMEI theo schema mới)
export const cartService = {
  // GET /api/cart  -> { success, cartItems:[...], grandTotal }
  getCart: () => api.get('/cart').then(r => r.data),

  // POST /api/cart/add  body: { imei, quantity: 1 }
  addByImei: async (imei) => {
    const res = await api.post('/cart/add', { imei, quantity: 1 }).then(r => r.data);
    // notify other components (Header) that cart changed
    try { window.dispatchEvent(new CustomEvent('cartUpdated')); } catch (e) { /* noop */ }
    return res;
  },

  // POST /cart/remove  body: { productVersionId }
  removeByProductVersionId: async (productVersionId) => {
    const res = await api.post('/cart/remove', { productVersionId }).then(r => r.data);
    try { window.dispatchEvent(new CustomEvent('cartUpdated')); } catch (e) { /* noop */ }
    return res;
  },
    // ✅ THÊM MỚI: POST /cart/update-quantity  body: { productVersionId, quantity }
  updateQuantity: async (productVersionId, quantity) => {
    const res = await api.post('/cart/update-quantity', { productVersionId, quantity }).then(r => r.data);
    try { window.dispatchEvent(new CustomEvent('cartUpdated')); } catch (e) { /* noop */ }
    return res;
  },

  // ✅ THÊM MỚI: POST /api/cart/checkout  body: { items, subtotal, shippingFee, total, orderDate }
  createOrder: async (orderData) => {
    const res = await api.post('/cart/checkout', orderData).then(r => r.data);
    try { window.dispatchEvent(new CustomEvent('cartUpdated')); } catch (e) { /* noop */ }
    return res;
  },

  // Không có API clearCart -> gọi remove cho từng item, dùng removeByProductVersionId để phát event
  clearCart: async () => {
    const data = await api.get('/cart').then(r => r.data);
    const items = data?.cartItems || [];
    for (const it of items) {
      await api.post('/cart/remove', { productVersionId: it.productVersionId }).then(r => r.data);
    }
    // một lần notify sau khi clear xong
    try { window.dispatchEvent(new CustomEvent('cartUpdated')); } catch (e) { /* noop */ }
  },
};

// Order services
export const orderService = {
  createOrder: (orderData) => api.post('/orders', orderData).then(r => r.data),
  getOrders: () => api.get('/orders').then(r => r.data),
  getMyOrders: () => api.get('/orders/me').then(r => r.data), // Get orders for current logged-in customer
  getOrder: (id) => api.get(`/orders/${id}`).then(r => r.data),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }).then(r => r.data),
};

// Customer services
export const customerService = {
  getMyCustomerInfo: () => api.get('/customer/me').then(r => r.data),
  updateCustomer: (id, customerData) => api.put(`/customer/update/${id}`, customerData).then(r => r.data),
};

// User services
export const userService = {
  getProfile: () => api.get('/users/profile').then(r => r.data),
  updateProfile: (userData) => api.put('/users/profile', userData).then(r => r.data),
  changePassword: (passwordData) => api.put('/users/change-password', passwordData).then(r => r.data),
  getAddresses: () => api.get('/users/addresses').then(r => r.data),
  addAddress: (addressData) => api.post('/users/addresses', addressData).then(r => r.data),
  updateAddress: (id, addressData) => api.put(`/users/addresses/${id}`, addressData).then(r => r.data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`).then(r => r.data),
};

// Admin services
export const adminService = {
  // Products
  createProduct: (productData) => api.post('/admin/products', productData).then(r => r.data),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData).then(r => r.data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`).then(r => r.data),

  // Categories
  createCategory: (categoryData) => api.post('/admin/categories', categoryData).then(r => r.data),
  updateCategory: (id, categoryData) => api.put(`/admin/categories/${id}`, categoryData).then(r => r.data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`).then(r => r.data),

  // Orders
  getAllOrders: (filters = {}) => api.get('/admin/orders', { params: filters }).then(r => r.data),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }).then(r => r.data),

  // Users
  getAllUsers: (filters = {}) => api.get('/admin/users', { params: filters }).then(r => r.data),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }).then(r => r.data),

  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats').then(r => r.data),
};

export default api;
