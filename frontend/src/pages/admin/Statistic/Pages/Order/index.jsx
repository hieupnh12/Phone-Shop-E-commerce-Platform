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
  Calendar,
  Search,
  TrendingUp,
  Package,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
  BarChart3,
  Activity,
  Settings2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import statisticApi from "../../../../../services/statisticService";
import { useAuth } from "../../../../../reducers";
import CardOrder from "./CardOrder";
import formatDate from "../../../../../contexts/formatDate";
import useDebounce from "../../../../../contexts/useDebounce";

export default function OrderStatistic() {
  const [chartType, setChartType] = useState("line");
  const [dateFilter, setDateFilter] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchStaff, setSearchStaff] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: isAuth, isLoading: authLoading } = useAuth();

  const setDefaultDate = (type) => {
    const now = new Date();
    let start, end;

    switch (type) {
      case "day":
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setDate(end.getDate() + 2);
        end.setHours(0, 0, 0, 0);
        break;

      case "week":
        const day = now.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day; // ISO week: Thứ 2 → Chủ nhật
        start = new Date(now);
        start.setDate(now.getDate() + diffToMonday);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;

      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        end = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        break;

      case "year":
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;

      default:
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const {
    data: dataSumOrder,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["summaryOrder", 7],
    queryFn: async () => {
      const res = await statisticApi.getInfoCardOrder();
      console.log(res);

      return res?.result || [];
    },
    enabled: !!isAuth,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 0,
  });

  const debouncedEmail = useDebounce(searchEmail, 500);
  const debouncedStaff = useDebounce(searchStaff, 500);

  const { data: timelineData, isLoading: loadingV2 } = useQuery({
    queryKey: [
      "timelineData",
      startDate,
      endDate,
      dateFilter,
      orderStatus,
      debouncedEmail,
      debouncedStaff,
    ],
    queryFn: async () => {
      const params = {
        startDate: startDate?.trim() || "",
        endDate: endDate?.trim() || "",
        rangeType: dateFilter,
        orderStatus: orderStatus?.trim() || "all",
        search: debouncedEmail?.trim() || undefined,
        searchStaff: debouncedStaff?.trim() || undefined,
      };

      const res = await statisticApi.getOrder(params);
      return res?.result;
    },
    enabled: !!isAuth, // chỉ chạy khi user auth
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 0,
  });
  const [totalOrder, setTotalOrder] = useState(0);

  useEffect(() => {
    if (!timelineData || timelineData.length === 0) {
      setTotalOrder(0);
      return;
    }

    const sum = timelineData.reduce((acc, item) => acc + (item.orders || 0), 0);

    setTotalOrder(sum);
  }, [timelineData]);

  // Dữ liệu mẫu cho biểu đồ
  const [chartData, setChartData] = useState([]);
  useEffect(() => {
    if (!timelineData) return;

    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    if (dateFilter === "week") {
      setChartData(
        formatDate.fillMissingWeeksOfMonth(timelineData, year, month)
      );
    } else if (dateFilter === "month") {
      setChartData(formatDate.fillMissingMonths(timelineData, year));
    } else {
      setChartData(timelineData);
    }
  }, [timelineData, dateFilter]);

  const quickFilters = [
    { label: "Hôm nay", value: "day" },
    { label: "Tháng này", value: "week" },
    { label: "Năm này", value: "month" },
  ];

  const statusFilters = [
    { label: "Tất cả", value: "all" },
    { label: "Đơn mới", value: "PENDING" },
    { label: "Đã xác nhận", value: "paid" },
    { label: "Đang giao", value: "SHIPPED" },
    { label: "Hoàn tất", value: "delivered" },
    { label: "Đã hủy", value: "CANCELED" },
    { label: "Đã trả", value: "returned" },
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
          <p className="text-gray-600">
            Quản lý và theo dõi đơn hàng điện thoại
          </p>
        </div>

        {/* Stats Cards */}
        <CardOrder dataSumOrder={dataSumOrder} isLoading={isLoading} />

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Date & Quick Filters */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-cyan-600" size={20} />
                <h3 className="font-semibold text-gray-800">
                  Lọc theo thời gian
                </h3>
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2">
                {quickFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => {
                      setDateFilter(filter.value);
                      if (filter.value === "week") setDefaultDate("month");
                      if (filter.value === "month") setDefaultDate("year");
                      if (filter.value === "day") setDefaultDate("day");
                    }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      dateFilter === filter.value
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Date Range */}
<div className="grid grid-cols-2 gap-3">
  <div>
    <label className="text-xs text-gray-600 font-medium mb-1 block">
      Từ ngày
    </label>
    <input
      type="date"
      onClick={() => setDateFilter("")}
      value={startDate}
      max={endDate || new Date().toISOString().split("T")[0]} // Không cho chọn sau endDate
      onChange={(e) => setStartDate(e.target.value)}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
    />
  </div>
  <div>
    <label className="text-xs text-gray-600 font-medium mb-1 block">
      Đến ngày
    </label>
    <input
      type="date"
      value={endDate}
      min={startDate || undefined} // Không cho chọn trước startDate
       max={new Date().toISOString().split("T")[0]}
      onChange={(e) => {
        setEndDate(e.target.value);
        setDateFilter("");
      }}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
    />
  </div>
</div>
            </div>

            {/* Right Column - Status & Search */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Package className="text-cyan-600" size={20} />
                <h3 className="font-semibold text-gray-800">
                  Lọc theo trạng thái
                </h3>
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
              {/* <div className="space-y-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Tìm theo email khách hàng..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Tìm theo tài khoản nhân viên..."
                    value={searchStaff}
                    onChange={(e) => setSearchStaff(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                Biểu đồ thống kê đơn hàng
              </h2>
              <p className="text-sm text-gray-600">
                Từ {startDate} đến {endDate} •{" "}
                <span className="font-semibold text-cyan-600">
                  Tổng: {totalOrder}
                </span>
              </p>
            </div>

            {/* Chart Type Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setChartType("line")}
                className={`p-2 rounded-md transition-all ${
                  chartType === "line"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                title="Biểu đồ đường"
              >
                <Activity size={20} />
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={`p-2 rounded-md transition-all ${
                  chartType === "bar"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-200"
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
              {chartType === "line" ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                    label={{
                      value: "Số đơn hàng",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: "12px", fill: "#6b7280" },
                    }}
                  />
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
                    dataKey="orders"
                    stroke="url(#colorGradient)"
                    strokeWidth={3}
                    dot={{ fill: "#06b6d4", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <defs>
                    <linearGradient
                      id="colorGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
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
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                    label={{
                      value: "Số đơn hàng",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: "12px", fill: "#6b7280" },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="orders"
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
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
              <span className="text-sm text-gray-600 font-medium">
                Số lượng đơn hàng
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={16} />
              <span className="text-sm text-gray-600">
                Xu hướng tăng trưởng
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
