import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Package, TrendingUp, DollarSign, Calendar } from "lucide-react";
import statisticApi from "../../../../../services/statisticService";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

const ProductStatistics = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

const { data: apiData, isLoading } = useQuery({
  queryKey: ["products", dateFrom, dateTo],
  queryFn: async () => {
    const params = {};
    if (dateFrom) params.startDate = dateFrom;
    if (dateTo) params.endDate = dateTo;

    const res = await statisticApi.getProducts(params);
    return res.result;
  },
  keepPreviousData: true, // <- phải đặt ở đây
});
console.log("cossss", apiData);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  if (isLoading || !apiData) {
    return <div className="p-4">Loading...</div>;
  }

  const { topProduct, totalQuantity, inventoryProduct, topProducts, byBrand } =
    apiData;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                Thống Kê Sản Phẩm
              </h1>
              <p className="text-slate-600 text-sm sm:text-base">
                Từ {formatDate(dateFrom)} - {formatDate(dateTo)}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
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
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Top Product */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-blue-500 transform transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-slate-600 text-xs sm:text-sm font-medium">
                Sản phẩm bán nhiều
              </div>
              <Package className="text-blue-500" size={20} />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-slate-800 mb-1">
              {topProduct.name}
            </div>
            <div className="text-slate-500 text-xs sm:text-sm">
              Đã bán: {topProduct.soldQuantity}, tồn: {topProduct.stockQuantity}
            </div>
          </div>

          {/* Total Quantity */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-purple-500 transform transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-slate-600 text-xs sm:text-sm font-medium">
                Tổng sản phẩm bán ra
              </div>
              <TrendingUp className="text-purple-500" size={20} />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-slate-800 mb-1">
              {totalQuantity}
            </div>
            <div className="text-slate-500 text-xs sm:text-sm">Sản phẩm</div>
          </div>

          {/* Inventory Product */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-green-500 transform transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-slate-600 text-xs sm:text-sm font-medium">
                Sản phẩm tồn
              </div>
              <DollarSign className="text-green-500" size={20} />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-slate-800 mb-1">
              {inventoryProduct.name}
            </div>
            <div className="text-slate-500 text-xs sm:text-sm">
              Tồn: {inventoryProduct.stockQuantity}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Bar Chart Top Products */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 transform transition-all duration-300 hover:shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">
              Top Sản Phẩm Bán Chạy
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name) => [value, "Số lượng"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="soldQuantity" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart By Brand */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 transform transition-all duration-300 hover:shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">
              Số lượng theo thương hiệu
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={byBrand}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, index }) =>
                    `${byBrand[index].brand} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantity"
                >
                  {byBrand.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value, "Số lượng"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
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
      `}</style>
    </div>
  );
};

export default ProductStatistics;
