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
        categoriesRes,
        ramsRes,
        romsRes,
        colorsRes,
      ] = await Promise.all([
        axiosClient.get('/api/brand'),
        axiosClient.get('/api/origin'),
        axiosClient.get('/api/operating-system'),
        axiosClient.get('/api/warehouse'),
        axiosClient.get('/api/category'),
        axiosClient.get('/api/ram'),
        axiosClient.get('/api/rom'),
        axiosClient.get('/api/color'),
      ]);

      setDropdownData({
        brands: brandsRes.result || brandsRes || [],
        origins: originsRes.result || originsRes || [],
        operatingSystems: osRes.result || osRes || [],
        warehouses: warehousesRes.result || warehousesRes || [],
        categories: categoriesRes.result || categoriesRes || [],
        rams: ramsRes.result || ramsRes || [],
        roms: romsRes.result || romsRes || [],
        colors: colorsRes.result || colorsRes || [],
      });
    } catch (error) {
      console.error('Fetch dropdown error:', error);
      setToast({
        type: 'error',
        message: 'Lỗi tải dữ liệu: ' + (error.response?.data?.message || error.message),
      });
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);

      await productService.createProduct(formData.payload, formData.image);

      setToast({
        type: 'success',
        message: 'Tạo sản phẩm thành công!',
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