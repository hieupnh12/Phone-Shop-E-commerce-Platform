import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp, DollarSign, Download, Calendar } from 'lucide-react';

const ProductStatistics = () => {
  const [dateFrom, setDateFrom] = useState('2025-11-01');
  const [dateTo, setDateTo] = useState('2025-11-07');

  const data = {
    topProducts: [
      { name: "iPhone 15 Pro", brand: "Apple", quantity: 38, revenue: 57000000, profit: 18000000 },
      { name: "Galaxy S24", brand: "Samsung", quantity: 29, revenue: 42000000, profit: 12000000 }
    ],
    byBrand: [
      { brand: "Apple", revenue: 120000000 },
      { brand: "Samsung", revenue: 80000000 },
      { brand: "Xiaomi", revenue: 10000000 }
    ]
  };

  const totalQuantity = data.topProducts.reduce((sum, p) => sum + p.quantity, 0);
  const totalRevenue = data.byBrand.reduce((sum, b) => sum + b.revenue, 0);
  const topProduct = data.topProducts[0];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  const handleExportExcel = () => {
    // Tạo CSV content
    let csv = 'Sản Phẩm,Thương Hiệu,Số Lượng,Doanh Thu,Lợi Nhuận,Tỷ Suất LN\n';
    data.topProducts.forEach(product => {
      const profitMargin = ((product.profit / product.revenue) * 100).toFixed(1);
      csv += `"${product.name}","${product.brand}",${product.quantity},${product.revenue},${product.profit},${profitMargin}%\n`;
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `thong-ke-san-pham-${dateFrom}-${dateTo}.csv`;
    link.click();
  };

  const handleExportPDF = () => {
    alert('Chức năng xuất PDF đang được phát triển');
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Date Filter */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Thống Kê Sản Phẩm</h1>
              <p className="text-slate-600 text-sm sm:text-base">
                Từ {formatDate(dateFrom)} - {formatDate(dateTo)}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Date Filters */}
              <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-lg shadow-md p-3">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-slate-500" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-sm">đến</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Export Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 text-sm font-medium"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">Excel</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 text-sm font-medium"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-blue-500 transform transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-slate-600 text-xs sm:text-sm font-medium">Top 1 Sản Phẩm</div>
              <Package className="text-blue-500" size={20} />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-slate-800 mb-1">{topProduct.name}</div>
            <div className="text-slate-500 text-xs sm:text-sm">{topProduct.brand}</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-purple-500 transform transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-slate-600 text-xs sm:text-sm font-medium">Tổng Số Lượng Bán</div>
              <TrendingUp className="text-purple-500" size={20} />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-slate-800 mb-1">{totalQuantity}</div>
            <div className="text-slate-500 text-xs sm:text-sm">Sản phẩm</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-green-500 transform transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-slate-600 text-xs sm:text-sm font-medium">Tổng Doanh Thu</div>
              <DollarSign className="text-green-500" size={20} />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-slate-800 mb-1">{formatCurrency(totalRevenue)}</div>
            <div className="text-slate-500 text-xs sm:text-sm">VND</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 transform transition-all duration-300 hover:shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Top Sản Phẩm Bán Chạy</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'quantity') return [value, 'Số lượng'];
                    return [formatCurrency(value), name === 'revenue' ? 'Doanh thu' : 'Lợi nhuận'];
                  }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend 
                  formatter={(value) => {
                    if (value === 'quantity') return 'Số lượng';
                    if (value === 'revenue') return 'Doanh thu';
                    return 'Lợi nhuận';
                  }}
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="quantity" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 transform transition-all duration-300 hover:shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Doanh Thu Theo Thương Hiệu</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.byBrand}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ brand, percent }) => `${brand} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {data.byBrand.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Details Table */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 transform transition-all duration-300 hover:shadow-xl overflow-hidden">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Chi Tiết Sản Phẩm</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-3 px-3 sm:px-4 text-slate-700 font-semibold text-xs sm:text-sm whitespace-nowrap">Sản Phẩm</th>
                    <th className="text-left py-3 px-3 sm:px-4 text-slate-700 font-semibold text-xs sm:text-sm whitespace-nowrap">Thương Hiệu</th>
                    <th className="text-right py-3 px-3 sm:px-4 text-slate-700 font-semibold text-xs sm:text-sm whitespace-nowrap">Số Lượng</th>
                    <th className="text-right py-3 px-3 sm:px-4 text-slate-700 font-semibold text-xs sm:text-sm whitespace-nowrap">Doanh Thu</th>
                    <th className="text-right py-3 px-3 sm:px-4 text-slate-700 font-semibold text-xs sm:text-sm whitespace-nowrap">Lợi Nhuận</th>
                    <th className="text-right py-3 px-3 sm:px-4 text-slate-700 font-semibold text-xs sm:text-sm whitespace-nowrap">Tỷ Suất LN</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((product, index) => {
                    const profitMargin = ((product.profit / product.revenue) * 100).toFixed(1);
                    return (
                      <tr 
                        key={index} 
                        className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 transform hover:scale-[1.01]"
                      >
                        <td className="py-3 px-3 sm:px-4 font-medium text-slate-800 text-xs sm:text-sm whitespace-nowrap">{product.name}</td>
                        <td className="py-3 px-3 sm:px-4 text-slate-600 text-xs sm:text-sm whitespace-nowrap">{product.brand}</td>
                        <td className="py-3 px-3 sm:px-4 text-right text-slate-800 text-xs sm:text-sm whitespace-nowrap">{product.quantity}</td>
                        <td className="py-3 px-3 sm:px-4 text-right text-slate-800 text-xs sm:text-sm whitespace-nowrap">{formatCurrency(product.revenue)}</td>
                        <td className="py-3 px-3 sm:px-4 text-right text-green-600 font-semibold text-xs sm:text-sm whitespace-nowrap">{formatCurrency(product.profit)}</td>
                        <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                          <span className="inline-block bg-gradient-to-r from-green-100 to-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                            {profitMargin}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default ProductStatistics;