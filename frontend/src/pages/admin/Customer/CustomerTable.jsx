import { Edit, Edit2, Edit2Icon, Edit3, Search } from "lucide-react";
import Loading from "../../../components/common/Loading";
import { useState } from "react";

export default function CustomerTable({ mockResponse, goToPage, isLoading, onEdit, setKeyword, keyword }) {
  const customers = mockResponse?.content || [];
  const {
    totalPages,
    number: current,
    first,
    last,
    numberOfElements,
    totalElements,
  } = mockResponse;
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString)
      return <span className="text-gray-400 italic">Chưa cập nhật</span>;
    const date = new Date(dateTimeString);
    return date.toLocaleString("vi-VN");
  };

  if (isLoading) {
    return <Loading />;
  }
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          {/* <h3 className="text-lg font-bold text-gray-800">Danh sách khách hàng</h3> */}
          {/* <p className="text-sm text-gray-600">Bảng dữ liệu chi tiết các khách hàng</p> */}
          {/* Search */}
          <div className="lg:col-span-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Mã đơn, họ và tên, sdt..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Hiển thị{" "}
          <span className="font-semibold text-gray-800">
            {numberOfElements || 0}
          </span>{" "}
          trên{" "}
          <span className="font-semibold text-gray-800">
            {totalElements || 0}
          </span>{" "}
          khách
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Họ và tên
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Số điện thoại
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Ngày sinh
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Giới tính
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Ngày cập nhật
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.map((customer, idx) => (
              <tr
                key={idx}
                className="hover:bg-blue-50/50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 text-sm text-gray-700">
                  {customer.customerId}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                  {customer.fullName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {customer.phoneNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {customer.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {customer.birthDate}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {customer.gender || "--"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {formatDateTime(customer.createAt)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {formatDateTime(customer.updateAt)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <button
                  onClick={() => onEdit(customer)}
                    className="rounded-lg text-blue-600 hover:text-blue-900"
                    title="Chỉnh sửa"
                  >
                    <Edit3 className='w-5 h-5' />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-6 border-t border-gray-200 flex items-center justify-between">
        <button
          disabled={first}
          onClick={() => goToPage(current - 1)}
          className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
            first
              ? "text-gray-300 border-gray-200"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
          }`}
        >
          Trang trước
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                i === current
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          disabled={last}
          onClick={() => goToPage(current + 1)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            last
              ? "bg-gray-200 text-gray-400"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg"
          }`}
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}
