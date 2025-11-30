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

    // Gửi toàn bộ payload productData (gồm idProduct, products, versions)
    formData.append("product", new Blob([JSON.stringify(productData)], { type: "application/json" }));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    return axiosClient.post(`${PRODUCT_API}/full/confirm`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  uploadProductImage: async (productId, imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    return axiosClient[POST](`${PRODUCT_API}/${productId}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },


  updateProduct: (productId, updateData) => {
    return axiosClient[PATCH](`${PRODUCT_API}/${productId}`, updateData);
  },

  updateProductWithImage: async (productId, productData, imageFile) => {
    // Cách 2: Upload ảnh riêng (2 requests)
    // Request 1: Update product data
    const updateResult = await axiosClient[PATCH](`${PRODUCT_API}/${productId}`, productData);
    
    // Request 2: Upload image (nếu có file mới)
    if (imageFile && imageFile instanceof File) {
      try {
        await productService.uploadProductImage(productId, imageFile);
        console.info("✓ Product data updated and image uploaded successfully");
      } catch (imageError) {
        console.warn("⚠ Product data updated but image upload failed", imageError);
        // Vẫn trả về success vì product data đã được update
        throw imageError;
      }
    }
    
    return updateResult;
  },

  deleteProduct: (productId) => {
    return axiosClient[DELETE](`${PRODUCT_API}/${productId}`);
  },

  createProductVersion: (versionData) => {
    return axiosClient[POST](`${PRODUCT_VERSION_API}`, versionData);
  },

  updateProductVersion: (versionId, updateData) => {
    return axiosClient[PUT](`${PRODUCT_VERSION_API}/${versionId}`, updateData);
  },

  uploadVersionImages: async (versionId, imageFiles) => {
    // imageFiles can be File objects or array of File objects
    const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
    const formData = new FormData();
    
    console.log(`📤 Uploading ${files.length} images for version ${versionId}`);
    
    // Backend expects parameter name "image" (singular) but accepts List<MultipartFile>
    // With Spring @RequestPart, append each file with the same parameter name "image"
    // Spring will automatically collect them into a List
    files.forEach((file, index) => {
      if (file instanceof File) {
        formData.append(`image`, file);
        console.log(`  - Appended file ${index + 1}: ${file.name} (${file.size} bytes)`);
      } else {
        console.warn(`  - Skipping non-File object at index ${index}:`, file);
      }
    });

    if (formData.getAll('image').length === 0) {
      throw new Error('No valid image files to upload');
    }

    console.log(`📤 Sending request to ${PRODUCT_VERSION_API}/upload_image/${versionId}`);

    // Backend endpoint is /productVersion/upload_image/{idVersion}
    return axiosClient[POST](`${PRODUCT_VERSION_API}/upload_image/${versionId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteVersionImage: (versionId, imageId) => {
    return axiosClient[DELETE](`${PRODUCT_VERSION_API}/${versionId}/image/${imageId}`);
  },

  deleteProductVersion: (versionId) => {
    return axiosClient[DELETE](`${PRODUCT_VERSION_API}/${versionId}`);
  },
};

export default productService;
