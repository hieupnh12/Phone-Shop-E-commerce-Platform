import React, { useState, useEffect } from "react";
import {
  Shield,
  Search,
  Filter,
  Edit,
  UserCheck,
  Lock,
  X,
  AlertTriangle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { warrantyRequestService } from "../../../services/api";
import Toast from "../../../components/common/Toast";
import Pagination from "../../../components/common/Pagination";
import { useAuthFullOptions } from "../../../contexts/AuthContext";
import { hasRole } from "../../../utils/permissionUtils";
import { usePermission, PERMISSIONS } from "../../../hooks/usePermission";

const WarrantyRequestManagementPage = () => {
  const { user } = useAuthFullOptions();
  const currentEmployeeId = user?.id || null;
  const isAdmin = hasRole("ROLE_ADMIN");
  const { hasPermission } = usePermission();
  const hasUpdatePermission = hasPermission(PERMISSIONS.WARRANTY_UPDATE_BASIC);
  const hasViewAllPermission = hasPermission(PERMISSIONS.WARRANTY_VIEW_ALL);

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateFilterError, setDateFilterError] = useState("");

  // State for employee's assigned requests
  const [myAssignedRequests, setMyAssignedRequests] = useState([]);
  const [myAssignedCurrentPage, setMyAssignedCurrentPage] = useState(0);
  const [myAssignedTotalPages, setMyAssignedTotalPages] = useState(0);
  const [myAssignedTotalElements, setMyAssignedTotalElements] = useState(0);

  // State for update modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    adminNote: "",
    appointmentDate: "",
  });
  const [appointmentDateError, setAppointmentDateError] = useState("");

  // Use useQuery for automatic refetching with staleTime = 0
  // Chỉ query khi có quyền VIEW_ALL
  const {
    data: requestsData,
    isLoading: requestsLoading,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: [
      "warranty-requests",
      currentPage,
      pageSize,
      statusFilter,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response = await warrantyRequestService.getAllRequests(
        currentPage,
        pageSize,
        "requestId,desc",
        statusFilter || null,
        startDate || null,
        endDate || null
      );
      return response;
    },
    enabled: hasViewAllPermission, // Chỉ query khi có quyền VIEW_ALL
    staleTime: 0, // Always refetch
    refetchInterval: hasViewAllPermission ? 2000 : false, // Chỉ refetch nếu có quyền
  });

  const {
    data: myAssignedData,
    isLoading: myAssignedLoading,
    refetch: refetchMyAssigned,
  } = useQuery({
    queryKey: [
      "my-assigned-requests",
      currentEmployeeId,
      myAssignedCurrentPage,
      pageSize,
    ],
    queryFn: async () => {
      if (!currentEmployeeId) return null;
      const response = await warrantyRequestService.getMyAssignedRequests(
        myAssignedCurrentPage,
        pageSize,
        "requestId,desc"
      );
      return response;
    },
    enabled: !!currentEmployeeId,
    staleTime: 0, // Always refetch
    refetchInterval: 2000, // Refetch every 5 seconds
  });

  // Update requests state from query data
  useEffect(() => {
    if (requestsData) {
      if (requestsData.content && Array.isArray(requestsData.content)) {
        // Case 1: Direct Page object
        setRequests(requestsData.content);
        setTotalPages(requestsData.totalPages || 0);
        setTotalElements(requestsData.totalElements || 0);
        console.log("✅ Parsed as Page object:", {
          content: requestsData.content.length,
          totalPages: requestsData.totalPages,
          totalElements: requestsData.totalElements,
        });
      } else if (Array.isArray(requestsData)) {
        // Case 2: Direct array (fallback - không có pagination)
        setRequests(requestsData);
        setTotalPages(1);
        setTotalElements(requestsData.length);
        console.warn("⚠️ Received array instead of Page object");
      } else if (requestsData.result) {
        // Case 3: Wrapped in result
        const pageData = requestsData.result;
        if (pageData.content && Array.isArray(pageData.content)) {
          setRequests(pageData.content);
          setTotalPages(pageData.totalPages || 0);
          setTotalElements(pageData.totalElements || 0);
          console.log("✅ Parsed as result.Page object:", {
            content: pageData.content.length,
            totalPages: pageData.totalPages,
            totalElements: pageData.totalElements,
          });
        } else if (Array.isArray(pageData)) {
          setRequests(pageData);
          setTotalPages(1);
          setTotalElements(pageData.length);
          console.warn("⚠️ Received array in result instead of Page object");
        }
      }
      setLoading(false);
    }
  }, [requestsData, currentPage, pageSize]);

  // Update my assigned requests state from query data
  useEffect(() => {
    if (myAssignedData) {
      if (myAssignedData.content && Array.isArray(myAssignedData.content)) {
        setMyAssignedRequests(myAssignedData.content);
        setMyAssignedTotalPages(myAssignedData.totalPages || 0);
        setMyAssignedTotalElements(myAssignedData.totalElements || 0);
      } else if (Array.isArray(myAssignedData)) {
        setMyAssignedRequests(myAssignedData);
        setMyAssignedTotalPages(1);
        setMyAssignedTotalElements(myAssignedData.length);
      } else if (myAssignedData.result) {
        const pageData = myAssignedData.result;
        if (pageData.content && Array.isArray(pageData.content)) {
          setMyAssignedRequests(pageData.content);
          setMyAssignedTotalPages(pageData.totalPages || 0);
          setMyAssignedTotalElements(pageData.totalElements || 0);
        } else if (Array.isArray(pageData)) {
          setMyAssignedRequests(pageData);
          setMyAssignedTotalPages(1);
          setMyAssignedTotalElements(pageData.length);
        }
      }
    }
  }, [myAssignedData]);

  // Status order for validation (only forward progression for employees)
  const STATUS_ORDER = {
    PENDING: 0,
    ACCEPTED: 1,
    IN_PROGRESS: 2,
    COMPLETED: 3,
    REJECTED: -1, // Can be set from any status
  };

  // Check if status transition is allowed (for employees, only forward progression)
  const canTransitionStatus = (currentStatus, newStatus) => {
    // Admin can do anything
    if (isAdmin) return true;

    // If already completed or rejected, cannot change (except admin)
    if (currentStatus === "COMPLETED" || currentStatus === "REJECTED") {
      return false;
    }

    // Cannot change to completed or rejected if already in final state
    if (newStatus === "COMPLETED" || newStatus === "REJECTED") {
      // Can transition to final states from any non-final state
      return true;
    }

    // For forward progression: can only move to next status or same status
    const currentOrder = STATUS_ORDER[currentStatus] ?? -1;
    const newOrder = STATUS_ORDER[newStatus] ?? -1;

    // Can only move forward (newOrder >= currentOrder) or stay same
    return newOrder >= currentOrder;
  };

  // Check if request can be edited
  const canEditRequestStatus = (request) => {
    // Admin can always edit
    if (isAdmin) return true;

    // If completed or rejected, cannot edit
    if (request.status === "COMPLETED" || request.status === "REJECTED") {
      return false;
    }

    // Can edit if assigned to current employee or not assigned
    return !request.employeeId || request.employeeId === currentEmployeeId;
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(0);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Reset về trang đầu khi search
    setCurrentPage(0);
  };

  // Validate date filters
  const validateDateFilters = (start, end) => {
    if (!start && !end) {
      return { valid: true, message: "" };
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (start) {
      const startDateObj = new Date(start);
      if (startDateObj > today) {
        return {
          valid: false,
          message: "Từ ngày không được là ngày trong tương lai",
        };
      }
    }

    if (end) {
      const endDateObj = new Date(end);
      endDateObj.setHours(23, 59, 59, 999);
      if (endDateObj > today) {
        return {
          valid: false,
          message: "Đến ngày không được là ngày trong tương lai",
        };
      }
    }

    if (start && end) {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      endDateObj.setHours(23, 59, 59, 999);
      if (startDateObj > endDateObj) {
        return {
          valid: false,
          message: "Từ ngày không được sau đến ngày",
        };
      }
    }

    return { valid: true, message: "" };
  };

  const handleStartDateChange = (e) => {
    const value = e.target.value;
    const validation = validateDateFilters(value, endDate);
    setDateFilterError(validation.valid ? "" : validation.message);
    setStartDate(value);
    setCurrentPage(0);
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    const validation = validateDateFilters(startDate, value);
    setDateFilterError(validation.valid ? "" : validation.message);
    setEndDate(value);
    setCurrentPage(0);
  };

  // Client-side filtering chỉ cho search (tùy chọn, không ảnh hưởng pagination)
  // Note: Phân trang dựa trên dữ liệu từ backend, không dựa trên filtered data
  const filteredRequests = requests.filter((request) => {
    if (!searchTerm || searchTerm.trim() === "") return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      request.requestId?.toString().includes(searchLower) ||
      request.orderId?.toString().includes(searchLower) ||
      request.customerName?.toLowerCase().includes(searchLower) ||
      request.productName?.toLowerCase().includes(searchLower) ||
      request.productVersionId?.toLowerCase().includes(searchLower)
    );
  });

  // Use requests from backend for pagination, not filteredRequests
  // FilteredRequests chỉ để hiển thị kết quả tìm kiếm client-side (nếu có)
  const displayRequests =
    searchTerm && searchTerm.trim() !== "" ? filteredRequests : requests;

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

  // Validate appointment date: không được quá khứ và phải trong giờ làm việc (8h-17h)
  const validateAppointmentDate = (dateTimeString) => {
    if (!dateTimeString) return { valid: true, message: "" };

    const selectedDate = new Date(dateTimeString);
    const now = new Date();

    // Không được chọn quá khứ
    if (selectedDate < now) {
      return {
        valid: false,
        message: "Ngày hẹn không được là thời gian trong quá khứ",
      };
    }

    // Kiểm tra giờ làm việc (8h-17h)
    const hour = selectedDate.getHours();
    if (hour < 8 || hour >= 17) {
      return {
        valid: false,
        message: "Giờ hẹn phải trong thời gian làm việc (8:00 - 17:00)",
      };
    }

    return { valid: true, message: "" };
  };

  const handleAssignRequest = async (request) => {
    if (!currentEmployeeId) {
      setToast({
        type: "error",
        message: "Bạn cần đăng nhập để chọn xử lý yêu cầu",
      });
      return;
    }

    // Check permission to update warranty requests
    if (!hasUpdatePermission) {
      setToast({
        type: "error",
        message: "Bạn không có quyền chọn xử lý yêu cầu bảo hành",
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

      refetchRequests();
      refetchMyAssigned();
    } catch (err) {
      console.error("Error assigning request:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "Không thể chọn xử lý yêu cầu",
      });
    }
  };

  const handleOpenUpdateModal = (request) => {
    // Check permission first
    if (!hasUpdatePermission) {
      setToast({
        type: "error",
        message: "Bạn không có quyền cập nhật yêu cầu bảo hành",
      });
      return;
    }

    // Check if can edit this request
    if (!canEditRequestStatus(request)) {
      setToast({
        type: "error",
        message:
          request.status === "COMPLETED" || request.status === "REJECTED"
            ? "Không thể chỉnh sửa yêu cầu đã hoàn thành hoặc đã từ chối"
            : "Bạn không có quyền chỉnh sửa yêu cầu này. Yêu cầu đã được nhân viên khác chọn xử lý.",
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
    setAppointmentDateError("");
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

    // Check permission to update warranty requests
    if (!hasUpdatePermission) {
      setToast({
        type: "error",
        message: "Bạn không có quyền hủy xử lý yêu cầu bảo hành",
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

      refetchRequests();
      refetchMyAssigned();
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

    // Check permission first
    if (!hasUpdatePermission) {
      setToast({
        type: "error",
        message: "Bạn không có quyền cập nhật yêu cầu bảo hành",
      });
      setShowUpdateModal(false);
      return;
    }

    // Check if can edit this request
    if (!canEditRequestStatus(selectedRequest)) {
      setToast({
        type: "error",
        message: "Bạn không có quyền chỉnh sửa yêu cầu này",
      });
      setShowUpdateModal(false);
      return;
    }

    // Validate appointment date if provided
    if (updateForm.appointmentDate) {
      const validation = validateAppointmentDate(updateForm.appointmentDate);
      if (!validation.valid) {
        setToast({
          type: "error",
          message: validation.message,
        });
        setAppointmentDateError(validation.message);
        return;
      }
    }

    // Check if status transition is allowed
    if (
      updateForm.status !== selectedRequest.status &&
      !canTransitionStatus(selectedRequest.status, updateForm.status)
    ) {
      setToast({
        type: "error",
        message:
          "Bạn chỉ có thể tiến các bước tiến trình, không thể lùi lại trạng thái",
      });
      return;
    }

    // If changing to COMPLETED or REJECTED, show confirmation modal
    if (
      (updateForm.status === "COMPLETED" || updateForm.status === "REJECTED") &&
      selectedRequest.status !== updateForm.status &&
      !isAdmin
    ) {
      setPendingUpdate({
        requestId: selectedRequest.requestId,
        updateData: {
          status: updateForm.status,
          adminNote: updateForm.adminNote || null,
          appointmentDate: updateForm.appointmentDate
            ? new Date(updateForm.appointmentDate).toISOString()
            : null,
        },
      });
      setShowUpdateModal(false);
      setShowConfirmModal(true);
      return;
    }

    // Proceed with update
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
      refetchRequests();
      refetchMyAssigned();
    } catch (err) {
      console.error("Error updating request:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "Không thể cập nhật yêu cầu",
      });
    }
  };

  const handleConfirmUpdate = async () => {
    if (!pendingUpdate) return;

    try {
      await warrantyRequestService.updateRequestStatus(
        pendingUpdate.requestId,
        pendingUpdate.updateData
      );

      setToast({
        type: "success",
        message: "Cập nhật trạng thái yêu cầu thành công!",
      });

      setShowConfirmModal(false);
      setPendingUpdate(null);
      setSelectedRequest(null);
      refetchRequests();
      refetchMyAssigned();
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

  const isFinalStatus = (status) => {
    return status === "COMPLETED" || status === "REJECTED";
  };

  // Chỉ hiển thị loading nếu đang load và có quyền VIEW_ALL
  if (hasViewAllPermission && requestsLoading && requests.length === 0) {
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
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý yêu cầu bảo hành
          </h1>
        </div>
        {hasViewAllPermission && (
          <p className="text-gray-600">Tổng số yêu cầu: {totalElements}</p>
        )}
        {!hasViewAllPermission && hasUpdatePermission && (
          <p className="text-gray-600">Xem yêu cầu được giao cho bạn</p>
        )}
      </div>

      {/* Filters - Chỉ hiển thị nếu có quyền VIEW_ALL */}
      {hasViewAllPermission && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="space-y-4">
            {/* First Row: Search and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Second Row: Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  max={
                    endDate && endDate < new Date().toISOString().split("T")[0]
                      ? endDate
                      : new Date().toISOString().split("T")[0]
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    dateFilterError
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  min={startDate || undefined}
                  max={new Date().toISOString().split("T")[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    dateFilterError
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
            </div>

            {/* Error Message */}
            {dateFilterError && (
              <div className="text-sm text-red-600">{dateFilterError}</div>
            )}
          </div>
        </div>
      )}

      {/* All Requests Table (Common) - Chỉ hiển thị nếu có quyền VIEW_ALL */}
      {hasViewAllPermission && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách yêu cầu chung
            </h2>
            <p className="text-sm text-gray-500 mt-1">Chọn yêu cầu để xử lý</p>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã yêu cầu
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Đơn hàng
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Sản phẩm
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Thời hạn bảo hành
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Người xử lý
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                      Ngày tạo
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requestsLoading ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Đang tải...
                      </td>
                    </tr>
                  ) : displayRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        {searchTerm && searchTerm.trim() !== ""
                          ? "Không tìm thấy yêu cầu nào phù hợp"
                          : "Không có yêu cầu nào"}
                      </td>
                    </tr>
                  ) : (
                    displayRequests.map((request) => {
                      const canEdit = canEditRequest(request);
                      const isAssigned =
                        request.employeeId &&
                        request.employeeId !== currentEmployeeId;

                      return (
                        <tr
                          key={request.requestId}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex flex-col">
                              <span>#{request.requestId}</span>
                              <span className="text-xs text-gray-500 sm:hidden">
                                ĐH: #{request.orderId}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                            #{request.orderId}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div className="flex flex-col">
                              <span>{request.customerName || "N/A"}</span>
                              <span
                                className="text-xs text-gray-500 md:hidden truncate max-w-[150px]"
                                title={request.productName || "N/A"}
                              >
                                {request.productName || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                            <div>
                              <div
                                className="font-medium max-w-xs truncate"
                                title={request.productName || "N/A"}
                              >
                                {request.productName || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {request.productVersionId}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
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
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
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
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden xl:table-cell">
                            {formatDate(request.createdAt)}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                              {!request.employeeId ? (
                                hasUpdatePermission ? (
                                  <button
                                    onClick={() => handleAssignRequest(request)}
                                    className="flex items-center gap-1 text-green-600 hover:text-green-800 font-medium text-xs sm:text-sm"
                                  >
                                    <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">
                                      Chọn xử lý
                                    </span>
                                    <span className="sm:hidden">Chọn</span>
                                  </button>
                                ) : (
                                  <span className="text-gray-400 text-xs sm:text-sm">
                                    Không có quyền
                                  </span>
                                )
                              ) : canEdit &&
                                hasUpdatePermission &&
                                canEditRequestStatus(request) ? (
                                <button
                                  onClick={() => handleOpenUpdateModal(request)}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm"
                                >
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">
                                    Cập nhật
                                  </span>
                                  <span className="sm:hidden">Sửa</span>
                                </button>
                              ) : isAdmin &&
                                hasUpdatePermission &&
                                !isFinalStatus(request.status) ? (
                                <button
                                  onClick={() => handleUnassignRequest(request)}
                                  className="flex items-center gap-1 text-orange-600 hover:text-orange-800 font-medium text-xs sm:text-sm"
                                  title="Admin: Hủy xử lý từ nhân viên khác"
                                >
                                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">
                                    Hủy xử lý
                                  </span>
                                  <span className="sm:hidden">Hủy</span>
                                </button>
                              ) : (
                                <span className="text-gray-400 text-xs sm:text-sm">
                                  {isFinalStatus(request.status)
                                    ? "Đã kết thúc"
                                    : "Đã khóa"}
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
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Hiển thị{" "}
                  <span className="font-semibold">
                    {requests.length > 0 ? currentPage * pageSize + 1 : 0}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold">
                    {Math.min((currentPage + 1) * pageSize, totalElements)}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-semibold">{totalElements}</span>{" "}
                  {searchTerm && searchTerm.trim() !== ""
                    ? "kết quả tìm kiếm"
                    : "yêu cầu"}
                </div>
                <Pagination
                  currentPage={currentPage + 1}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page - 1)}
                  maxVisiblePages={5}
                  size="md"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Assigned Requests Table */}
      {currentEmployeeId && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Yêu cầu của tôi
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Tổng số: {myAssignedTotalElements}
            </p>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã yêu cầu
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Đơn hàng
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Sản phẩm
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Thời hạn bảo hành
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                      Ngày tạo
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex flex-col">
                            <span>#{request.requestId}</span>
                            <span className="text-xs text-gray-500 sm:hidden">
                              ĐH: #{request.orderId}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                          #{request.orderId}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex flex-col">
                            <span>{request.customerName || "N/A"}</span>
                            <span
                              className="text-xs text-gray-500 md:hidden truncate max-w-[150px]"
                              title={request.productName || "N/A"}
                            >
                              {request.productName || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                          <div>
                            <div
                              className="font-medium max-w-xs truncate"
                              title={request.productName || "N/A"}
                            >
                              {request.productName || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {request.productVersionId}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
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
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden xl:table-cell">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                            {hasUpdatePermission &&
                            canEditRequestStatus(request) ? (
                              <>
                                <button
                                  onClick={() => handleOpenUpdateModal(request)}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm"
                                >
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">
                                    Cập nhật
                                  </span>
                                  <span className="sm:hidden">Sửa</span>
                                </button>
                                {!isFinalStatus(request.status) && (
                                  <button
                                    onClick={() =>
                                      handleUnassignRequest(request)
                                    }
                                    className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium text-xs sm:text-sm"
                                    title="Hủy xử lý yêu cầu này"
                                  >
                                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">
                                      Hủy xử lý
                                    </span>
                                    <span className="sm:hidden">Hủy</span>
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 text-xs sm:text-sm">
                                {isFinalStatus(request.status)
                                  ? "Đã kết thúc"
                                  : "Không có quyền cập nhật"}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {myAssignedTotalPages > 0 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Hiển thị{" "}
                  <span className="font-semibold">
                    {myAssignedRequests.length > 0
                      ? myAssignedCurrentPage * pageSize + 1
                      : 0}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold">
                    {Math.min(
                      (myAssignedCurrentPage + 1) * pageSize,
                      myAssignedTotalElements
                    )}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-semibold">
                    {myAssignedTotalElements}
                  </span>{" "}
                  yêu cầu
                </div>
                <Pagination
                  currentPage={myAssignedCurrentPage + 1}
                  totalPages={myAssignedTotalPages}
                  onPageChange={(page) => setMyAssignedCurrentPage(page - 1)}
                  maxVisiblePages={5}
                  size="md"
                />
              </div>
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
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      // Validate status transition
                      if (
                        selectedRequest &&
                        !canTransitionStatus(selectedRequest.status, newStatus)
                      ) {
                        setToast({
                          type: "error",
                          message:
                            "Bạn chỉ có thể tiến các bước tiến trình, không thể lùi lại trạng thái",
                        });
                        return;
                      }
                      setUpdateForm({ ...updateForm, status: newStatus });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={
                      selectedRequest &&
                      isFinalStatus(selectedRequest.status) &&
                      !isAdmin
                    }
                  >
                    <option value="PENDING">Đang chờ</option>
                    <option value="ACCEPTED">Đã chấp nhận</option>
                    <option value="IN_PROGRESS">Đang xử lý</option>
                    <option value="COMPLETED">Đã hoàn thành</option>
                    <option value="REJECTED">Đã từ chối</option>
                  </select>
                  {selectedRequest &&
                    !canTransitionStatus(
                      selectedRequest.status,
                      updateForm.status
                    ) &&
                    !isAdmin && (
                      <p className="text-xs text-red-600 mt-1">
                        Bạn chỉ có thể tiến các bước tiến trình
                      </p>
                    )}
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
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => {
                      const value = e.target.value;
                      const validation = validateAppointmentDate(value);
                      setAppointmentDateError(
                        validation.valid ? "" : validation.message
                      );
                      setUpdateForm({
                        ...updateForm,
                        appointmentDate: value,
                      });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      appointmentDateError
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {appointmentDateError && (
                    <p className="mt-1 text-xs text-red-600">
                      {appointmentDateError}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Giờ làm việc: 8:00 - 17:00. Không được chọn thời gian trong
                    quá khứ.
                  </p>
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

      {/* Confirmation Modal */}
      {showConfirmModal && pendingUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold text-gray-900">
                  Xác nhận thay đổi trạng thái
                </h2>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Bạn có chắc chắn muốn{" "}
                  <span className="font-semibold">
                    {pendingUpdate.updateData.status === "COMPLETED"
                      ? "hoàn thành"
                      : "từ chối"}
                  </span>{" "}
                  yêu cầu này không?
                </p>
                <p className="text-sm text-gray-500">
                  Sau khi xác nhận, yêu cầu sẽ không thể chỉnh sửa được nữa.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setPendingUpdate(null);
                    setShowUpdateModal(true);
                  }}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmUpdate}
                  className={`px-6 py-2 text-white rounded-lg font-medium transition-colors ${
                    pendingUpdate.updateData.status === "COMPLETED"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Xác nhận
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
