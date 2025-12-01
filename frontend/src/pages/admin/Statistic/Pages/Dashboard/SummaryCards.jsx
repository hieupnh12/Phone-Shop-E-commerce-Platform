import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import React from 'react'
import Loading from '../../../../../components/common/Loading';

export default function SummaryCards({dataCard, isLoadingCard, errorCard}) {
  if (isLoadingCard) {
    return <Loading type='dots'/>
  }
  const cards = [
    { title: "Doanh Thu Tuần này", value: `${Number(dataCard?.revenue.value || 0).toLocaleString("vi-VN")} đ`, icon: DollarSign, color: 'bg-blue-500', change: dataCard?.revenue.change },
    { title: 'Sản Phẩm Tuần', value: `${dataCard?.topProduct.value}`, icon: TrendingUp, color: 'bg-purple-500', change: dataCard?.topProduct.change },
    { title: 'Lợi nhuận tuần', value: `${Number(dataCard?.profit?.value || 0).toLocaleString("vi-VN")} đ`, icon: DollarSign, color: 'bg-pink-500', textColor: 'text-red-500', change: dataCard?.profit.change },
    { title: 'Đặt Hàng Tuần', value: dataCard?.orderCount.value, icon: ShoppingCart, color: 'bg-orange-500', change: dataCard?.orderCount.change },
  ];

  if (errorCard) {
    <Loading message={errorCard.message}/>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className={`${card.color} p-3 rounded-xl`}>
              <card.icon className="text-white" size={24} />
            </div>
            <span className="text-sm text-green-600 font-medium">{card.change}</span>
          </div>
          <h3 className={`text-2xl font-bold mb-1 ${card?.textColor}`}>{card.value}</h3>
          <p className="text-sm text-gray-600">{card.title}</p>
        </div>
      ))}
    </div>
  )
}
