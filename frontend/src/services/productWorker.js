/**
 * Product Service Worker
 * Handles all product-related API calls and caching
 * Backend API Base: /api/product (or /product if no /api prefix)
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance for product API
const productAPI = axios.create({
  baseURL: `${API_BASE_URL}/product`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
productAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors
productAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Cache management
 */
const cache = {
  products: {
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000, // 5 minutes
  },
  productDetail: {},
  categories: {
    data: null,
    timestamp: null,
    ttl: 10 * 60 * 1000, // 10 minutes
  },
};

// Helper to check if cache is valid
const isCacheValid = (cacheEntry) => {
  if (!cacheEntry.data || !cacheEntry.timestamp) return false;
  return Date.now() - cacheEntry.timestamp < cacheEntry.ttl;
};

// Helper to clear cache
const clearCache = (key) => {
  if (cache[key]) {
    cache[key].data = null;
    cache[key].timestamp = null;
  }
};

/**
 * Transform backend ProductFULLResponse to frontend format
 * Backend fields → Frontend fields mapping
 */
const transformProductResponse = (backendProduct) => {
  if (!backendProduct) return null;

  return {
    id: backendProduct.idProduct,
    name: backendProduct.nameProduct,
    image: backendProduct.image,
    price: backendProduct.productVersionResponses?.[0]?.price || 0,
    discount: backendProduct.productVersionResponses?.[0]?.discount || 0,
    rating: backendProduct.productVersionResponses?.[0]?.rating || 0,
    reviewCount: backendProduct.productVersionResponses?.[0]?.reviewCount || 0,
    inStock: backendProduct.stockQuantity > 0,
    stockQuantity: backendProduct.stockQuantity,
    status: backendProduct.status,
    
    // Full details
    description: backendProduct.descriptionProduct || '',
    brand: backendProduct.brandName,
    origin: backendProduct.originName,
    category: backendProduct.categoryName,
    warehouseArea: backendProduct.warehouseAreaName,
    operatingSystem: backendProduct.operatingSystemName,
    
    // Specifications
    specifications: {
      'Chipset': backendProduct.chipset,
      'Battery': backendProduct.battery,
      'Screen Size': backendProduct.screenSize,
      'Screen Resolution': backendProduct.screenResolution,
      'Screen Technology': backendProduct.screenTech,
      'Scan Frequency': backendProduct.scanFrequency,
      'Rear Camera': backendProduct.rearCamera,
      'Front Camera': backendProduct.frontCamera,
      'Warranty Period': backendProduct.warrantyPeriod ? `${backendProduct.warrantyPeriod} months` : 'N/A',
    },

    // Version details
    versions: backendProduct.productVersionResponses?.map((v) => ({
      id: v.idProductVersion,
      ram: v.ramName,
      rom: v.romName,
      color: v.colorName,
      price: v.price,
      discount: v.discount,
      imei: v.imei,
    })) || [],

    // Raw backend data (for reference)
    _raw: backendProduct,
  };
};

/**
 * Fetch all products with pagination and filtering
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size (default: 10)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} { products: [], total, page, size }
 */
