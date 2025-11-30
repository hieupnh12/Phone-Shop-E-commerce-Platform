import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import orderService from "../../../services/orderService";
import { Eye, X, RefreshCw, Search, Calendar, CheckCircle, Store, Plus } from "lucide-react";
import Toast from "../../../components/common/Toast";
import useDebounce from "../../../contexts/useDebounce";
import api from "../../../services/api";
import { usePermission, PERMISSIONS } from "../../../hooks/usePermission";

const STATUS_CONFIG = {
  PENDING: {
    label: "PENDING",
    badge: "bg-yellow-300 text-yellow-900",
    order: 0,
  },
  PAID: { label: "PAID", badge: "bg-indigo-300 text-indigo-900", order: 1 },
  SHIPPED: { label: "SHIPPING", badge: "bg-blue-300 text-blue-900", order: 2 },
  DELIVERED: {
    label: "DELIVERED",
    badge: "bg-green-300 text-green-900",
    order: 3,
  },
  CANCELED: { label: "CANCELED", badge: "bg-red-300 text-red-900", order: -1 }, // Special: can be set anytime but can't go back
  RETURNED: {
    label: "RETURNED",
    badge: "bg-orange-300 text-orange-900",
    order: -1,
  }, // Special: only after SHIPPED/DELIVERED
  COMPLETED: {
    label: "COMPLETED",
    badge: "bg-purple-300 text-purple-900",
    order: -1,
  }, // Special: only after RETURNED
};

const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, meta]) => ({
  value,
  label: meta.label,
  badge: meta.badge,
}));

const FILTER_OPTIONS = [{ value: "ALL", label: "ALL" }, ...STATUS_OPTIONS];

const DATE_SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
];

