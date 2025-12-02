import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Package, Filter, X, Sparkles, TrendingUp } from 'lucide-react';
import Button from '../../../components/common/Button';
import InputField from '../../../components/common/InputField';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/common/Pagination';
import Toast from '../../../components/common/Toast';
import productService from '../../../services/productService';
import { usePermission, PERMISSIONS } from '../../../hooks/usePermission';
import axiosClient from '../../../api';


const ListProduct = () => {
  const navigate = useNavigate();
  const debounceTimer = useRef(null);
  const { hasPermission } = usePermission();

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [searchFilters, setSearchFilters] = useState({
    productName: '',
    brandName: '',
    originName: '',
    operatingSystemName: '',
    warehouseAreaName: '',
  });

  const [dropdownData, setDropdownData] = useState({
    brands: [],
    origins: [],
    operatingSystems: [],
    warehouses: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null, productName: '' });


  const fetchProducts = async (page = 0, filters = {}) => {
    try {
      setIsLoading(true);

      const hasFilters = Object.values(filters).some(v => v && v.trim());

      let response;
      if (hasFilters) {
        response = await productService.searchProducts(filters, page, pageSize);
      } else {
        response = await productService.getProducts(page, pageSize, true);
      }

      // Handle both response.result and direct response
      const data = response.result || response;
      
      if (data && data.content) {
        setProducts(data.content);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(page + 1);
      } else if (data && Array.isArray(data)) {
        setProducts(data);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Lỗi tải danh sách sản phẩm: ' + (error.response?.data?.message || error.message),
      });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts(0);
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      setIsLoadingDropdowns(true);
      const [
        brandsRes,
        originsRes,
        osRes,
        warehousesRes,
      ] = await Promise.all([
        axiosClient.get('/brand'),
        axiosClient.get('/origin'),
        axiosClient.get('/os'),
        axiosClient.get('/warehouse_area'),
      ]);

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

      setDropdownData({
        brands: mapBrands(brandsRes),
        origins: mapOrigins(originsRes),
        operatingSystems: mapOperatingSystems(osRes),
        warehouses: mapWarehouses(warehousesRes),
      });
    } catch (error) {
      console.error('Fetch dropdown error:', error);
      setToast({
        type: 'error',
        message: 'Lỗi tải dữ liệu lọc: ' + (error.response?.data?.message || error.message),
      });
    } finally {
      setIsLoadingDropdowns(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = {
      ...searchFilters,
      [name]: value,
    };
    
    setSearchFilters(updatedFilters);
    setCurrentPage(1);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      fetchProducts(0, updatedFilters);
    }, 300); // 300ms debounce
  };

  const handleResetFilter = () => {
    setSearchFilters({
      productName: '',
      brandName: '',
      originName: '',
      operatingSystemName: '',
      warehouseAreaName: '',
    });
    setCurrentPage(1);
    fetchProducts(0, {});
  };

  const handlePageChange = (newPage) => {
    fetchProducts(newPage - 1, searchFilters);
  };

  const handleAddProduct = () => {
    navigate('/admin/products/create');
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/products/${productId}/edit`);
  };

  const handleDeleteClick = (productId, productName) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);
      const response = await productService.deleteProduct(deleteModal.productId);
      const message = response?.message || response?.data?.message || `Xóa sản phẩm "${deleteModal.productName}" thành công`;
      
      setToast({
        type: 'success',
        message: message,
      });
      setDeleteModal({ isOpen: false, productId: null, productName: '' });
      fetchProducts(currentPage - 1, searchFilters);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setToast({
        type: 'error',
        message: `Không thể xóa sản phẩm: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Quản Lý Sản Phẩm</h1>
              </div>
            </div>
            {hasPermission(PERMISSIONS.PRODUCT_CREATE_ALL) && (
              <button
                onClick={handleAddProduct}
                className="group relative bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 overflow-hidden text-sm"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <Plus className="w-4 h-4 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                <span className="relative z-10">Thêm Sản Phẩm</span>
                <Sparkles className="w-3.5 h-3.5 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            )}
          </div>
        </div>

        {/* filter */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Tên sản phẩm
                  </label>
                  <InputField
                    placeholder="Tìm kiếm tên sản phẩm..."
                    name="productName"
                    value={searchFilters.productName}
                    onChange={handleFilterChange}
                    icon={Search}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Nhãn hiệu
                  </label>
                  <select
                    name="brandName"
                    value={searchFilters.brandName}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                    disabled={isLoadingDropdowns}
                  >
                    <option value="">Tất cả nhãn hiệu</option>
                    {dropdownData.brands.map((brand) => (
                      <option key={brand.idBrand} value={brand.nameBrand}>
                        {brand.nameBrand}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Xuất xứ
                  </label>
                  <select
                    name="originName"
                    value={searchFilters.originName}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                    disabled={isLoadingDropdowns}
                  >
                    <option value="">Tất cả xuất xứ</option>
                    {dropdownData.origins.map((origin) => (
                      <option key={origin.idOrigin} value={origin.nameOrigin}>
                        {origin.nameOrigin}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Hệ điều hành
                  </label>
                  <select
                    name="operatingSystemName"
                    value={searchFilters.operatingSystemName}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                    disabled={isLoadingDropdowns}
                  >
                    <option value="">Tất cả HĐH</option>
                    {dropdownData.operatingSystems.map((os) => (
                      <option key={os.idOS} value={os.nameOS}>
                        {os.nameOS}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Kho
                  </label>
                  <select
                    name="warehouseAreaName"
                    value={searchFilters.warehouseAreaName}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                    disabled={isLoadingDropdowns}
                  >
                    <option value="">Tất cả kho</option>
                    {dropdownData.warehouses.map((warehouse) => (
                      <option key={warehouse.idWarehouse} value={warehouse.nameWarehouse}>
                        {warehouse.nameWarehouse}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {Object.values(searchFilters).some(v => v && v.trim()) && (
                <div className="flex gap-3 justify-end pt-1">
                  <button
                    onClick={handleResetFilter}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 hover:shadow-md text-sm"
                  >
                    <X className="w-4 h-4" />
                    Xóa Lọc
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* product list */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {isLoading && products.length === 0 ? (
            <div className="flex items-center justify-center p-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">Không tìm thấy sản phẩm nào</p>
              <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sản Phẩm</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nhãn Hiệu</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">HĐH</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Xuất Xứ</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Kho</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Số Lượng</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Trạng Thái</th>
                    {(hasPermission(PERMISSIONS.PRODUCT_UPDATE_ALL) || hasPermission(PERMISSIONS.PRODUCT_DELETE_ALL)) && (
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Hành Động</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {Array.from({ length: pageSize }).map((_, index) => {
                    const product = products[index];
                    if (product) {
                      return (
                        <tr 
                          key={product.idProduct} 
                          className="hover:bg-blue-50/50 transition-all duration-200 group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {product.image ? (
                                <div className="relative">
                                  <img
                                    src={product.image}
                                    alt={product.nameProduct}
                                    className="w-14 h-14 rounded-xl object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-all duration-200 shadow-sm"
                                  />
                                </div>
                              ) : (
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-gray-200">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {product.nameProduct}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">ID: {product.idProduct}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-700 font-medium">{product.brandName || '-'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-700 font-medium">{product.operatingSystemName || '-'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-700 font-medium">{product.originName || '-'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-700 font-medium">{product.warehouseAreaName || '-'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                              (product.stockQuantity || 0) > 0
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                              {product.stockQuantity || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                              product.status
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                              {product.status ? 'Hoạt động' : 'Tắt'}
                            </span>
                          </td>
                          {(hasPermission(PERMISSIONS.PRODUCT_UPDATE_ALL) || hasPermission(PERMISSIONS.PRODUCT_DELETE_ALL)) && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2">
                                {hasPermission(PERMISSIONS.PRODUCT_UPDATE_ALL) && (
                                  <button
                                    onClick={() => handleEditProduct(product.idProduct)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                                    title="Chỉnh sửa"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                )}
                                {hasPermission(PERMISSIONS.PRODUCT_DELETE_ALL) && (
                                  <button
                                    onClick={() => handleDeleteClick(product.idProduct, product.nameProduct)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                                    title="Xóa"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    } else {
                      // Empty row to maintain fixed height
                      const colCount = 7 + (hasPermission(PERMISSIONS.PRODUCT_UPDATE_ALL) || hasPermission(PERMISSIONS.PRODUCT_DELETE_ALL) ? 1 : 0);
                      return (
                        <tr key={`empty-${index}`} className="h-16">
                          <td colSpan={colCount} className="px-6 py-4"></td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center border-t border-gray-200 bg-gray-50 px-6 py-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* modal deleteee */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: null, productName: '' })}
        title="Xóa Sản Phẩm"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Cảnh báo:</strong> Bạn sắp xóa sản phẩm "<strong>{deleteModal.productName}</strong>". 
              {' '}Hành động này không thể hoàn tác. Nếu sản phẩm đã được bán, bạn sẽ không thể xóa nó.
            </p>
          </div>

          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa sản phẩm này không?
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ isOpen: false, productId: null, productName: '' })}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            loading={isLoading}
          >
            Xóa
          </Button>
        </div>
      </Modal>

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

export default ListProduct;