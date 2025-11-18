import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Package, Award, Download, Filter, Calendar, Search, ArrowUpRight, ArrowDownRight, ChevronDown, FileText, FileSpreadsheet } from 'lucide-react';

export default function RevenueStatistic() {
  const [startDate, setStartDate] = useState('2024-10-01');
  const [endDate, setEndDate] = useState('2024-10-31');
  const [category, setCategory] = useState('all');
  const [orderStatus, setOrderStatus] = useState('all');
  const [channel, setChannel] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  const [searchOrder, setSearchOrder] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Dữ liệu thống kê tổng quan
  const summaryStats = [
    {
      title: 'Doanh thu tổng',
      value: '2.4 tỷ',
      subValue: '2,450,000,000 VNĐ',
      change: '+18.2%',
      trend: 'up',
      icon: DollarSign,
      gradient: 'from-blue-500 to-cyan-500',
      comparison: 'so với tháng trước'
    },
    {
      title: 'Số đơn hàng',
      value: '1,284',
      subValue: 'đơn hoàn tất',
      change: '+12.5%',
      trend: 'up',
      icon: Package,
      gradient: 'from-emerald-500 to-green-500',
      comparison: 'so với tháng trước'
    },
    {
      title: 'Lợi nhuận',
      value: '485 triệu',
      subValue: '485,000,000 VNĐ',
      change: '+15.8%',
      trend: 'up',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-500',
      comparison: 'so với tháng trước'
    },
    {
      title: 'Sản phẩm bán chạy',
      value: 'iPhone 15 Pro',
      subValue: '245 máy đã bán',
      change: '+28.3%',
      trend: 'up',
      icon: Award,
      gradient: 'from-orange-500 to-amber-500',
      comparison: 'so với tháng trước'
    },
  ];

  // Dữ liệu biểu đồ doanh thu theo thời gian
  const revenueTimeData = [
    { date: '01/10', revenue: 68, orders: 42 },
    { date: '05/10', revenue: 72, orders: 45 },
    { date: '10/10', revenue: 85, orders: 52 },
    { date: '15/10', revenue: 78, orders: 48 },
    { date: '20/10', revenue: 92, orders: 58 },
    { date: '25/10', revenue: 88, orders: 55 },
    { date: '31/10', revenue: 95, orders: 62 },
  ];

  // Dữ liệu Top 5 sản phẩm
  const topProductsData = [
    { name: 'iPhone 15 Pro Max', revenue: 485, units: 245 },
    { name: 'Samsung S24 Ultra', revenue: 420, units: 210 },
    { name: 'iPhone 15 Pro', revenue: 385, units: 195 },
    { name: 'Xiaomi 14 Pro', revenue: 280, units: 180 },
    { name: 'OPPO Find X7', revenue: 245, units: 165 },
  ];

  // Dữ liệu doanh thu theo kênh
  const channelData = [
    { name: 'Website', value: 45, color: '#06b6d4' },
    { name: 'Mobile App', value: 30, color: '#8b5cf6' },
    { name: 'Cửa hàng', value: 25, color: '#f59e0b' },
  ];

  // Dữ liệu bảng chi tiết
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

  const categories = ['Tất cả', 'iPhone', 'Samsung', 'Xiaomi', 'OPPO', 'Realme'];
  const statuses = ['Tất cả', 'Hoàn tất', 'Đang giao', 'Đã xác nhận', 'Chờ xử lý'];
  const channels = ['Tất cả', 'Website', 'Mobile App', 'Cửa hàng'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Hoàn tất': 'bg-green-100 text-green-700',
      'Đang giao': 'bg-blue-100 text-blue-700',
      'Đã xác nhận': 'bg-purple-100 text-purple-700',
      'Chờ xử lý': 'bg-amber-100 text-amber-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleExport = (type) => {
    alert(`Xuất dữ liệu dưới dạng ${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Thống kê doanh thu</h1>
              <p className="text-gray-600">Dashboard phân tích doanh thu và lợi nhuận</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleExport('CSV')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                <FileText size={18} />
                CSV
              </button>
              <button
                onClick={() => handleExport('Excel')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                <FileSpreadsheet size={18} />
                Excel
              </button>
              <button
                onClick={() => handleExport('PDF')}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
              >
                <Download size={18} />
                Xuất báo cáo
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-800">Bộ lọc nâng cao</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Time Range Quick Select */}
              <div>
                <label className="text-xs text-gray-600 font-medium mb-2 block">Khoảng thời gian</label>
                <div className="flex gap-2">
                  {['day', 'week', 'month'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        timeRange === range
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {range === 'day' ? 'Ngày' : range === 'week' ? 'Tuần' : 'Tháng'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs text-gray-600 font-medium mb-2 block">Danh mục sản phẩm</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-xs text-gray-600 font-medium mb-2 block">Trạng thái đơn hàng</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status.toLowerCase()}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Channel Filter */}
              <div>
                <label className="text-xs text-gray-600 font-medium mb-2 block">Kênh bán hàng</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {channels.map((ch) => (
                    <option key={ch} value={ch.toLowerCase()}>{ch}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-xs text-gray-600 font-medium mb-2 block">Từ ngày</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 font-medium mb-2 block">Đến ngày</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Search */}
              <div className="lg:col-span-2">
                <label className="text-xs text-gray-600 font-medium mb-2 block">Tìm kiếm đơn hàng</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Mã đơn, tên sản phẩm, khách hàng..."
                    value={searchOrder}
                    onChange={(e) => setSearchOrder(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {summaryStats.map((stat, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-white/25 p-3 rounded-xl backdrop-blur-sm">
                  <stat.icon size={24} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  stat.trend === 'up' ? 'bg-white/30' : 'bg-black/20'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </div>
              </div>
              
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-white/90 text-sm font-medium mb-2">{stat.subValue}</p>
              <div className="pt-3 border-t border-white/20">
                <p className="text-white/80 text-xs">{stat.comparison}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Over Time - Line Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Doanh thu theo thời gian</h3>
                <p className="text-sm text-gray-600">Biểu đồ xu hướng doanh thu (triệu VNĐ)</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-600">Doanh thu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <span className="text-xs text-gray-600">Đơn hàng</span>
                </div>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                  <Line type="monotone" dataKey="orders" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Channel - Pie Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800">Doanh thu theo kênh</h3>
              <p className="text-sm text-gray-600">Tỷ trọng theo kênh bán hàng</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {channelData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products - Bar Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Top 5 sản phẩm bán chạy</h3>
              <p className="text-sm text-gray-600">Doanh thu theo sản phẩm (triệu VNĐ)</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis type="category" dataKey="name" width={150} stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="revenue" fill="url(#barGradient)" radius={[0, 8, 8, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">SL</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Giá bán</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Doanh thu</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Lợi nhuận</th>
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
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-gray-700">{order.quantity}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray-700">{formatCurrency(order.price)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-blue-600">{formatCurrency(order.revenue)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-green-600">{formatCurrency(order.profit)}</span>
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
    </div>
  );
}