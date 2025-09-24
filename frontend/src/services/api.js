import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

// Product services
export const productService = {
  getProducts: (filters = {}) => api.get('/products', { params: filters }),
  getProduct: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: () => api.get('/products/featured'),
  getCategories: () => api.get('/categories'),
  searchProducts: (query) => api.get(`/products/search?q=${query}`),
};

// Cart services
export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
  updateCartItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
};

// Order services
export const orderService = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// User services
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (addressData) => api.post('/users/addresses', addressData),
  updateAddress: (id, addressData) => api.put(`/users/addresses/${id}`, addressData),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
};

// Admin services
export const adminService = {
  // Products
  createProduct: (productData) => api.post('/admin/products', productData),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  
  // Categories
  createCategory: (categoryData) => api.post('/admin/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/admin/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  
  // Orders
  getAllOrders: (filters = {}) => api.get('/admin/orders', { params: filters }),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  
  // Users
  getAllUsers: (filters = {}) => api.get('/admin/users', { params: filters }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
};

export default api;