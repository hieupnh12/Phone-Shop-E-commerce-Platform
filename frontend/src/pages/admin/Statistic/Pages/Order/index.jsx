import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Search, TrendingUp, Package, CheckCircle, Truck, XCircle, Clock, BarChart3, Activity, Settings2 } from 'lucide-react';
import OrderTable from './OrderTable';

export default function OrderStatistic() {
  const [chartType, setChartType] = useState('line');
  const [dateFilter, setDateFilter] = useState('month');
  const [orderStatus, setOrderStatus] = useState('all');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchStaff, setSearchStaff] = useState('');
  const [startDate, setStartDate] = useState('2024-10-01');
  const [endDate, setEndDate] = useState('2024-10-31');

  // Dữ liệu mẫu cho biểu đồ
  const chartData = [
    { date: '01/10', orders: 45, revenue: 125000 },
    { date: '05/10', orders: 52, revenue: 142000 },
    { date: '10/10', orders: 48, revenue: 138000 },
    { date: '15/10', orders: 61, revenue: 165000 },
    { date: '20/10', orders: 55, revenue: 151000 },
    { date: '25/10', orders: 68, revenue: 178000 },
    { date: '31/10', orders: 72, revenue: 195000 },
  ];

  const orderStats = [
    { label: 'Tổng đơn hàng', value: '401', icon: Package, color: 'from-cyan-500 to-blue-500', percent: '+12.5%' },
    { label: 'Đơn mới', value: '89', icon: Clock, color: 'from-amber-400 to-orange-500', percent: '+8.3%' },
    { label: 'Đang giao', value: '156', icon: Truck, color: 'from-blue-400 to-cyan-500', percent: '+15.2%' },
    { label: 'Hoàn tất', value: '142', icon: CheckCircle, color: 'from-emerald-400 to-green-500', percent: '+23.1%' },
    { label: 'Đã hủy', value: '14', icon: XCircle, color: 'from-rose-400 to-red-500', percent: '-5.2%' },
  ];

  const quickFilters = [
    { label: 'Hôm nay', value: 'day' },
    { label: 'Tuần này', value: 'week' },
    { label: 'Tháng này', value: 'month' },
  ];

  const statusFilters = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Đơn mới', value: 'new' },
    { label: 'Đã xác nhận', value: 'confirmed' },
    { label: 'Đang giao', value: 'shipping' },
    { label: 'Hoàn tất', value: 'completed' },
    { label: 'Đã hủy', value: 'cancelled' },
  ];

  const orderDetails = [
    {
      id: 'DH001',
      date: '31/10/2024',
      product: 'iPhone 15 Pro Max 256GB',
      quantity: 2,
      price: 29990000,
      revenue: 59980000,
      profit: 8997000,
      status: 'Hoàn tất',
      channel: 'Website'
    },
    {
      id: 'DH002',
      date: '31/10/2024',
      product: 'Samsung S24 Ultra 512GB',
      quantity: 1,
      price: 27990000,
      revenue: 27990000,
      profit: 4198500,
      status: 'Hoàn tất',
      channel: 'Mobile App'
    },
    {
      id: 'DH003',
      date: '30/10/2024',
      product: 'iPhone 15 Pro 128GB',
      quantity: 3,
      price: 25990000,
      revenue: 77970000,
      profit: 11695500,
      status: 'Hoàn tất',
      channel: 'Cửa hàng'
    },
    {
      id: 'DH004',
      date: '30/10/2024',
      product: 'Xiaomi 14 Pro 256GB',
      quantity: 1,
      price: 18990000,
      revenue: 18990000,
      profit: 2848500,
      status: 'Đang giao',
      channel: 'Website'
    },
    {
      id: 'DH005',
      date: '29/10/2024',
      product: 'OPPO Find X7 Ultra',
      quantity: 2,
      price: 22990000,
      revenue: 45980000,
      profit: 6897000,
      status: 'Hoàn tất',
      channel: 'Mobile App'
    },
  ];
// bg-gradient-to-br from-slate-50 to-blue-50 p-6
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center md:text-left bg-white/80 rounded-2xl shadow-lg p-4">
            <label className="flex items-center gap-2 text-gray-700 font-medium text-2xl">
              <Settings2 className="w-5 h-5 text-blue-500" />
              Thống kê đơn hàng
            </label>
          <p className="text-gray-600">Quản lý và theo dõi đơn hàng điện thoại</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
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

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Date & Quick Filters */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-cyan-600" size={20} />
                <h3 className="font-semibold text-gray-800">Lọc theo thời gian</h3>
              </div>
              
              {/* Quick Filters */}
              <div className="flex gap-2">
                {quickFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setDateFilter(filter.value)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      dateFilter === filter.value
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium mb-1 block">Từ ngày</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium mb-1 block">Đến ngày</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Status & Search */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Package className="text-cyan-600" size={20} />
                <h3 className="font-semibold text-gray-800">Lọc theo trạng thái</h3>
              </div>

              {/* Status Filter */}
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-medium text-sm"
              >
                {statusFilters.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              {/* Search Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Tìm theo email khách hàng..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Tìm theo tài khoản nhân viên..."
                    value={searchStaff}
                    onChange={(e) => setSearchStaff(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Biểu đồ thống kê đơn hàng</h2>
              <p className="text-sm text-gray-600">
                Từ {startDate} đến {endDate} • <span className="font-semibold text-cyan-600">Tổng: 401 đơn</span>
              </p>
            </div>
            
            {/* Chart Type Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded-md transition-all ${
                  chartType === 'line'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title="Biểu đồ đường"
              >
                <Activity size={20} />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded-md transition-all ${
                  chartType === 'bar'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title="Biểu đồ cột"
              >
                <BarChart3 size={20} />
              </button>
            </div>
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Số đơn hàng', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#6b7280' } }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="url(#colorGradient)" 
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Số đơn hàng', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#6b7280' } }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="url(#barGradient)" 
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Chart Legend */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
              <span className="text-sm text-gray-600 font-medium">Số lượng đơn hàng</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={16} />
              <span className="text-sm text-gray-600">Xu hướng tăng trưởng</span>
            </div>
          </div>
        </div>
        <div className=''>
          <OrderTable orderDetails={orderDetails}/>
        </div>
      </div>
    </div>
  );
}