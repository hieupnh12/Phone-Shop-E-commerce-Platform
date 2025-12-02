import React, { useState } from "react";
import { Eye, X } from "lucide-react";
import orderService from "../../../../../services/orderService";
import Loading from "../../../../../components/common/Loading";
import api from "../../../../../services/api";

export default function TableRevenue({
  data,
  filters,
  goToPage,
  isLoading,
  isError,
}) {
  const { content, totalPages, number: currentPage, first, last } = data;
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      "Hoàn tất": "bg-green-100 text-green-700",
      "Đang giao": "bg-blue-100 text-blue-700",
      "Đã xác nhận": "bg-purple-100 text-purple-700",
      "Chờ xử lý": "bg-amber-100 text-amber-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };
  // Dữ liệu bảng chi tiết
  const orderDetails = data?.content ?? [];
  console.log("dataaa", data);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleViewOrder = async (orderId) => {
    try {
      setIsLoadingDetail(true);
      setShowModal(true);
      setSelectedOrder(orderId);

      // Fetch order detail
      const [orderResponse, paymentTransactions] = await Promise.all([
        orderService.getById(orderId).catch(() => null),
        api
          .get(`/payment/transaction/order/${orderId}`)
          .then((res) => res.data?.result || [])
          .catch(() => []),
      ]);

      if (orderResponse) {
        // Determine payment method
        let paymentMethod = "COD";
        if (paymentTransactions && paymentTransactions.length > 0) {
          const transaction = paymentTransactions[0];
          const transactionCode = transaction?.transactionCode || "";
          const paymentMethodType =
            transaction?.paymentMethod?.paymentMethodType || "";

          if (transactionCode.startsWith("PAYOS-")) {
            paymentMethod = "Payment (PayOS)";
          } else if (transactionCode.startsWith("CODE-")) {
            paymentMethod = "COD";
          } else {
            paymentMethod =
              paymentMethodType === "bank" ? "Payment (PayOS)" : "COD";
          }
        }

        setOrderDetail({
          ...orderResponse,
          paymentMethod,
        });
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setOrderDetail(null);
    setSelectedOrder(null);
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Chi tiết đơn hàng
            </h3>
            <p className="text-sm text-gray-600">
              Bảng dữ liệu chi tiết các đơn hàng
            </p>
          </div>
          <div className="text-sm text-gray-600">
            Hiển thị{" "}
            <span className="font-semibold text-gray-800">
              {data?.numberOfElements || 0}
            </span>{" "}
            trên{" "}
            <span className="font-semibold text-gray-800">
              {data?.totalElements || 0}
            </span>{" "}
            đơn
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Mã đơn
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Ngày đặt
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                SL
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Giá nhập
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Doanh thu
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Lợi nhuận
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Kênh
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orderDetails.map((order, idx) => (
              <tr
                key={idx}
                className="hover:bg-blue-50/50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-blue-600">
                    {order.orderId}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700">{order.date}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-800">
                    {order.product}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-semibold text-gray-700">
                    {order.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-gray-700">
                    {formatCurrency(order.importPrice)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-bold text-blue-600">
                    {formatCurrency(order.revenue)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-bold text-green-600">
                    {formatCurrency(order.profit)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-xs font-medium text-gray-600">
                    {order.paymentMethod || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewOrder(order.orderId);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    <Eye size={16} />
                    
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800">
                Order #{selectedOrder}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <Loading type="spinner" />
                </div>
              ) : orderDetail ? (
                <>
                  {/* Customer Information */}
                  <div className="mb-6 space-y-3">
                    <div>
                      <span className="text-sm font-semibold text-gray-700">
                        Khách hàng:
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        {orderDetail.customerName || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-700">
                        Số điện thoại:
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        {orderDetail.customerPhone || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-700">
                        Địa chỉ:
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        {orderDetail.customerAddress || "N/A"}
                      </span>
                    </div>
                    {orderDetail.note && (
                      <div>
                        <span className="text-sm font-semibold text-gray-700">
                          Ghi chú:
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          {orderDetail.note}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product List */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Danh sách sản phẩm
                    </h3>
                    <div className="space-y-3">
                      {orderDetail.orderDetails &&
                      orderDetail.orderDetails.length > 0 ? (
                        orderDetail.orderDetails.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <img
                              src={
                                item.productImage || "/placeholder-product.png"
                              }
                              alt={item.productName}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">
                                {item.productName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                x{item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-800">
                                {formatCurrency(
                                  item.subtotal ||
                                    item.unitPriceAfter * item.quantity
                                )}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          Không có sản phẩm
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="mb-6 border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">
                        Tổng tiền:
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(orderDetail.totalAmount || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      Phương thức thanh toán:
                    </span>
                    <div className="mt-2">
                      <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {orderDetail.paymentMethod || "COD"}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    Không thể tải thông tin đơn hàng
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="p-6 border-t border-gray-200 flex items-center justify-between">
        {/* Prev */}
        <button
          disabled={filters.page === 0}
          onClick={() => goToPage(filters.page - 1)}
          className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors 
      ${
        first
          ? "text-gray-300 border-gray-200"
          : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      }`}
        >
          Trang trước
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
          ${
            i === currentPage
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Next */}
        <button
          disabled={last}
          onClick={() => goToPage(filters.page + 1)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
      ${
        last
          ? "bg-gray-200 text-gray-400"
          : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg"
      }`}
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}
