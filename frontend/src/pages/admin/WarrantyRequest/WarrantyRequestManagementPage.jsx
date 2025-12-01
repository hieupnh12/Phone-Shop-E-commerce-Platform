import React, { useState, useEffect } from "react";
import {
  Shield,
  Search,
  Filter,
  RefreshCw,
  Edit,
  UserCheck,
  Lock,
  X,
} from "lucide-react";
import { warrantyRequestService } from "../../../services/api";
import Toast from "../../../components/common/Toast";
import Pagination from "../../../components/common/Pagination";
import { useAuthFullOptions } from "../../../contexts/AuthContext";
import { hasRole } from "../../../utils/permissionUtils";

const WarrantyRequestManagementPage = () => {
  const { user } = useAuthFullOptions();
  const currentEmployeeId = user?.id || null;
  const isAdmin = hasRole("ROLE_ADMIN");

  // State for all requests (common table)
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // State for employee's assigned requests
  const [myAssignedRequests, setMyAssignedRequests] = useState([]);
  const [myAssignedLoading, setMyAssignedLoading] = useState(false);
  const [myAssignedCurrentPage, setMyAssignedCurrentPage] = useState(0);
  const [myAssignedTotalPages, setMyAssignedTotalPages] = useState(0);
  const [myAssignedTotalElements, setMyAssignedTotalElements] = useState(0);

  // State for update modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    adminNote: "",
    appointmentDate: "",
  });

  useEffect(() => {
    fetchRequests();
    if (currentEmployeeId) {
      fetchMyAssignedRequests();
    }
  }, [currentPage, statusFilter, currentEmployeeId]);

  useEffect(() => {
    if (currentEmployeeId) {
      fetchMyAssignedRequests();
    }
  }, [myAssignedCurrentPage]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await warrantyRequestService.getAllRequests(
        currentPage,
        pageSize,
        "requestId,desc",
        statusFilter || null
      );

      if (response) {
        if (response.content && Array.isArray(response.content)) {
          setRequests(response.content);
          setTotalPages(response.totalPages || 0);
          setTotalElements(response.totalElements || 0);
        } else if (Array.isArray(response)) {
          setRequests(response);
          setTotalPages(1);
          setTotalElements(response.length);
        } else if (response.result) {
          const pageData = response.result;
          if (pageData.content && Array.isArray(pageData.content)) {
            setRequests(pageData.content);
            setTotalPages(pageData.totalPages || 0);
            setTotalElements(pageData.totalElements || 0);
          } else if (Array.isArray(pageData)) {
            setRequests(pageData);
            setTotalPages(1);
            setTotalElements(pageData.length);
          }
        } else {
          setRequests([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } else {
        setRequests([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      console.error("Error fetching warranty requests:", err);
      setError("Không thể tải danh sách yêu cầu bảo hành");
      setToast({
        type: "error",
        message:
          err.response?.data?.message ||
          err.message ||
          "Không thể tải danh sách yêu cầu bảo hành",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAssignedRequests = async () => {
    if (!currentEmployeeId) return;

    try {
      setMyAssignedLoading(true);
      const response = await warrantyRequestService.getMyAssignedRequests(
        myAssignedCurrentPage,
        pageSize,
        "requestId,desc"
      );

      if (response) {
        if (response.content && Array.isArray(response.content)) {
          setMyAssignedRequests(response.content);
          setMyAssignedTotalPages(response.totalPages || 0);
          setMyAssignedTotalElements(response.totalElements || 0);
        } else if (Array.isArray(response)) {
          setMyAssignedRequests(response);
          setMyAssignedTotalPages(1);
          setMyAssignedTotalElements(response.length);
        } else if (response.result) {
          const pageData = response.result;
          if (pageData.content && Array.isArray(pageData.content)) {
            setMyAssignedRequests(pageData.content);
            setMyAssignedTotalPages(pageData.totalPages || 0);
            setMyAssignedTotalElements(pageData.totalElements || 0);
          } else if (Array.isArray(pageData)) {
            setMyAssignedRequests(pageData);
            setMyAssignedTotalPages(1);
            setMyAssignedTotalElements(pageData.length);
          }
        } else {
          setMyAssignedRequests([]);
          setMyAssignedTotalPages(0);
          setMyAssignedTotalElements(0);
        }
      } else {
        setMyAssignedRequests([]);
        setMyAssignedTotalPages(0);
        setMyAssignedTotalElements(0);
      }
    } catch (err) {
      console.error("Error fetching my assigned requests:", err);
      setToast({
        type: "error",
        message:
          err.response?.data?.message ||
          "Không thể tải danh sách yêu cầu được giao",
      });
    } finally {
      setMyAssignedLoading(false);
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(0);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredRequests = requests.filter((request) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      request.requestId?.toString().includes(searchLower) ||
      request.orderId?.toString().includes(searchLower) ||
      request.customerName?.toLowerCase().includes(searchLower) ||
      request.productName?.toLowerCase().includes(searchLower) ||
      request.productVersionId?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: "Đang chờ", color: "bg-yellow-100 text-yellow-800" },
      ACCEPTED: { label: "Đã chấp nhận", color: "bg-blue-100 text-blue-800" },
      REJECTED: { label: "Đã từ chối", color: "bg-red-100 text-red-800" },
      IN_PROGRESS: {
        label: "Đang xử lý",
        color: "bg-purple-100 text-purple-800",
      },
      COMPLETED: {
        label: "Đã hoàn thành",
        color: "bg-green-100 text-green-800",
      },
    };
    const statusInfo = statusMap[status] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleAssignRequest = async (request) => {
    if (!currentEmployeeId) {
      setToast({
        type: "error",
        message: "Bạn cần đăng nhập để chọn xử lý yêu cầu",
      });
      return;
    }

    if (request.employeeId && request.employeeId !== currentEmployeeId) {
      setToast({
        type: "error",
        message: "Yêu cầu này đã được nhân viên khác chọn xử lý",
      });
      return;
    }

    try {
      // Assign by updating status (this will set employeeId automatically)
      const updateData = {
        status: request.status || "PENDING",
        adminNote: request.adminNote || null,
        appointmentDate: request.appointmentDate
          ? new Date(request.appointmentDate).toISOString()
          : null,
      };

      await warrantyRequestService.updateRequestStatus(
        request.requestId,
        updateData
      );

      setToast({
        type: "success",
        message: "Đã chọn xử lý yêu cầu thành công!",
      });

      fetchRequests();
      fetchMyAssignedRequests();
    } catch (err) {
      console.error("Error assigning request:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "Không thể chọn xử lý yêu cầu",
      });
    }
  };

  const handleOpenUpdateModal = (request) => {
    // Check if current employee can edit this request
    if (request.employeeId && request.employeeId !== currentEmployeeId) {
      setToast({
        type: "error",
        message:
          "Bạn không có quyền chỉnh sửa yêu cầu này. Yêu cầu đã được nhân viên khác chọn xử lý.",
      });
      return;
    }

    setSelectedRequest(request);
    setUpdateForm({
      status: request.status || "",
      adminNote: request.adminNote || "",
      appointmentDate: request.appointmentDate
        ? new Date(request.appointmentDate).toISOString().slice(0, 16)
        : "",
    });
    setShowUpdateModal(true);
  };

  const handleUnassignRequest = async (request) => {
    if (!currentEmployeeId) {
      setToast({
        type: "error",
        message: "Bạn cần đăng nhập để thực hiện thao tác này",
      });
      return;
    }

    // Check permission: only assigned employee or admin can unassign
    if (!isAdmin && request.employeeId !== currentEmployeeId) {
      setToast({
        type: "error",
        message: "Bạn không có quyền hủy xử lý yêu cầu này",
      });
      return;
    }

    try {
      await warrantyRequestService.unassignRequest(request.requestId);

      setToast({
        type: "success",
        message: "Đã hủy xử lý yêu cầu thành công!",
      });

      fetchRequests();
      fetchMyAssignedRequests();
    } catch (err) {
      console.error("Error unassigning request:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "Không thể hủy xử lý yêu cầu",
      });
    }
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;

    // Double check permission
    if (
      selectedRequest.employeeId &&
      selectedRequest.employeeId !== currentEmployeeId
    ) {
      setToast({
        type: "error",
        message: "Bạn không có quyền chỉnh sửa yêu cầu này",
      });
      setShowUpdateModal(false);
      return;
    }

    try {
      const updateData = {
        status: updateForm.status,
        adminNote: updateForm.adminNote || null,
        appointmentDate: updateForm.appointmentDate
          ? new Date(updateForm.appointmentDate).toISOString()
          : null,
      };

      await warrantyRequestService.updateRequestStatus(
        selectedRequest.requestId,
        updateData
      );

      setToast({
        type: "success",
        message: "Cập nhật trạng thái yêu cầu thành công!",
      });

      setShowUpdateModal(false);
      setSelectedRequest(null);
      fetchRequests();
      fetchMyAssignedRequests();
    } catch (err) {
      console.error("Error updating request:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "Không thể cập nhật yêu cầu",
      });
    }
  };

  const canEditRequest = (request) => {
    // Can edit if: no employee assigned OR assigned to current employee
    return !request.employeeId || request.employeeId === currentEmployeeId;
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý yêu cầu bảo hành
          </h1>
        </div>
        <p className="text-gray-600">Tổng số yêu cầu: {totalElements}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, tên khách hàng, sản phẩm..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Đang chờ</option>
              <option value="ACCEPTED">Đã chấp nhận</option>
              <option value="REJECTED">Đã từ chối</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="COMPLETED">Đã hoàn thành</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              fetchRequests();
              if (currentEmployeeId) fetchMyAssignedRequests();
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Làm mới
          </button>
        </div>
      </div>

      {/* All Requests Table (Common) */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh sách yêu cầu chung
          </h2>
          <p className="text-sm text-gray-500 mt-1">Chọn yêu cầu để xử lý</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã yêu cầu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời hạn bảo hành
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người xử lý
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {loading ? "Đang tải..." : "Không có yêu cầu nào"}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => {
                  const canEdit = canEditRequest(request);
                  const isAssigned =
                    request.employeeId &&
                    request.employeeId !== currentEmployeeId;

                  return (
                    <tr key={request.requestId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{request.requestId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        #{request.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {request.customerName || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>
                          <div className="font-medium">
                            {request.productName || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.productVersionId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {request.warrantyExpiryDate ? (
                          <div>
                            <div className="font-medium">
                              {formatDateOnly(request.warrantyExpiryDate)}
                            </div>
                            {request.warrantyPeriod && (
                              <div className="text-xs text-gray-500">
                                ({request.warrantyPeriod} tháng)
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            {request.warrantyPeriod
                              ? `N/A (${request.warrantyPeriod} tháng)`
                              : "N/A"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {request.employeeName ? (
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-blue-600" />
                            <span>{request.employeeName}</span>
                            {isAssigned && (
                              <Lock className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Chưa có</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {!request.employeeId ? (
                            <button
                              onClick={() => handleAssignRequest(request)}
                              className="flex items-center gap-1 text-green-600 hover:text-green-800 font-medium"
                            >
                              <UserCheck className="w-4 h-4" />
                              Chọn xử lý
                            </button>
                          ) : canEdit ? (
                            <button
                              onClick={() => handleOpenUpdateModal(request)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <Edit className="w-4 h-4" />
                              Cập nhật
                            </button>
                          ) : isAdmin ? (
                            <button
                              onClick={() => handleUnassignRequest(request)}
                              className="flex items-center gap-1 text-orange-600 hover:text-orange-800 font-medium"
                              title="Admin: Hủy xử lý từ nhân viên khác"
                            >
                              <X className="w-4 h-4" />
                              Hủy xử lý
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Đã khóa
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage + 1}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page - 1)}
              maxVisiblePages={5}
              size="md"
            />
          </div>
        )}
      </div>

      {/* My Assigned Requests Table */}
      {currentEmployeeId && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Yêu cầu của tôi
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Tổng số: {myAssignedTotalElements}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã yêu cầu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời hạn bảo hành
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myAssignedLoading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Đang tải...
                    </td>
                  </tr>
                ) : myAssignedRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Bạn chưa có yêu cầu nào được giao
                    </td>
                  </tr>
                ) : (
                  myAssignedRequests.map((request) => (
                    <tr key={request.requestId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{request.requestId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        #{request.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {request.customerName || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>
                          <div className="font-medium">
                            {request.productName || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.productVersionId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {request.warrantyExpiryDate ? (
                          <div>
                            <div className="font-medium">
                              {formatDateOnly(request.warrantyExpiryDate)}
                            </div>
                            {request.warrantyPeriod && (
                              <div className="text-xs text-gray-500">
                                ({request.warrantyPeriod} tháng)
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            {request.warrantyPeriod
                              ? `N/A (${request.warrantyPeriod} tháng)`
                              : "N/A"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenUpdateModal(request)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <Edit className="w-4 h-4" />
                            Cập nhật
                          </button>
                          <button
                            onClick={() => handleUnassignRequest(request)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium"
                            title="Hủy xử lý yêu cầu này"
                          >
                            <X className="w-4 h-4" />
                            Hủy xử lý
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {myAssignedTotalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={myAssignedCurrentPage + 1}
                totalPages={myAssignedTotalPages}
                onPageChange={(page) => setMyAssignedCurrentPage(page - 1)}
                maxVisiblePages={5}
                size="md"
              />
            </div>
          )}
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Cập nhật yêu cầu #{selectedRequest.requestId}
                </h2>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              {/* Request Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Đơn hàng:</span>
                    <span className="ml-2 font-medium">
                      #{selectedRequest.orderId}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Khách hàng:</span>
                    <span className="ml-2 font-medium">
                      {selectedRequest.customerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Sản phẩm:</span>
                    <span className="ml-2 font-medium">
                      {selectedRequest.productName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Người xử lý:</span>
                    <span className="ml-2 font-medium">
                      {selectedRequest.employeeName || "Chưa có"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Lý do:</span>
                    <p className="mt-1 text-gray-800">
                      {selectedRequest.reason || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Update Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={updateForm.status}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PENDING">Đang chờ</option>
                    <option value="ACCEPTED">Đã chấp nhận</option>
                    <option value="REJECTED">Đã từ chối</option>
                    <option value="IN_PROGRESS">Đang xử lý</option>
                    <option value="COMPLETED">Đã hoàn thành</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú của admin
                  </label>
                  <textarea
                    value={updateForm.adminNote}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        adminNote: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Nhập ghi chú cho khách hàng..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày hẹn
                  </label>
                  <input
                    type="datetime-local"
                    value={updateForm.appointmentDate}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        appointmentDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateRequest}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
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

export default WarrantyRequestManagementPage;
