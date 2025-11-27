import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  Filter,
  Search,
  FileText,
  FileSpreadsheet,
  Settings2Icon,
} from "lucide-react";
import CardRevenue from "./CardRevenue";
import Loading from "../../../../../components/common/Loading";
import TableRevenue from "./TableRevenue";
import { useQuery } from "@tanstack/react-query";
import statisticApi from "../../../../../services/statisticService";
import { useAuth } from "../../../../../reducers";
import useDebounce from "../../../../../contexts/useDebounce";

export default function RevenueStatistic() {
  const [startDate, setStartDate] = useState("2024-10-01");
  const [endDate, setEndDate] = useState("2024-10-31");
  const [timeRange, setTimeRange] = useState("month");


  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    orderStatus: "all",
    categoryId: "all",
    paymentMethodId: "all",
    page: 0,
    size: 2,
    search: "",
    sort: "create_datetime,desc",
  });
  const debouncedSearch = useDebounce(filters.search, 500); // 500ms

  const { data: isAuth, isLoading: authLoading } = useAuth();

  const {
    data: dataSumOrder,
    isLoadingSum,
    error,
  } = useQuery({
    queryKey: ["summaryRevenue", 7],
    queryFn: async () => {
      const res = await statisticApi.getSummaryRevenue();
      console.log(res);

      return res?.result || [];
    },
    enabled: !!isAuth,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 0,
  });

  // useQuery kết hợp filters
  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", { ...filters, search: debouncedSearch }],
    queryFn: () => statisticApi.getRevenue({ ...filters, search: debouncedSearch }),
    staleTime: 0,
    placeholderData: (prev) => prev, // tương đương keepPreviousData
  });

  const goToPage = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };
  console.log("có", data);

  if (isLoading || authLoading) return <Loading type="spinner" />;
  if (isError) return <Loading message={isError.message} type="dots" />;

  // Dữ liệu biểu đồ doanh thu theo thời gian
  const revenueTimeData = data?.result?.chartData ?? [];

  const handleExport = (type) => {
    alert(`Xuất dữ liệu dưới dạng ${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-2xl shadow-lg">
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium text-2xl">
                <Settings2Icon className="w-5 h-5 text-blue-500" />
                Thống kê doanh thu
              </label>
              <p className="text-gray-600">
                Dashboard phân tích doanh thu và lợi nhuận
              </p>
            </div>
            <div className="flex gap-3">
              {/* <button
                onClick={() => handleExport("CSV")}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                <FileText size={18} />
                CSV
              </button>
              <button
                onClick={() => handleExport("Excel")}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                <FileSpreadsheet size={18} />
                Excel
              </button> */}
              <button
                onClick={() => handleExport("PDF")}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
              >
                <Download size={18} />
                Xuất báo cáo
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <CardRevenue dataSummary={dataSumOrder} />

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="text-blue-600" size={20} />
            <h3 className="font-semibold text-gray-800">Bộ lọc nâng cao</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Time Range Quick Select */}
            <div>
              <label className="text-xs text-gray-600 font-medium mb-2 block">
                Khoảng thời gian
              </label>
              <div className="flex gap-2">
                {["day", "month", "year"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      timeRange === range
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {range === "day"
                      ? "Ngày"
                      : range === "month"
                      ? "Tháng"
                      : "Năm"}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-xs text-gray-600 font-medium mb-2 block">
                Từ ngày
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 font-medium mb-2 block">
                Đến ngày
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Search */}
            <div className="lg:col-span-2">
              <label className="text-xs text-gray-600 font-medium mb-2 block">
                Tìm kiếm đơn hàng
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Mã đơn, tên sản phẩm, khách hàng..."
                  value={filters?.search}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                      page: 0,
                    }))
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Over Time - Line Chart */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Doanh thu theo thời gian
                </h3>
                <p className="text-sm text-gray-600">
                  Biểu đồ xu hướng doanh thu (triệu VNĐ)
                </p>
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
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: "#06b6d4", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <TableRevenue
          data={data?.result.orders}
          filters={filters}
          goToPage={goToPage}
          isLoading={isLoading}
          isError={isError}
        />
      </div>
    </div>
  );
}
