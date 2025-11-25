/**
 * Product Service Worker
 * Handles all product-related API calls and caching
 * Backend API Base: /api/product (or /product if no /api prefix)
 */

import axiosClient from "../api";
import { GET, POST } from "../constants/httpMethod";

const API_BASE_URL = "/product"; // Adjust if needed

/**
 * Cache management
 */
const cache = {
  products: {
    entries: {}, // keyed by `${page}_${size}` -> { data, timestamp }
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
  if (!cacheEntry || !cacheEntry.data || !cacheEntry.timestamp) return false;
  // cacheEntry may not contain ttl; use parent bucket ttl if present
  const ttl = cacheEntry.ttl || cacheEntry._ttl || 5 * 60 * 1000;
  return Date.now() - cacheEntry.timestamp < ttl;
};

// Helper to clear cache
const clearCache = (key) => {
  if (!cache[key]) return;
  // products uses entries map
  if (cache[key].entries) {
    cache[key].entries = {};
    return;
  }
  if (cache[key].data || cache[key].timestamp) {
    cache[key].data = null;
    cache[key].timestamp = null;
  }
};

/**
 * Transform backend ProductFULLResponse to frontend format
 * Backend fields → Frontend fields mapping
 * Updated to match actual backend response (e.g., exportPrice, idVersion, imei array)
 */
export const transformProductResponse = (backendProduct) => {
  if (!backendProduct) return null;

  // Extract first version for default values (price, etc.)
  const firstVersion = backendProduct.productVersionResponses?.[0];

  return {
    id: backendProduct.idProduct,
    name: backendProduct.nameProduct,
    image: backendProduct.image || backendProduct.picture || "",
    price: firstVersion?.exportPrice || firstVersion?.price || 0,
    discount: firstVersion?.discount || 0,
    rating: firstVersion?.rating || 0,
    reviewCount: firstVersion?.reviewCount || 0,
    inStock: (backendProduct.stockQuantity || 0) > 0,
    stockQuantity: backendProduct.stockQuantity || 0,
    status: backendProduct.status,

    // Full details
    description: backendProduct.descriptionProduct || "",
    brand: backendProduct.brandName,
    origin: backendProduct.originName,
    category: backendProduct.categoryName,
    warehouseArea: backendProduct.warehouseAreaName,
    operatingSystem: backendProduct.operatingSystemName,

    // Specifications
    specifications: {
      Chipset: backendProduct.chipset,
      Battery: backendProduct.battery,
      "Screen Size": backendProduct.screenSize,
      "Screen Resolution": backendProduct.screenResolution,
      "Screen Technology": backendProduct.screenTech,
      "Scan Frequency": backendProduct.scanFrequency,
      "Rear Camera": backendProduct.rearCamera,
      "Front Camera": backendProduct.frontCamera,
      "Warranty Period": backendProduct.warrantyPeriod
        ? `${backendProduct.warrantyPeriod} months`
        : "N/A",
    },

    // Version details - Updated to match backend fields
    versions:
      backendProduct.productVersionResponses?.map((v) => ({
        id: v.idVersion || v.idProductVersion || null,
        ram: v.ramName,
        rom: v.romName,
        color: v.colorName,
        picture: v.images || "NotFound.jpg",
        price: v.exportPrice || v.price || 0,
        discount: v.discount || 0,
        imei: v.imei?.[0]?.imei || null,
        stockQuantity: v.stockQuantity,
        status: v.status,
      })) || [],

    // Raw backend data (for reference)
    _raw: backendProduct,
  };
};

/**
 * /**
 * Fetch all products with pagination and filtering
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size (default: 10)
 * @param {string} productName - Name of the product (partial/exact match)
 * @param {string} romName - ROM size/name
 * @param {string} ramName - RAM size/name
 * @param {string} colorName - Color name
 * @returns {Promise<Object|null>} Transformed version details or null
 */
export const fetchSearchProductVersion = async (
  productName,
  romName,
  ramName,
  colorName,
  page
) => {
  try {
    const response = await axiosClient[GET](`${API_BASE_URL}/searchVersion`, {
      params: { productName, romName, ramName, colorName },
    });
    console.log("✓ Product version search API response received", response);

    const result = response.data?.result;
    if (!result) {
      console.warn("⚠ No data in product version search response");
      return null;
    }
    // Transform backend ProductVersionResponse to frontend format
    // Adapted from transformProductResponse's version mapping
    return transformProductResponse(result.versions?.[0]) || null;
  } catch (error) {
    console.log("fetching product version by search", error);
    throw error;
  }
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
    // Build params and cache key
    const params = { page, size, ...filters };
    const cacheKey = `${page}_${size}`;

    // Check cache for default parameters (no filters) and per-page entry
    if (!filters || Object.keys(filters).length === 0) {
      const cached = cache.products.entries[cacheKey];
      if (cached && isCacheValid({ ...cached, _ttl: cache.products.ttl })) {
        return cached.data;
      }
    }

    const response = await axiosClient[GET](`${API_BASE_URL}`, { params });
    console.log("✓ Products API response received", response);

    // Handle response: backend returns ApiResponse wrapper
    const result = response?.result;
    // ← FIX: Guard cho result undefined (từ 404 hoặc invalid response)
    if (!result) {
      console.warn("⚠ No data in API response:", response.data);
      throw new Error("Invalid API response: No paginated data found");
    }

    // Transform paginated response - Updated to handle Spring Boot Page format (content, totalElements, etc.)
    const transformedData = {
      products: (result.content || result.products || result || []).map(
        transformProductResponse
      ),
      total: result.totalElements || result.total || 0,
      page: result.number || page,
      size: result.size || size,
      totalPages:
        result.totalPages || Math.ceil((result.totalElements || 0) / size),
    };

    // Cache the result per page when there are no filters
    if (!filters || Object.keys(filters).length === 0) {
      cache.products.entries[cacheKey] = {
        data: transformedData,
        timestamp: Date.now(),
      };
    }
    return transformedData;
  } catch (error) {
    // ← FIX: Handle 404 cụ thể + log chi tiết
    if (error.response?.status === 404) {
      throw new Error("Product list not available: Endpoint not found");
    }
    console.error("❌ Error fetching products:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error; // No fallback - let component handle error (e.g., show empty list or error message)
  }
};





export const fetchCountProduct = async () => {
  try {
    const response = await axiosClient[GET](`${API_BASE_URL}/count`);
    console.log("so luong product : ", response);

    return response;
  } catch (error) {
    console.error("❌ Error fetching product by ID:", error);
    throw error;
  }
};






/** 
@param {string} filters.idProduct - Product ID (exact match)
*/
export const fetchProductById = async (idProduct) => {
  try {
    console.log(`📡 Fetching product by ID: ${idProduct}`);
    const response = await axiosClient[GET](`${API_BASE_URL}/${idProduct}`);

    console.log("✓ Product by ID API response received", response);

    const result = response?.result;
    return transformProductResponse(result);
  } catch (error) {
    console.error("❌ Error fetching product by ID:", error);
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
    console.log("📡 Searching products:", filters);
    const response = await axiosClient[GET]("/search", {
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
    console.error("❌ Error searching products:", error);
    throw error;
  }
};





 




/**
 * Initialize/fetch product statistics (if endpoint exists)
 * @returns {Promise<Object>} Product stats
 */
export const fetchProductStats = async () => {
  try {
    console.log("📡 Fetching product stats...");
    const response = await axiosClient[GET]("/countProduct");
    const result = response.data?.result || response.data;
    console.log("✓ Stats fetched:", result);
    return result;
  } catch (error) {
    console.warn("⚠ Could not fetch product stats:", error.message);
    return {};
  }
};

/**
 * Initialize product (if needed)
 * @returns {Promise<Object>} Initialization result
 */
export const initializeProducts = async () => {
  try {
    console.log("📡 Initializing products...");
    const response = await axiosClient[POST]("product/init");
    const result = response.data?.result || response.data;
    clearCache("products");
    console.log("✓ Products initialized");
    return result;
  } catch (error) {
    console.warn("⚠ Could not initialize products:", error.message);
    return {};
  }
};

/**
 * Clear all caches
 */
export const clearAllCache = () => {
  console.log("🗑 Clearing all caches");
  clearCache("products");
  clearCache("categories");
  cache.productDetail = {};
};

/**
 * Manual cache invalidation for products
 */
export const invalidateProductsCache = () => {
  clearCache("products");
  clearCache("categories");
};




/**
 * Search all product versions
 * @param {Object} filters - Search filters
 * @param {string} filters.brandName - Brand name
 * @param {string} filters.warehouseAreaName - Warehouse area name
 * @param {string} filters.originName - Origin name
 * @param {string} filters.operatingSystemName - Operating system name
 * @param {string} filters.productName - Product name
 * @param {string|number} filters.battery - Battery spec
 * @param {string|number} filters.scanFrequency - Scan frequency
 * @param {string|number} filters.screenSize - Screen size
 * @param {string} filters.screenResolution - Screen resolution
 * @param {string} filters.screenTech - Screen technology
 * @param {string} filters.chipset - Chipset
 * @param {string|number} filters.rearCamera - Rear camera spec
 * @param {string|number} filters.frontCamera - Front camera spec
 * @param {number} filters.warrantyPeriod - Warranty period
 * @param {string} filters.romName - ROM name
 * @param {string} filters.ramName - RAM name
 * @param {string} filters.colorName - Color name
 * @param {number} filters.importPrice - Import price
 * @param {number} filters.exportPrice - Export price
 * @param {number} page - Page number
 * @param {number} size - Page size
 * @returns {Promise<Object>} Paginated products with versions
 */
export const fetchSearchAll = async (filters = {}, page = 0, size = 10) => {
  try {
    console.log("📡 Searching all versions:", filters);
    const response = await axiosClient[GET]("/searchVersionFULLVIP", {
      params: { ...filters, page, size },
    });
    const result = response.data?.result || response.data;
    return {
      products: (result.content || result || []).map(transformProductResponse).filter(Boolean),
      total: result.totalElements || 0,
      page: result.number || page,
      size: result.size || size,
    };
  } catch (error) {
    console.error("❌ Error fetching search results:", error);
    throw error;
  }
};











const productWorkerExport = {
  fetchAllProducts,
  fetchProductById,
  fetchSearchProductVersion,
  searchProducts,
  fetchCountProduct,
  fetchProductStats,
  initializeProducts,
  clearAllCache,
  invalidateProductsCache,
  transformProductResponse,
};

export default productWorkerExport;
