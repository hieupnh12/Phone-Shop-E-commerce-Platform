import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Loading from '../../../../../components/common/Loading';

export default function Chart( {data7Day, isLoading} ) {
  if (isLoading) return <Loading type='dots'/>
  return (
    <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-lg font-bold text-gray-800">
        Doanh thu theo thời gian
      </h3>
      <p className="text-sm text-gray-600">
        Biểu đồ xu hướng doanh thu, chi phí và lợi nhuận (triệu VNĐ)
      </p>
    </div>
    {/* Legend */}
    <div className="flex gap-2">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        <span className="text-xs text-gray-600">Doanh thu</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
        <span className="text-xs text-gray-600">Chi phí</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
        <span className="text-xs text-gray-600">Lợi nhuận</span>
      </div>
    </div>
  </div>

  {/* Chart */}
  <div className="h-72">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data7Day} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorBenefit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "12px" }} />
        <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        />

        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenue)" />
        <Area type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorCost)" />
        <Area type="monotone" dataKey="benefit" stroke="#f97316" strokeWidth={2} fill="url(#colorBenefit)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
</div>

  )
}
