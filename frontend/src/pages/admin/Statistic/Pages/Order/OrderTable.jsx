import React from 'react'

export default function OrderTable( {orderDetails} ) {
    const getStatusColor = (status) => {
    const colors = {
      'Hoàn tất': 'bg-green-100 text-green-700',
      'Đang giao': 'bg-blue-100 text-blue-700',
      'Đã xác nhận': 'bg-purple-100 text-purple-700',
      'Chờ xử lý': 'bg-amber-100 text-amber-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };
  
  return (
    <div>
        {/* Detailed Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Chi tiết đơn hàng</h3>
                <p className="text-sm text-gray-600">Bảng dữ liệu chi tiết các đơn hàng</p>
              </div>
              <div className="text-sm text-gray-600">
                Hiển thị <span className="font-semibold text-gray-800">5</span> trên <span className="font-semibold text-gray-800">1,284</span> đơn
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mã đơn</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ngày đặt</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nhân viên</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Kênh</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orderDetails.map((order, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-blue-600">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{order.date}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-800">{order.product}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-800">{order.product}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-gray-700">{order.quantity}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-medium text-gray-600">{order.channel}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
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
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Trang trước
            </button>
            <div className="flex items-center gap-2">
              {[1, 2, 3, '...', 26].map((page, idx) => (
                <button
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    page === 1
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all">
              Trang sau
            </button>
          </div>
        </div>
    </div>
  )
}
