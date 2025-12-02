import React, { useState } from "react";

export default function TableRevenue({
  data,
  filters,
  goToPage,
  isLoading,
  isError,
}) {
  const { content, totalPages, number: currentPage, first, last } = data;

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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
