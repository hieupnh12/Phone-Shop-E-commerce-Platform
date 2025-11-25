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

      const listRes = await axiosClient.get('/product', { params: { page: 0, size: 1000 } });
      const list = listRes.result?.content || listRes.content || [];
      const found = list.find(p => String(p.idProduct) === String(id));
      if (found) {
        setProduct(found);
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

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);

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