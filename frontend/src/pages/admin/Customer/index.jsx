import React, { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import customerService from "../../../services/customerService";

// Import your customerService
// import customerService from './services/customerService';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    searchCustomers();
  }, [currentPage]);

  const {
    data: mockResponse = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await customerService.getAllInfo(
        keyword,
        currentPage,
        pageSize
      );
      return res?.result || res || [];
    },
  });

  const searchCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Uncomment khi deploy thực tế
      // const response = await customerService.getAllInfo(keyword, currentPage, pageSize);
      // const data = response.data.result;

      // Mock response để demo

      const data = mockResponse;

      setCustomers(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError("Không thể tải danh sách khách hàng. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    searchCustomers();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString)
      return <span className="text-gray-400 italic">Chưa cập nhật</span>;
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString)
      return <span className="text-gray-400 italic">Chưa cập nhật</span>;
    const date = new Date(dateTimeString);
    return date.toLocaleString("vi-VN");
  };

  const handleViewDetail = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleEdit = (customer) => {
    // Implement edit functionality
    console.log("Edit customer:", customer);
    alert("Chức năng chỉnh sửa đang được phát triển");
  };

  const handleDelete = (customerId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      // API call để xóa
      console.log("Delete customer:", customerId);
      alert("Chức năng xóa đang được phát triển");
    }
  };

  const getDisplayValue = (value, defaultText = "Chưa cập nhật") => {
    return value || <span className="text-gray-400 italic">{defaultText}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Quản Lý Khách Hàng
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Tổng số:{" "}
                <span className="font-semibold text-blue-600">
                  {totalElements}
                </span>{" "}
                khách hàng
              </p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <UserPlus size={20} />
              Thêm Khách Hàng
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, số điện thoại, email..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Customer List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <User size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Không tìm thấy khách hàng nào</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Họ Tên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số Điện Thoại
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giới Tính
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày Sinh
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Địa Chỉ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao Tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr
                        key={customer.customerId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.customerId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                              <User size={20} className="text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {getDisplayValue(
                                  customer.fullName,
                                  "Chưa có tên"
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getDisplayValue(customer.email)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.gender === null ? (
                            <span className="text-gray-400 italic text-xs">
                              Chưa cập nhật
                            </span>
                          ) : (
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                customer.gender
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-pink-100 text-pink-800"
                              }`}
                            >
                              {customer.gender ? "Nam" : "Nữ"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatDate(customer.birthDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {getDisplayValue(customer.address)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetail(customer)}
                              className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition-colors"
                              title="Xem chi tiết"
                            >
                              <User size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(customer)}
                              className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(customer.customerId)}
                              className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                              title="Xóa"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị{" "}
                  <span className="font-medium">{customers.length}</span> trong
                  tổng số <span className="font-medium">{totalElements}</span>{" "}
                  khách hàng
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
                    Trang <span className="font-medium">{currentPage + 1}</span>{" "}
                    / <span className="font-medium">{totalPages || 1}</span>
                  </span>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(0, currentPage - 1))
                      }
                      disabled={currentPage === 0}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.min(totalPages - 1, currentPage + 1)
                        )
                      }
                      disabled={currentPage >= totalPages - 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Chi Tiết Khách Hàng
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Họ và Tên</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {getDisplayValue(
                        selectedCustomer.fullName,
                        "Chưa có tên"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Phone className="text-green-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Số Điện Thoại</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedCustomer.phoneNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Mail className="text-red-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {getDisplayValue(selectedCustomer.email)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MapPin className="text-purple-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Địa Chỉ</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {getDisplayValue(selectedCustomer.address)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Giới Tính</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedCustomer.gender === null ? (
                        <span className="text-gray-400 italic text-sm">
                          Chưa cập nhật
                        </span>
                      ) : selectedCustomer.gender ? (
                        "Nam"
                      ) : (
                        "Nữ"
                      )}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Ngày Sinh</p>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatDate(selectedCustomer.birthDate)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Ngày Tạo</p>
                    <div className="text-sm font-medium text-gray-900">
                      {formatDateTime(selectedCustomer.createAt)}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">
                      Cập Nhật Lần Cuối
                    </p>
                    <div className="text-sm font-medium text-gray-900">
                      {formatDateTime(selectedCustomer.updateAt)}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    <span className="font-semibold">ID Khách Hàng:</span>{" "}
                    {selectedCustomer.customerId}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    handleEdit(selectedCustomer);
                    setShowModal(false);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Chỉnh Sửa
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
