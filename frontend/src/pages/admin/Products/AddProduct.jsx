import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../../components/common/Toast';
import ProductForm from '../../../components/admin/ProductForm';
import productService from '../../../services/productService';
import axiosClient from '../../../api';


const AddProduct = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

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
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [
        brandsRes,
        originsRes,
        osRes,
        warehousesRes,
        ramsRes,
        romsRes,
        colorsRes,
        categoriesRes,
      ] = await Promise.all([
        axiosClient.get('/brand'),
        axiosClient.get('/origin'),
        axiosClient.get('/os'),
        axiosClient.get('/warehouse_area'),
        axiosClient.get('/ram'),
        axiosClient.get('/rom'),
        axiosClient.get('/color'),
        axiosClient.get('/category'),
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
    } catch (error) {
      console.error('Fetch dropdown error:', error);
      setToast({
        type: 'error',
        message: 'Lỗi tải dữ liệu: ' + (error.response?.data?.message || error.message),
      });
    }
  };

  const handleSubmit = async (formDataWithImage) => {
    try {
      setIsLoading(true);

      console.log("📝 AddProduct Submit - Payload:", formDataWithImage.payload);
      console.log("📝 AddProduct Submit - Versions:", formDataWithImage.payload?.versions);
      console.log("📝 AddProduct Submit - Product Image:", formDataWithImage.image);

      // ProductForm đã gọi initProduct() rồi, nên payload đã có idProduct
      const productId = formDataWithImage.payload?.idProduct;
      
      if (!productId) {
        throw new Error('Không thể lấy ID sản phẩm. Vui lòng thử lại.');
      }

      console.log("✅ Using product ID from form:", productId);

      // Step 1 - Create product + versions with the initialized ID
      console.log("📝 Step 1: Creating product with details and versions...");
      const payload = {
        idProduct: productId,
        ...formDataWithImage.payload,
      };
      
      const createResponse = await productService.createProduct(payload, null);
      console.log("✅ Product Created:", productId);
      console.log("✅ Create Response:", createResponse);

      if (!productId) {
        throw new Error('Không thể tạo sản phẩm');
      }

      // Step 2 - Upload product image nếu có
      if (formDataWithImage.image && formDataWithImage.image instanceof File) {
        try {
          await productService.uploadProductImage(productId, formDataWithImage.image);
          console.info("✓ Product image uploaded successfully");
        } catch (imageError) {
          console.warn("⚠ Product created but image upload failed", imageError);
        }
      }

      // Step 3 - Upload version images nếu có
      const versionsWithImages = formDataWithImage.versionsWithImages || formDataWithImage.payload?.versions || [];
      console.log("📝 Versions with images:", versionsWithImages);
      
      for (let i = 0; i < versionsWithImages.length; i++) {
        const version = versionsWithImages[i];
        console.log(`📝 Version ${i + 1}:`, version);
        
        if (version.images && version.images.length > 0) {
          try {
            // Get product details with created versions
            const productDetail = await axiosClient.get(`/product/${productId}`);
            const productVersions = productDetail.result?.productVersionResponses || [];
            console.log(`📝 Product Versions from API:`, productVersions);
            
            if (productVersions.length > i) {
              // Backend returns idVersion, not idProductVersion
              const versionId = productVersions[i].idVersion || productVersions[i].idProductVersion;
              console.log(`📝 Version ${i + 1} ID: ${versionId}`);
              
              // Filter only File objects (new images)
              const imageFilesToUpload = version.images.filter(img => img instanceof File);
              console.log(`📝 Image Files to upload for Version ${i + 1}:`, imageFilesToUpload.length);
              
              if (imageFilesToUpload.length > 0) {
                await productService.uploadVersionImages(versionId, imageFilesToUpload);
                console.info(`✓ Version ${i + 1} images uploaded successfully (${imageFilesToUpload.length} images)`);
              }
            }
          } catch (versionImageError) {
            console.warn(`⚠ Version ${i + 1} images upload failed`, versionImageError);
          }
        }
      }

      setToast({
        type: 'success',
        message: 'Tạo sản phẩm thành công!',
      });

      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("❌ Error:", error);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Thêm Sản Phẩm Mới</h1>
        <p className="text-gray-600 mt-2">Tạo sản phẩm mới và quản lý các phiên bản của nó</p>
      </div>

      <ProductForm
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

export default AddProduct;
