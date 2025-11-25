import React, { useMemo, useState } from 'react'
import { ArrowUpDown } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import Loading from '../../../../../components/common/Loading';


export default function Table({data7Day, isLoading}) {
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const statsData = data7Day? data7Day:[];

  // 🔄 Hàm sắp xếp
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // ✅ Dữ liệu sau khi sắp xếp
  const sortedData = useMemo(() => {
    if (!sortColumn) return statsData;

    return [...statsData].sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];
      if (typeof valueA === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }
      return sortDirection === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
  }, [statsData, sortColumn, sortDirection]);

 if (isLoading) return <Loading type='dots'/>
  return (
    <div className="bg-white rounded-2xl shadow-md mt-6">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          📅 Doanh thu 7 ngày gần nhất
        </h3>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: "topProduct", label: "Sản phẩm bán chạy" },
                { key: "orders", label: "Đơn hàng" },
                { key: "revenue", label: "Doanh thu" },
                { key: "cost", label: "Chi phí" },
                { key: "benefit", label: "Lợi nhuận" },
                { key: "date", label: "Ngày" },
              ].map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    <ArrowUpDown size={14} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                  {row.topProduct}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {row.orders}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-green-600 whitespace-nowrap">
                  {row.revenue.toLocaleString("vi-VN")} ₫
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                  {row.cost.toLocaleString("vi-VN")} ₫
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-blue-600 whitespace-nowrap">
                  {row.benefit.toLocaleString("vi-VN")} ₫
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                  {new Date(row.date).toLocaleDateString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>

          {/* ✅ Dòng tổng kết */}
          <tfoot className="bg-gray-100 font-semibold text-gray-800">
            <tr>
              <td className="px-6 py-3">Tổng</td>
              <td className="px-6 py-3">
                {statsData.reduce((a, b) => a + b.orders, 0)}
              </td>
              <td className="px-6 py-3 text-green-700">
                {statsData
                  .reduce((a, b) => a + b.revenue, 0)
                  .toLocaleString("vi-VN")} ₫
              </td>
              <td className="px-6 py-3">
                {statsData
                  .reduce((a, b) => a + b.cost, 0)
                  .toLocaleString("vi-VN")} ₫
              </td>
              <td className="px-6 py-3 text-blue-700">
                {statsData
                  .reduce((a, b) => a + b.benefit, 0)
                  .toLocaleString("vi-VN")} ₫
              </td>
              <td className="px-6 py-3">—</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
