import { ArrowDownRight, ArrowUpRight, Award, DollarSign, Package, TrendingUp } from 'lucide-react';
import React from 'react'

export default function CardRevenue({dataSummary}) {
      // Dữ liệu thống kê tổng quan
  const summaryStats = [
    {
      title: "Doanh thu tổng",
      value: `${dataSummary?.totalRevenue}`,
      subValue: "Doanh thu tổng",
      icon: DollarSign,
      gradient: "from-blue-500 to-cyan-500",
      comparison: "so với tháng trước",
    },
    {
      title: "Số đơn hàng",
      value: dataSummary?.totalOrders,
      subValue: "đơn hoàn tất",
      icon: Package,
      gradient: "from-emerald-500 to-green-500",
      comparison: "so với tháng trước",
    },
    {
      title: "Lợi nhuận",
      value: dataSummary?.totalProfit,
      subValue: "Lợi nhuận",
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
      comparison: "so với tháng trước",
    },
    {
      title: "Sản phẩm bán nhiều",
      value: dataSummary?.bestSellerName,
      subValue: dataSummary?.bestSellerUnits,
      icon: Award,
      gradient: "from-orange-500 to-amber-500",
      comparison: "so với tháng trước",
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {summaryStats.map((stat, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${stat?.gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-white/25 p-3 rounded-xl backdrop-blur-sm">
                  <stat.icon size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-3xl font-bold mb-1 text-center">{stat.value}</h3>
              </div>
              <p className="text-white/90 text-md font-medium mb-2 text-center">
                {stat.subValue}
              </p>
            </div>
          ))}
        </div>
  )
}
