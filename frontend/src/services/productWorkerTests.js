/**
 * Product Worker Test & Usage Examples
 * This file demonstrates how to use the productWorker service
 * 
 * Backend API Endpoints (from ProductController.java):
 * - GET  /api/product              (default: page=0, size=10)
 * - POST /api/product/init         (initialize products)
 * - GET  /api/product/search       (search with filters)
 * - GET  /api/product/imei/{imei}  (get by IMEI)
 * - GET  /api/product/countProduct (get stats)
 * 
 * Frontend uses productWorker.js for:
 * - Automatic data transformation
 * - Response caching (5-10 min TTL)
 * - Error handling
 * - Request interceptors (auth token, 401 redirect)
 */

import productWorker from '../services/productWorker';

/**
 * Example 1: Fetch all products with pagination
 */
export const example_fetchAllProducts = async () => {
  try {
    // Fetch first page (default: 10 items per page)
    const result = await productWorker.fetchAllProducts(0, 10);
    console.log('Total products:', result.total);
    console.log('Products:', result.products);
    // Result structure:
    // {
    //   products: [...],
    //   total: 150,
    //   page: 0,
    //   size: 10,
    //   totalPages: 15
    // }
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
};

/**
 * Example 2: Fetch single product by ID
 */
export const example_fetchProductById = async (productId = 1) => {
  try {
    const product = await productWorker.fetchProductById(productId);
    console.log('Product:', product);
    // Result structure:
    // {
    //   id: 1,
    //   name: 'iPhone 15',
    //   price: 999,
    //   discount: 10,
    //   image: 'url...',
    //   specifications: { Chipset: 'A17', RAM: '8GB', ... },
    //   versions: [{id, ram, rom, color, price, imei}, ...],
    //   brand: 'Apple',
    //   inStock: true,
    //   ...
    // }
  } catch (error) {
    console.error('Failed to fetch product:', error);
  }
};

/**
 * Example 3: Fetch product by IMEI
 */
export const example_fetchProductByImei = async (imei = '123456789') => {
  try {
    const product = await productWorker.fetchProductByImei(imei);
    console.log('Product by IMEI:', product);
  } catch (error) {
    console.error('Failed to fetch product by IMEI:', error);
  }
};

/**
 * Example 4: Search products with filters
 */
export const example_searchProducts = async () => {
  try {
    const filters = {
      productName: 'iPhone',
      brandName: 'Apple',
      minPrice: 500,
      maxPrice: 1500,
      // Additional filters as per backend support
    };
    const result = await productWorker.searchProducts(filters, 0, 10);
    console.log('Search results:', result.products);
  } catch (error) {
    console.error('Failed to search products:', error);
  }
};

/**
 * Example 5: Fetch categories
 */
export const example_fetchCategories = async () => {
  try {
    const categories = await productWorker.fetchCategories();
    console.log('Categories:', categories);
    // Returns: [{ id, name, ... }, ...]
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
};

/**
 * Example 6: Get product statistics
 */
export const example_fetchProductStats = async () => {
  try {
    const stats = await productWorker.fetchProductStats();
    console.log('Product stats:', stats);
    // Returns: { totalProducts, inStock, outOfStock, ... }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
};

/**
 * Example 7: Initialize products
 */
export const example_initializeProducts = async () => {
  try {
    const result = await productWorker.initializeProducts();
    console.log('Initialization result:', result);
  } catch (error) {
    console.error('Failed to initialize products:', error);
  }
};

/**
 * Example 8: Cache management
 */
export const example_cacheManagement = async () => {
  // Clear products cache
  productWorker.invalidateProductsCache();

  // Clear all caches
  productWorker.clearAllCache();

  // Fetch after clearing cache (will make fresh API call)
  const products = await productWorker.fetchAllProducts(0, 10);
  console.log('Fresh products after cache clear:', products);
};

/**
 * Backend Response Format:
 * 
 * All backend responses are wrapped in ApiResponse:
 * {
 *   code: 1000,
 *   message: "Success",
 *   result: { ... actual data ... }
 * }
 * 
 * Paginated responses have structure:
 * {
 *   content: [...],           // Array of products
 *   totalElements: 150,
 *   totalPages: 15,
 *   number: 0,                // Current page
 *   size: 10                   // Page size
 * }
 * 
 * ProductFULLResponse structure (backend):
 * {
 *   idProduct: 1,
 *   nameProduct: "iPhone 15",
 *   image: "url",
 *   price: 999,  // From productVersionResponses[0]
 *   brandName: "Apple",
 *   categoryName: "Smartphones",
 *   stockQuantity: 50,
 *   operatingSystemName: "iOS",
 *   chipset: "A17",
 *   battery: "3500mAh",
 *   screenSize: "6.1",
 *   rearCamera: "48MP",
 *   frontCamera: "12MP",
 *   warrantyPeriod: 12,
 *   productVersionResponses: [
 *     {
 *       idProductVersion: 1,
 *       ramName: "8GB",
 *       romName: "256GB",
 *       colorName: "Black",
 *       price: 999,
 *       discount: 10,
 *       imei: "123456789"
 *     }
 *   ]
 * }
 * 
 * Frontend Transform Maps:
 * Backend → Frontend
 * idProduct → id
 * nameProduct → name
 * brandName → brand
 * productVersionResponses → versions (array)
 * price & discount → calculated from versions[0]
 */

/**
 * Integration Steps:
 * 
 * 1. Import productWorker in your component:
 *    import productWorker from '../../../services/productWorker';
 * 
 * 2. Fetch products in useEffect:
 *    useEffect(() => {
 *      const fetchProducts = async () => {
 *        const result = await productWorker.fetchAllProducts(0, 10);
 *        setProducts(result.products);
 *      };
 *      fetchProducts();
 *    }, []);
 * 
 * 3. Use the transformed data in your components
 *    - product.id, product.name, product.price
 *    - product.specifications, product.versions
 *    - product.inStock, product.rating
 * 
 * 4. Handle errors:
 *    try {
 *      const product = await productWorker.fetchProductById(id);
 *    } catch (error) {
 *      console.error('Error:', error);
 *      setError('Failed to load product');
 *    }
 */

export default {
  example_fetchAllProducts,
  example_fetchProductById,
  example_fetchProductByImei,
  example_searchProducts,
  example_fetchCategories,
  example_fetchProductStats,
  example_initializeProducts,
  example_cacheManagement,
};