export const fetchAllProducts = async (page = 0, size = 10, filters = {}) => {
  try {
    // Check cache for default parameters
    if (!filters || Object.keys(filters).length === 0) {
      if (isCacheValid(cache.products)) {
        console.log('✓ Products from cache');
        return cache.products.data;
      }
    }

    const params = {
      page,
      size,
      ...filters,
    };

    console.log('📡 Fetching products:', params);
    const response = await productAPI.get('/', { params });

    // Handle response: backend returns ApiResponse wrapper
    const result = response.data?.result || response.data;

    // Transform paginated response
    const transformedData = {
      products: (result.content || result.products || []).map(transformProductResponse),
      total: result.totalElements || result.total || 0,
      page: result.number || page,
      size: result.size || size,
      totalPages: result.totalPages || Math.ceil((result.totalElements || 0) / size),
    };

    // Cache the result
    if (!filters || Object.keys(filters).length === 0) {
      cache.products.data = transformedData;
      cache.products.timestamp = Date.now();
    }

    console.log('✓ Products fetched:', transformedData.products.length);
    return transformedData;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetch single product by ID
 * @param {number} productId - Product ID (idProduct)
 * @returns {Promise<Object>} Transformed product object
 */
export const fetchProductById = async (productId) => {
  try {
    // Check detail cache
    if (cache.productDetail[productId] && isCacheValid(cache.productDetail[productId])) {
      console.log('✓ Product detail from cache');
      return cache.productDetail[productId].data;
    }

    console.log('📡 Fetching product by ID:', productId);
    
    // Try different endpoint variations
    let response;
    try {
      // Try: GET /api/product/{id}
      response = await productAPI.get(`/${productId}`);
    } catch (err) {
      if (err.response?.status === 404) {
        // Try alternative: GET /api/products/{id}
        console.log('Trying alternative endpoint...');
        const alt = axios.create({ baseURL: `${API_BASE_URL}/products` });
        response = await alt.get(`/${productId}`);
      } else {
        throw err;
      }
    }

    const result = response.data?.result || response.data;
    const transformed = transformProductResponse(result);

    // Cache the result
    cache.productDetail[productId] = {
      data: transformed,
      timestamp: Date.now(),
      ttl: 10 * 60 * 1000, // 10 minutes
    };

    console.log('✓ Product fetched:', transformed.name);
    return transformed;
  } catch (error) {
    console.error('❌ Error fetching product detail:', error);
    throw error;
  }
};

/**
 * Fetch product by IMEI (unique identifier)
 * @param {string} imei - IMEI code
 * @returns {Promise<Object>} Transformed product object
 */
export const fetchProductByImei = async (imei) => {
  try {
    console.log('📡 Fetching product by IMEI:', imei);
    const response = await productAPI.get(`/imei/${imei}`);
    const result = response.data?.result || response.data;
    return transformProductResponse(result);
  } catch (error) {
    console.error('❌ Error fetching product by IMEI:', error);
    throw error;
  }
};

/**
 * Search products
 * @param {Object} filters - Search filters
 * @param {string} filters.productName - Product name (partial match)
 * @param {string} filters.brandName - Brand name
 * @param {string} filters.originName - Origin name
 * @param {string} filters.operatingSystemName - OS name
 * @param {string} filters.warehouseAreaName - Warehouse area
 * @param {number} page - Page number
 * @param {number} size - Page size
 * @returns {Promise<Object>} Paginated products
 */
export const searchProducts = async (filters, page = 0, size = 10) => {
  try {
    console.log('📡 Searching products:', filters);
    const response = await productAPI.get('/search', {
      params: { ...filters, page, size },
    });
    const result = response.data?.result || response.data;
    return {
      products: (result.content || result || []).map(transformProductResponse),
      total: result.totalElements || 0,
      page: result.number || page,
      size: result.size || size,
    };
  } catch (error) {
    console.error('❌ Error searching products:', error);
    throw error;
  }
};

/**
 * Fetch product categories (if endpoint exists)
 * @returns {Promise<Array>} List of categories
 */
export const fetchCategories = async () => {
  try {
    // Check cache
    if (isCacheValid(cache.categories)) {
      console.log('✓ Categories from cache');
      return cache.categories.data;
    }

    // Try common endpoints for categories
    let response;
    try {
      response = await axios.get(`${API_BASE_URL}/categories`);
    } catch {
      // Fallback
      response = await axios.get(`${API_BASE_URL}/category`);
    }

    const categories = response.data?.result || response.data || [];

    // Cache result
    cache.categories.data = categories;
    cache.categories.timestamp = Date.now();

    console.log('✓ Categories fetched:', categories.length);
    return categories;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return [];
  }
};

/**
 * Initialize/fetch product statistics (if endpoint exists)
 * @returns {Promise<Object>} Product stats
 */
export const fetchProductStats = async () => {
  try {
    console.log('📡 Fetching product stats...');
    const response = await productAPI.get('/countProduct');
    const result = response.data?.result || response.data;
    console.log('✓ Stats fetched:', result);
    return result;
  } catch (error) {
    console.warn('⚠ Could not fetch product stats:', error.message);
    return {};
  }
};

/**
 * Initialize product (if needed)
 * @returns {Promise<Object>} Initialization result
 */
export const initializeProducts = async () => {
  try {
    console.log('📡 Initializing products...');
    const response = await productAPI.post('/init');
    const result = response.data?.result || response.data;
    clearCache('products');
    console.log('✓ Products initialized');
    return result;
  } catch (error) {
    console.warn('⚠ Could not initialize products:', error.message);
    return {};
  }
};

/**
 * Clear all caches
 */
export const clearAllCache = () => {
  console.log('🗑 Clearing all caches');
  clearCache('products');
  clearCache('categories');
  cache.productDetail = {};
};

/**
 * Manual cache invalidation for products
 */
export const invalidateProductsCache = () => {
  clearCache('products');
  clearCache('categories');
};

const productWorkerExport = {
  fetchAllProducts,
  fetchProductById,
  fetchProductByImei,
  searchProducts,
  fetchCategories,
  fetchProductStats,
  initializeProducts,
  clearAllCache,
  invalidateProductsCache,
};

export default productWorkerExport;
