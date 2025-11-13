import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import React from 'react'

export default function SummaryCards() {
  const cards = [
    { title: "Today's Revenue", value: '$12,450', icon: DollarSign, color: 'bg-blue-500', change: '+12.5%' },
    { title: 'Top-Selling Product', value: 'iPhone 15 Pro', icon: TrendingUp, color: 'bg-purple-500', change: '245 sold' },
    { title: 'Monthly Profit', value: '$68,240', icon: DollarSign, color: 'bg-pink-500', change: '+8.2%' },
    { title: 'Total Orders', value: '1,247', icon: ShoppingCart, color: 'bg-orange-500', change: '+23.1%' },
  ];
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
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{card.value}</h3>
          <p className="text-sm text-gray-600">{card.title}</p>
        </div>
      ))}
    </div>
  )
}
