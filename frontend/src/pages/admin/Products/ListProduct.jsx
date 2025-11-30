import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import Button from '../../../components/common/Button';
import InputField from '../../../components/common/InputField';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/common/Pagination';
import Toast from '../../../components/common/Toast';
import productService from '../../../services/productService';
import { usePermission, PERMISSIONS } from '../../../hooks/usePermission';


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


  const [isLoading, setIsLoading] = useState(false);
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
        response = await productService.getProducts(page, pageSize);
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
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      const updatedFilters = {
        ...searchFilters,
        [name]: value,
      };
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
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Sản Phẩm</h1>
        {hasPermission(PERMISSIONS.PRODUCT_CREATE_ALL) && (
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleAddProduct}
          >
            Thêm Sản Phẩm
          </Button>
        )}
      </div>

      {/* filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tìm Kiếm Sản Phẩm</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <InputField
              placeholder="Tên sản phẩm"
              name="productName"
              value={searchFilters.productName}
              onChange={handleFilterChange}
              icon={Search}
            />

            {/* <InputField
              placeholder="Nhãn hiệu"
              name="brandName"
              value={searchFilters.brandName}
              onChange={handleFilterChange}
            />

            <InputField
              placeholder="Xuất xứ"
              name="originName"
              value={searchFilters.originName}
              onChange={handleFilterChange}
            />

            <InputField
              placeholder="Hệ điều hành"
              name="operatingSystemName"
              value={searchFilters.operatingSystemName}
              onChange={handleFilterChange}
            />

            <InputField
              placeholder="Kho"
              name="warehouseAreaName"
              value={searchFilters.warehouseAreaName}
              onChange={handleFilterChange}
            /> */}
          </div>

          {searchFilters.productName && (
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                type="button"
                onClick={handleResetFilter}
              >
                Xóa Lọc
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* produc lít */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading && products.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tên Sản Phẩm</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nhãn Hiệu</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">HĐH</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Xuất Xứ</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kho</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Số Lượng</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Trạng Thái</th>
                  {(hasPermission(PERMISSIONS.PRODUCT_UPDATE_ALL) || hasPermission(PERMISSIONS.PRODUCT_DELETE_ALL)) && (
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Hành Động</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.idProduct} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.nameProduct}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.nameProduct}</p>
                          <p className="text-xs text-gray-500">ID: {product.idProduct}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{product.brandName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{product.operatingSystemName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{product.originName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{product.warehouseAreaName || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        (product.stockQuantity || 0) > 0
                          ? 'bg-orange-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stockQuantity || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        product.status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status ? 'Hoạt động' : 'Tắt'}
                      </span>
                    </td>
                    {(hasPermission(PERMISSIONS.PRODUCT_UPDATE_ALL) || hasPermission(PERMISSIONS.PRODUCT_DELETE_ALL)) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {hasPermission(PERMISSIONS.PRODUCT_UPDATE_ALL) && (
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={Edit2}
                              onClick={() => handleEditProduct(product.idProduct)}
                            >
                              Sửa
                            </Button>
                          )}
                          {hasPermission(PERMISSIONS.PRODUCT_DELETE_ALL) && (
                            <Button
                              variant="danger"
                              size="sm"
                              icon={Trash2}
                              onClick={() => handleDeleteClick(product.idProduct, product.nameProduct)}
                            />
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

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