import React, { useCallback, useEffect, useMemo, useState } from "react";
import orderService from "../../../services/orderService";
import { Eye, X, RefreshCw, Search, Calendar, CheckCircle } from "lucide-react";
import Toast from "../../../components/common/Toast";

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
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [phoneQuery, setPhoneQuery] = useState("");
  // Date filter states
  const [dateSort, setDateSort] = useState("newest");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [confirmComplete, setConfirmComplete] = useState(null); // { orderId, orderNumber }

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  // Load orders
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const data = await orderService.getAll();
      setOrders(data.result || []);
    } catch (err) {
      console.error("Fetch orders failed:", err);
      showToast("Không thể tải danh sách đơn hàng!", "error");
    } finally {
      setLoadingOrders(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
        !phoneQuery ||
        o.customerPhone
          ?.toLowerCase()
          .includes(phoneQuery.trim().toLowerCase());

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
  }, [orders, filter, phoneQuery, dateSort, startDate, endDate]);

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
      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>

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
            onClick={fetchOrders}
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
          Hiển thị <strong>{filteredOrders.length}</strong> đơn hàng
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
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!currentStatus) return STATUS_OPTIONS;

    const validOptions = STATUS_OPTIONS.filter((option) =>
      canChangeStatus(currentStatus, option.value)
    );

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
      const data = await orderService.getById(id);
      if (data) {
        setOrder(data);
        setStatus(data.status || "PENDING");
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

      <button
        onClick={updateStatus}
        disabled={loading}
        className="w-full mt-5 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Đang cập nhật..." : "Cập nhật trạng thái"}
      </button>
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
