import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '../../../components/common/Toast';
import ProductForm from '../../../components/admin/ProductForm';
import productService from '../../../services/productService';
import axiosClient from '../../../api';


const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [toast, setToast] = useState(null);
  const [product, setProduct] = useState(null);


  const [dropdownData, setDropdownData] = useState({
    brands: [],
    origins: [],
    operatingSystems: [],
    warehouses: [],
    categories: [],
    rams: [],
    roms: [],
    colors: [],
  });

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAllData = async () => {
    try {
      setIsLoadingData(true);

      const [
        brandsRes,
        originsRes,
        osRes,
        warehousesRes,
        ramsRes,
        romsRes,
        colorsRes,
        categoriesRes,
        productRes,
      ] = await Promise.all([
        axiosClient.get('/brand'),
        axiosClient.get('/origin'),
        axiosClient.get('/os'),
        axiosClient.get('/warehouse_area'),
        axiosClient.get('/ram'),
        axiosClient.get('/rom'),
        axiosClient.get('/color'),
        axiosClient.get('/category'),
        axiosClient.get(`/product/${id}`),
      ]);

      const normalizeCategories = (res) => {
        const data = res?.result ?? res;
        if (Array.isArray(data)) return data;
        return data ? [data] : [];
      };

      const mapBrands = (res) => ((res?.result ?? res) || []).map(b => ({
        idBrand: b.idBrand ?? b.id,
        nameBrand: b.nameBrand ?? b.brandName ?? b.name,
      }));
      const mapOrigins = (res) => ((res?.result ?? res) || []).map(o => ({
        idOrigin: o.idOrigin ?? o.id,
        nameOrigin: o.nameOrigin ?? o.name,
      }));
      const mapOperatingSystems = (res) => ((res?.result ?? res) || []).map(o => ({
        idOS: o.idOS ?? o.id,
        nameOS: o.nameOS ?? o.name,
      }));
      const mapWarehouses = (res) => ((res?.result ?? res) || []).map(w => ({
        idWarehouse: w.idWarehouseArea ?? w.id,
        nameWarehouse: w.nameWarehouseArea ?? w.name,
      }));
      const mapRams = (res) => ((res?.result ?? res) || []).map(r => ({
        idRam: r.idRam ?? r.ram_id ?? r.id,
        nameRam: r.nameRam ?? r.name,
      }));
      const mapRoms = (res) => ((res?.result ?? res) || []).map(r => ({
        idRom: r.idRom ?? r.rom_id ?? r.id,
        nameRom: r.nameRom ?? r.rom_size ?? r.name,
      }));
      const mapColors = (res) => ((res?.result ?? res) || []).map(c => ({
        idColor: c.idColor ?? c.id,
        nameColor: c.nameColor ?? c.name,
      }));

      setDropdownData({
        brands: mapBrands(brandsRes),
        origins: mapOrigins(originsRes),
        operatingSystems: mapOperatingSystems(osRes),
        warehouses: mapWarehouses(warehousesRes),
        categories: normalizeCategories(categoriesRes),
        rams: mapRams(ramsRes),
        roms: mapRoms(romsRes),
        colors: mapColors(colorsRes),
      });

      // Fetch product directly by ID
      const product = productRes?.result || productRes;
      if (product && product.idProduct) {
        // Map brandId, originId, etc. from names
        const mappedProduct = {
          ...product,
          brandId: product.brandName 
            ? mapBrands(brandsRes).find(b => b.nameBrand === product.brandName)?.idBrand 
            : null,
          originId: product.originName 
            ? mapOrigins(originsRes).find(o => o.nameOrigin === product.originName)?.idOrigin 
            : null,
          operatingSystemId: product.operatingSystemName 
            ? mapOperatingSystems(osRes).find(o => o.nameOS === product.operatingSystemName)?.idOS 
            : null,
          warehouseAreaId: product.warehouseAreaName 
            ? mapWarehouses(warehousesRes).find(w => w.nameWarehouse === product.warehouseAreaName)?.idWarehouse 
            : null,
          categoryId: product.categoryName 
            ? normalizeCategories(categoriesRes).find(c => c.nameCategory === product.categoryName)?.idCategory 
            : null,
        };
        setProduct(mappedProduct);
      } else {
        setToast({ type: 'error', message: 'Không tìm thấy sản phẩm' });
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      setToast({
        type: 'error',
        message: 'Lỗi tải dữ liệu: ' + (error.response?.data?.message || error.message),
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (formDataWithImage) => {
    try {
      setIsLoading(true);

      console.log("📝 EditProduct - Full payload:", formDataWithImage.payload);
      console.log("📝 EditProduct - Products data:", formDataWithImage.payload.products);
      console.log("📝 EditProduct - Status value:", formDataWithImage.payload.products.status);

      // Step 1 - Update product data + product image
      // Map field names from frontend to backend format
      // KHÔNG gửi field image để tránh mất ảnh cũ
      const productUpdateData = {
        nameProduct: formDataWithImage.payload.products.nameProduct,
        battery: formDataWithImage.payload.products.battery,
        scanFrequency: formDataWithImage.payload.products.scanFrequency,
        screenSize: formDataWithImage.payload.products.screenSize,
        screenResolution: formDataWithImage.payload.products.screenResolution,
        screenTech: formDataWithImage.payload.products.screenTech,
        chipset: formDataWithImage.payload.products.chipset,
        rearCamera: formDataWithImage.payload.products.rearCamera,
        frontCamera: formDataWithImage.payload.products.frontCamera,
        warrantyPeriod: formDataWithImage.payload.products.warrantyPeriod,
        stockQuantity: formDataWithImage.payload.products.stockQuantity,
        status: formDataWithImage.payload.products.status,
        // Map to backend field names
        idBrand: formDataWithImage.payload.products.brandId,
        idOrigin: formDataWithImage.payload.products.originId,
        idOperatingSystem: formDataWithImage.payload.products.operatingSystemId,
        idWarehouseArea: formDataWithImage.payload.products.warehouseAreaId,
        categoryId: formDataWithImage.payload.products.categoryId,
        // KHÔNG gửi image field - để backend giữ nguyên ảnh cũ
      };

      console.log("📝 EditProduct - Mapped update data:", productUpdateData);

      await productService.updateProductWithImage(
        id,
        productUpdateData,
        formDataWithImage.image
      );

      // Step 2 - Update/Create versions if needed
      const versionsWithImages = formDataWithImage.versionsWithImages || formDataWithImage.payload?.versions || [];
      
      // Process each version: update existing or create new
      for (const version of versionsWithImages) {
        const versionId = version.idVersion || version.idProductVersion;
        
        if (versionId) {
          // Update existing version
          try {
            const versionUpdateData = {
              idRam: version.idRam,
              idRom: version.idRom,
              idColor: version.idColor,
              importPrice: version.importPrice,
              exportPrice: version.exportPrice,
              stockQuantity: version.stockQuantity !== undefined ? version.stockQuantity : null,
              status: version.status !== undefined ? version.status : null,
            };
            await productService.updateProductVersion(versionId, versionUpdateData);
            console.log(`✓ Updated version ${versionId}`);
          } catch (error) {
            console.warn(`⚠ Failed to update version ${versionId}:`, error);
            throw error;
          }
        } else {
          // Create new version
          try {
            const versionCreateData = {
              idProduct: parseInt(id),
              idRam: version.idRam,
              idRom: version.idRom,
              idColor: version.idColor,
              importPrice: version.importPrice,
              exportPrice: version.exportPrice,
              stockQuantity: version.stockQuantity || 0,
              status: version.status !== undefined ? version.status : true,
              Items: version.Items || [],
            };
            const createdVersion = await productService.createProductVersion(versionCreateData);
            // Update version object with new ID
            version.idVersion = createdVersion.result?.idVersion || createdVersion.result?.idProductVersion;
            version.idProductVersion = version.idVersion;
            console.log(`✓ Created new version: ${version.idVersion}`);
          } catch (error) {
            console.error(`❌ Failed to create version:`, error);
            console.error(`   Error details:`, error.response?.data || error.message);
          }
        }
      }

      // Step 3 - Delete images that were marked for deletion
      for (let i = 0; i < versionsWithImages.length; i++) {
        const versionFromForm = versionsWithImages[i];
        const versionId = versionFromForm.idVersion || versionFromForm.idProductVersion;
        const deletedImageIds = versionFromForm.deletedImageIds || [];
        
        if (versionId && deletedImageIds.length > 0) {
          console.log(`🗑 Deleting ${deletedImageIds.length} images for version ${versionId}`);
          for (const imageId of deletedImageIds) {
            try {
              
              const imageIdInt = typeof imageId === 'string' ? parseInt(imageId, 10) : imageId;
              if (isNaN(imageIdInt)) {
                console.warn(`⚠ Invalid imageId: ${imageId}, skipping`);
                continue;
              }
              await productService.deleteVersionImage(versionId, imageIdInt);
              console.log(`✓ Deleted image ${imageIdInt} for version ${versionId}`);
            } catch (deleteError) {
              console.error(`❌ Failed to delete image ${imageId} for version ${versionId}:`, deleteError);
              // Continue with other deletions
            }
          }
        }
      }

      // Step 4 - Upload images for all versions (existing and newly created)
      // After Step 2, all versions should have IDs (either from existing or newly created)
      for (let i = 0; i < versionsWithImages.length; i++) {
        const versionFromForm = versionsWithImages[i];
        console.log(`📝 Processing version ${i + 1} from form:`, versionFromForm);
        
        // Filter only File objects (new images), not existing string URLs
        const newImageFiles = versionFromForm.images?.filter(img => img instanceof File) || [];
        
        if (newImageFiles.length === 0) {
          console.log(`ℹ Version ${i + 1} has no new images to upload`);
          continue; // Skip if no new images
        }

        // Get version ID (should be available after Step 2)
        const versionId = versionFromForm.idVersion || versionFromForm.idProductVersion;
        
        if (!versionId) {
          console.warn(`⚠ Version ${i + 1} still has no ID after create/update, skipping image upload`);
          console.warn(`   Version data:`, versionFromForm);
          continue;
        }

        try {
          console.log(`📤 Uploading ${newImageFiles.length} images for version ${versionId}`);
          await productService.uploadVersionImages(versionId, newImageFiles);
          console.info(`✓ Uploaded ${newImageFiles.length} images for version ${versionId}`);
        } catch (versionImageError) {
          console.error(`❌ Failed to upload images for version ${versionId}:`, versionImageError);
          console.error(`   Error details:`, versionImageError.response?.data || versionImageError.message);
          // Don't throw, continue with other versions
        }
      }

      setToast({
        type: 'success',
        message: 'Cập nhật sản phẩm thành công!',
      });

      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setToast({
        type: 'error',
        message: `Lỗi: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sửa Sản Phẩm</h1>
        <p className="text-gray-600 mt-2">{product.nameProduct}</p>
      </div>

      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        brandList={dropdownData.brands}
        originList={dropdownData.origins}
        operatingSystemList={dropdownData.operatingSystems}
        warehouseList={dropdownData.warehouses}
        categoryList={dropdownData.categories}
        ramList={dropdownData.rams}
        romList={dropdownData.roms}
        colorList={dropdownData.colors}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default EditProduct;