// src/services/cartService.js
import axiosClient from "../api";
import { GET, POST } from "../constants/httpMethod";

// Cart services (dùng ProductVersionId)
const cartService = {

  // GET /cart
  getCart: async () => {
    const res = await axiosClient[GET]('/cart');
    return res;
  },

  // POST /cart/add  body: { productVersionId, quantity }
  addToCart: async (productVersionId, quantity = 1) => {
    const res = await axiosClient[POST]('/cart/add', {
      productVersionId,
      quantity
    });

    try { 
      window.dispatchEvent(new CustomEvent('cartUpdated')); 
    } catch (_) {}

    return res;
  },

  // POST /cart/remove  body: { productVersionId }
  removeItem: async (productVersionId) => {
    const res = await axiosClient[POST]('/cart/remove', {
      productVersionId
    });

    try { 
      window.dispatchEvent(new CustomEvent('cartUpdated')); 
    } catch (_) {}

    return res;
  },

  // POST /cart/update-quantity  body: { productVersionId, quantity }
  updateQuantity: async (productVersionId, quantity) => {
    const res = await axiosClient[POST]('/cart/update-quantity', {
      productVersionId,
      quantity
    });

    try { 
      window.dispatchEvent(new CustomEvent('cartUpdated')); 
    } catch (_) {}

    return res;
  },

  // POST /cart/checkout
  checkout: async (orderData) => {
    const res = await axiosClient[POST]('/cart/checkout', orderData);

    try { 
      window.dispatchEvent(new CustomEvent('cartUpdated')); 
    } catch (_) {}

    return res;
  },
  // POST /cart/checkout  (alias cho createOrder)
createOrder: async (orderData) => {
  const res = await axiosClient[POST]('/cart/checkout', orderData);

  try { 
    window.dispatchEvent(new CustomEvent('cartUpdated')); 
  } catch (_) {}

  return res;
},

  // CLEAR CART — xoá từng sản phẩm (nếu cần)
  clearCart: async () => {
    const data = await axiosClient[GET]('/cart').then(r => r.data);
    const items = data?.cartItems || [];

    for (const it of items) {
      await axiosClient[POST]('/cart/remove', { productVersionId: it.productVersionId });
    }

    try { 
      window.dispatchEvent(new CustomEvent('cartUpdated')); 
    } catch (_) {}
  }
};

export default cartService;
