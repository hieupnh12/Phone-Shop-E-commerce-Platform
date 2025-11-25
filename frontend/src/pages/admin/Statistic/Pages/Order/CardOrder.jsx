import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react';
import React from 'react'
import Loading from '../../../../../components/common/Loading';

export default function CardOrder({dataSumOrder, isLoading}) {
      const orderStats = [
    { label: 'Chờ xử lý', value: dataSumOrder?.pendingOrders, icon: Package, color: 'from-cyan-500 to-blue-500', percent: '' },
    { label: 'Đã thanh toán', value: dataSumOrder?.paidOrders, icon: Clock, color: 'from-amber-400 to-orange-500', percent: '' },
    { label: 'Đã gửi', value: dataSumOrder?.shippedOrders, icon: Truck, color: 'from-blue-400 to-cyan-500', percent: '' },
    { label: 'Đang giao', value: dataSumOrder?.deliveredOrders, icon: CheckCircle, color: 'from-emerald-400 to-green-500', percent: '' },
    { label: 'Đã hủy', value: dataSumOrder?.canceledOrders, icon: XCircle, color: 'from-rose-400 to-red-500', percent: '' },
    { label: 'Trả lại', value: dataSumOrder?.returnedOrders, icon: XCircle, color: 'from-rose-400 to-red-500', percent: '' },
  ];
  if (isLoading) {
    return <Loading type='dots' message='đang tải'/>
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {orderStats.map((stat, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="bg-white/25 p-2.5 rounded-xl backdrop-blur-sm">
                  <stat.icon size={22} strokeWidth={2.5} />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  stat.percent.startsWith('+') ? 'bg-white/30' : 'bg-black/20'
                }`}>
                  {stat.percent}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-white/90 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
  )
}