export default function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermission();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [phoneQuery, setPhoneQuery] = useState("");
  const debouncedPhoneQuery = useDebounce(phoneQuery, 300); // Debounce search để tối ưu performance
  // Date filter states
  const [dateSort, setDateSort] = useState("newest");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [confirmComplete, setConfirmComplete] = useState(null); // { orderId, orderNumber }
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20); // 15-20 orders per page
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  // Load orders với pagination
  const fetchOrders = useCallback(async (showLoading = true, page = currentPage) => {
    if (showLoading) {
      setLoadingOrders(true);
    }
    try {
      const sortBy = dateSort === "newest" ? "createDatetime,desc" : "createDatetime,asc";
      const data = await orderService.getAll(page, pageSize, sortBy);
      
      // Handle Page response structure
      const pageData = data?.result || data;
      if (pageData?.content) {
        // Paginated response
        setOrders(Array.isArray(pageData.content) ? pageData.content : []);
        setTotalPages(pageData.totalPages || 0);
        setTotalElements(pageData.totalElements || 0);
      } else {
        // Fallback: non-paginated response
        const ordersList = Array.isArray(pageData) ? pageData : [];
        setOrders(ordersList);
        setTotalPages(Math.ceil(ordersList.length / pageSize));
        setTotalElements(ordersList.length);
      }
    } catch (err) {
      console.error("Fetch orders failed:", err);
      // Hiển thị message từ backend nếu có, nếu không thì dùng message mặc định
      const errorMessage = err?.message || err?.response?.data?.message || "Không thể tải danh sách đơn hàng!";
      showToast(errorMessage, "error");
      
      // Nếu là lỗi 403, set orders về empty array
      if (err?.response?.status === 403) {
        setOrders([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } finally {
      if (showLoading) {
        setLoadingOrders(false);
      }
    }
  }, [showToast, currentPage, pageSize, dateSort]);

  // Reset về trang đầu khi filter thay đổi
  useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, debouncedPhoneQuery, startDate, endDate]);

  // Load orders khi component mount hoặc khi page/sort thay đổi
  useEffect(() => {
    fetchOrders(true, currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, dateSort]); // Reload khi page hoặc sort thay đổi

  // Tự động refresh khi navigate từ trang create order
  useEffect(() => {
    if (location.state?.refresh) {
      setCurrentPage(0); // Reset về trang đầu tiên
      fetchOrders(true, 0);
      // Clear state để tránh refresh lại
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.refresh]); // Chỉ phụ thuộc vào refresh flag

  // Listen for order created event
  useEffect(() => {
    const handleOrderCreated = (event) => {
      // Refresh orders khi có order mới được tạo (không hiển thị loading)
      setLoadingOrders(false);
      fetchOrders(false, 0); // Reset về trang đầu tiên khi có order mới
      if (event.detail?.orderId) {
        showToast(`Đơn hàng #${event.detail.orderId} đã được tạo thành công!`, "success");
      }
    };

    window.addEventListener('orderCreated', handleOrderCreated);
    return () => {
      window.removeEventListener('orderCreated', handleOrderCreated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ setup listener 1 lần

  const handleOrderStatusUpdated = useCallback((updatedOrder) => {
    if (!updatedOrder?.orderId) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === updatedOrder.orderId
          ? { ...o, status: updatedOrder.status }
          : o
      )
    );
  }, []);

  const filteredOrders = useMemo(() => {
    let filtered = orders.filter((o) => {
      const matchStatus = filter === "ALL" || o.status === filter;
      const matchPhone =
        !debouncedPhoneQuery ||
        o.customerPhone
          ?.toLowerCase()
          .includes(debouncedPhoneQuery.trim().toLowerCase());

      // Date range filter
      let matchDate = true;
      if (startDate || endDate) {
        const orderDate = o.createDatetime ? new Date(o.createDatetime) : null;
        if (orderDate) {
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (orderDate < start) matchDate = false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (orderDate > end) matchDate = false;
          }
        }
      }

      return matchStatus && matchPhone && matchDate;
    });

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = a.createDatetime ? new Date(a.createDatetime) : new Date(0);
      const dateB = b.createDatetime ? new Date(b.createDatetime) : new Date(0);
      return dateSort === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [orders, filter, debouncedPhoneQuery, dateSort, startDate, endDate]);

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  const skeletonRows = useMemo(
    () =>
      Array.from({ length: 5 }, (_, idx) => (
        <tr key={`skeleton-${idx}`} className="animate-pulse">
          {[...Array(6)].map((__, cellIdx) => (
            <td key={cellIdx} className="p-3 border">
              <div className="h-4 bg-gray-200 rounded w-full" />
            </td>
          ))}
        </tr>
      )),
    []
  );

  return (
    <div className="p-6">
      {/* Title with Create Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
        {hasPermission(PERMISSIONS.ORDER_CREATE_ALL) && (
          <button
            onClick={() => navigate("/admin/orders/create-in-store")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Store size={18} />
            Tạo đơn tại cửa hàng
          </button>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-4 mb-5">
        {/* Phone Search */}
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={phoneQuery}
            onChange={(e) => setPhoneQuery(e.target.value)}
            placeholder="Tìm đơn theo số điện thoại..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-3 flex-wrap">
            {FILTER_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  filter === value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setCurrentPage(0);
              fetchOrders(true, 0);
            }}
            disabled={loadingOrders}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loadingOrders ? "animate-spin" : ""}
            />
            Làm mới
          </button>
        </div>

        {/* Date Filter Section */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} className="text-gray-600" />
            <h3 className="font-semibold text-gray-700">Lọc theo ngày</h3>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            {/* Date Sort */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sắp xếp
              </label>
              <select
                value={dateSort}
                onChange={(e) => setDateSort(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DATE_SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Date */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Clear Date Filter */}
            {(startDate || endDate) && (
              <button
                onClick={clearDateFilter}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Xóa lọc ngày
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Tổng số: <strong>{totalElements}</strong> đơn hàng
          {totalPages > 1 && ` (Trang ${currentPage + 1}/${totalPages})`}
        </div>
      </div>
      {/* Orders table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Số điện thoại</th>
              <th className="p-3 border">Ngày đặt</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loadingOrders
              ? skeletonRows
              : filteredOrders.map((o) => (
                  <tr key={o.orderId} className="hover:bg-gray-50">
                    <td className="p-3 border">{o.orderId}</td>
                    <td className="p-3 border">{o.customerPhone || "N/A"}</td>
                    <td className="p-3 border">
                      {o.createDatetime
                        ? new Date(o.createDatetime).toLocaleString("vi-VN")
                        : "—"}
                    </td>
                    <td className="p-3 border">
                      {o.totalAmount?.toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="p-3 border">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          STATUS_CONFIG[o.status]?.badge ||
                          "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {STATUS_CONFIG[o.status]?.label ||
                          o.status ||
                          "UNKNOWN"}
                      </span>
                    </td>

                    <td className="p-3 border text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(o.orderId)}
                          className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        {o.status === "RETURNED" && (
                          <button
                            onClick={() => setConfirmComplete({ orderId: o.orderId, orderNumber: o.orderId })}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                            title="Đánh dấu đã hoàn thành"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-center gap-4 mt-6 px-4 py-3 bg-white rounded-lg border">
          <div className="text-sm text-gray-600">
            Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} trong tổng số {totalElements} đơn hàng
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (currentPage > 0) {
                  setCurrentPage(currentPage - 1);
                }
              }}
              disabled={currentPage === 0 || loadingOrders}
              className="px-3 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage < 3) {
                  pageNum = i;
                } else if (currentPage > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loadingOrders}
                    className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white border-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                if (currentPage < totalPages - 1) {
                  setCurrentPage(currentPage + 1);
                }
              }}
              disabled={currentPage >= totalPages - 1 || loadingOrders}
              className="px-3 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Panel */}
      {selectedOrder && (
        <OrderDetailPanel
          id={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={handleOrderStatusUpdated}
          notify={showToast}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirmation Modal for Complete Order */}
      {confirmComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Xác nhận đánh dấu đã hoàn thành</h3>
            <p className="text-gray-700 mb-6">
              Bạn có chắc muốn đánh dấu đơn hàng #{confirmComplete.orderNumber} là đã hoàn thành?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmComplete(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  try {
                    await orderService.updateStatus(confirmComplete.orderId, "COMPLETED");
                    showToast("Đã đánh dấu đơn hàng là đã hoàn thành!", "success");
                    setConfirmComplete(null);
                    fetchOrders();
                  } catch (err) {
                    console.error("Update status failed:", err);
                    showToast("Cập nhật trạng thái thất bại!", "error");
                  }
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===============================
// 🔥 SIDEBAR ORDER DETAIL PANEL
// ===============================
function OrderDetailPanel({ id, onClose, onUpdated, notify }) {
  const { hasPermission } = usePermission();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isCOD, setIsCOD] = useState(true); // Flag để biết có phải COD không

  // Hàm kiểm tra xem có thể chuyển từ trạng thái hiện tại sang trạng thái mới không
  const canChangeStatus = (currentStatus, newStatus) => {
    if (!currentStatus || !newStatus) return true;
    if (currentStatus === newStatus) return true; // Giữ nguyên trạng thái

    const currentConfig = STATUS_CONFIG[currentStatus];
    const newConfig = STATUS_CONFIG[newStatus];

    if (!currentConfig || !newConfig) return true; // Cho phép nếu không tìm thấy config

    // Nếu đã CANCELED hoặc COMPLETED, không thể quay lại trạng thái khác
    if (currentStatus === "CANCELED" || currentStatus === "COMPLETED") {
      return false;
    }

    // Nếu đã RETURNED, chỉ cho phép chuyển sang COMPLETED
    if (currentStatus === "RETURNED") {
      return newStatus === "COMPLETED";
    }

    // Nếu muốn đặt CANCELED, luôn cho phép (trừ khi đã DELIVERED)
    if (newStatus === "CANCELED") {
      return currentStatus !== "DELIVERED";
    }

    // Nếu muốn đặt RETURNED, chỉ cho phép khi đã SHIPPED hoặc DELIVERED
    if (newStatus === "RETURNED") {
      return currentStatus === "SHIPPED" || currentStatus === "DELIVERED";
    }

    // Nếu muốn đặt COMPLETED, chỉ cho phép khi đã RETURNED
    if (newStatus === "COMPLETED") {
      return currentStatus === "RETURNED";
    }

    // Kiểm tra thứ tự: chỉ cho phép tiến lên, không cho lùi lại
    if (currentConfig.order !== -1 && newConfig.order !== -1) {
      return newConfig.order > currentConfig.order;
    }

    return true;
  };

  // Lấy danh sách các trạng thái hợp lệ có thể chuyển đến từ trạng thái hiện tại
  const getValidStatusOptions = (currentStatus) => {
    if (!currentStatus) {
      // Nếu là COD, filter bỏ PAID
      if (isCOD) {
        return STATUS_OPTIONS.filter(option => option.value !== "PAID");
      }
      return STATUS_OPTIONS;
    }

    const validOptions = STATUS_OPTIONS.filter((option) =>
      canChangeStatus(currentStatus, option.value)
    );

    // Nếu là COD, filter bỏ PAID khỏi danh sách options
    if (isCOD) {
      const filteredOptions = validOptions.filter(option => option.value !== "PAID");
      
      // Đảm bảo trạng thái hiện tại luôn có trong danh sách (để hiển thị)
      const currentOption = STATUS_OPTIONS.find(
        (opt) => opt.value === currentStatus
      );
      if (currentOption) {
        const alreadyIncluded = filteredOptions.find(
          (opt) => opt.value === currentStatus
        );
        if (!alreadyIncluded) {
          // Thêm trạng thái hiện tại vào đầu danh sách
          filteredOptions.unshift(currentOption);
        }
      } else {
        // Nếu trạng thái hiện tại không có trong STATUS_OPTIONS, tạo một option tạm
        const tempOption = {
          value: currentStatus,
          label: STATUS_CONFIG[currentStatus]?.label || currentStatus,
          badge:
            STATUS_CONFIG[currentStatus]?.badge || "bg-gray-200 text-gray-700",
        };
        filteredOptions.unshift(tempOption);
      }

      return filteredOptions;
    }

    // Nếu không phải COD, giữ nguyên logic cũ
    // Đảm bảo trạng thái hiện tại luôn có trong danh sách (để hiển thị)
    const currentOption = STATUS_OPTIONS.find(
      (opt) => opt.value === currentStatus
    );
    if (currentOption) {
      const alreadyIncluded = validOptions.find(
        (opt) => opt.value === currentStatus
      );
      if (!alreadyIncluded) {
        // Thêm trạng thái hiện tại vào đầu danh sách
        validOptions.unshift(currentOption);
      }
    } else {
      // Nếu trạng thái hiện tại không có trong STATUS_OPTIONS, tạo một option tạm
      const tempOption = {
        value: currentStatus,
        label: STATUS_CONFIG[currentStatus]?.label || currentStatus,
        badge:
          STATUS_CONFIG[currentStatus]?.badge || "bg-gray-200 text-gray-700",
      };
      validOptions.unshift(tempOption);
    }

    return validOptions;
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      // Fetch order và payment transactions song song
      const [orderData, paymentTransactionsResponse] = await Promise.all([
        orderService.getById(id),
        api.get(`/payment/transaction/order/${id}`)
          .then(res => res.data?.result || res.data || [])
          .catch(() => [])
      ]);

      const paymentTransactions = Array.isArray(paymentTransactionsResponse) 
        ? paymentTransactionsResponse 
        : [];

      if (orderData) {
        setOrder(orderData);
        setStatus(orderData.status || "PENDING");

        // Lấy payment method từ transaction
        let paymentMethodValue = "COD"; // Mặc định là COD
        let isCODOrder = true; // Mặc định là COD
        if (paymentTransactions && paymentTransactions.length > 0) {
          const transaction = paymentTransactions[0];
          const transactionCode = transaction?.transactionCode || '';
          const paymentMethodType = transaction?.paymentMethod?.paymentMethodType || '';
          
          // Kiểm tra transactionCode để xác định chính xác
          if (transactionCode.startsWith('PAYOS-')) {
            paymentMethodValue = "Payment (PayOS)";
            isCODOrder = false;
          } else if (transactionCode.startsWith('CODE-')) {
            paymentMethodValue = "COD";
            isCODOrder = true;
          } else {
            // Fallback: kiểm tra paymentMethodType
            if (paymentMethodType === 'bank') {
              paymentMethodValue = "Payment (PayOS)";
              isCODOrder = false;
            } else {
              paymentMethodValue = "COD";
              isCODOrder = true;
            }
          }
        }
        setPaymentMethod(paymentMethodValue);
        setIsCOD(isCODOrder);
      } else {
        notify?.("Không thể tải thông tin đơn hàng!", "error");
      }
    } catch (err) {
      console.error("Fetch order failed:", err);
      notify?.("Không thể tải thông tin đơn hàng!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  // Đồng bộ status với order.status khi order thay đổi
  useEffect(() => {
    if (order?.status) {
      setStatus(order.status);
    }
  }, [order?.status]);

  const updateStatus = async () => {
    // Kiểm tra xem có thể cập nhật trạng thái không
    if (!canChangeStatus(order?.status, status)) {
      notify?.(
        "Không thể cập nhật trạng thái ngược lại! Chỉ có thể cập nhật trạng thái tiến lên.",
        "error"
      );
      return;
    }

    // Kiểm tra trạng thái có thay đổi không
    if (order?.status === status) {
      notify?.("Trạng thái không thay đổi!", "info");
      return;
    }

    try {
      setLoading(true);
      const updated = await orderService.updateStatus(id, status);
      const normalizedOrder =
        updated || (order ? { ...order, status } : { orderId: id, status });

      setOrder((prev) => (prev ? { ...prev, status } : prev));
      notify?.("Cập nhật trạng thái thành công!", "success");
      onUpdated?.(normalizedOrder);
      onClose();
    } catch (err) {
      console.error("Update status failed:", err);
      notify?.("Cập nhật trạng thái thất bại!", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="fixed top-0 right-0 w-[420px] h-full bg-white shadow-xl border-l p-5 z-50 flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="fixed top-0 right-0 w-[420px] h-full bg-white shadow-xl border-l p-5 animate-slideLeft z-50 overflow-y-auto">
      {/* Close Button */}
      <button onClick={onClose} className="absolute top-3 right-3">
        <X size={22} />
      </button>

      <h2 className="text-xl font-bold mb-3">Order #{order.orderId}</h2>

      <div className="text-sm text-gray-700 space-y-2">
        <p>
          <strong>Khách hàng:</strong>{" "}
          {order.customerName || order.customerId || "N/A"}
        </p>
        <p>
          <strong>Số điện thoại:</strong> {order.customerPhone || "N/A"}
        </p>
        <p>
          <strong>Địa chỉ:</strong> {order.customerAddress || "N/A"}
        </p>
        <p>
          <strong>Ghi chú:</strong> {order.note || "Không có"}
        </p>
      </div>

      <h3 className="font-semibold mt-4 mb-2">Danh sách sản phẩm</h3>
      <div className="border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
        {order.orderDetails && order.orderDetails.length > 0 ? (
          order.orderDetails.map((d, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border rounded-lg p-2"
            >
              <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                {d.productImage ? (
                  <img
                    src={d.productImage}
                    alt={d.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{d.productName || "N/A"}</p>
                <p className="text-xs text-gray-500">x{d.quantity || 0}</p>
              </div>
              <p className="font-semibold text-sm">
                {d.unitPriceAfter?.toLocaleString("vi-VN") || "0"} ₫
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">Không có sản phẩm</p>
        )}
      </div>

      <h3 className="font-semibold mt-4 mb-1">Tổng tiền</h3>
      <p className="text-lg font-bold text-blue-600">
        {order.totalAmount.toLocaleString("vi-VN")} ₫
      </p>

      <h3 className="font-semibold mt-4 mb-2">Phương thức thanh toán</h3>
      <p className="text-sm text-gray-700 mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          paymentMethod === "COD" 
            ? "bg-green-100 text-green-800" 
            : "bg-blue-100 text-blue-800"
        }`}>
          {paymentMethod}
        </span>
      </p>

      <h3 className="font-semibold mt-4 mb-2">Trạng thái đơn hàng</h3>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border p-2 rounded-lg w-full"
      >
        {getValidStatusOptions(order?.status).map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {order?.status &&
        status !== order.status &&
        !canChangeStatus(order.status, status) && (
          <p className="text-red-500 text-sm mt-1">
            ⚠️ Không thể cập nhật trạng thái ngược lại!
          </p>
        )}

      {hasPermission(PERMISSIONS.ORDER_UPDATE_STATUS) && (
        <button
          onClick={updateStatus}
          disabled={loading}
          className="w-full mt-5 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang cập nhật..." : "Cập nhật trạng thái"}
        </button>
      )}
    </div>
  );
}

// Animation
const styles = `
@keyframes slideLeft {
 from { transform: translateX(100%); }
 to { transform: translateX(0); }
}
.animate-slideLeft {
 animation: slideLeft 0.25s ease-out;
}
`;
document.head.insertAdjacentHTML("beforeend", `<style>${styles}</style>`);
