import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '../../../components/common/Toast';
import ProductForm from '../../../components/admin/ProductForm';
import productService from '../../../services/productService';
import axiosClient from '../../../api';

/**
 * Trang sửa sản phẩm
 */
const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [toast, setToast] = useState(null);
  const [product, setProduct] = useState(null);

  // State cho dữ liệu dropdown
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

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAllData = async () => {
    try {
      setIsLoadingData(true);

      // Lấy dữ liệu dropdown
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

      // Lấy thông tin sản phẩm
      const productRes = await axiosClient.get(`/api/product/${id}`);
      if (productRes.result) {
        setProduct(productRes.result);
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

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);

      // Sửa sản phẩm (chỉ cập nhật các trường cơ bản, không phải full create)
      await productService.updateProduct(id, formData.payload.products);

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