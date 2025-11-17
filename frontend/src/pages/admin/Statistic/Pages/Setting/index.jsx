import React, { useState } from 'react';
import { Mail, FileText, Calendar, FileSpreadsheet, Settings2 } from 'lucide-react';

export default function Settings() {
  const [emails, setEmails] = useState('');
  const [contentType, setContentType] = useState('full');
  const [fileFormat, setFileFormat] = useState('excel');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center md:text-left bg-white/80 rounded-2xl shadow-lg p-4">
          <label className="flex items-center gap-2 text-gray-700 font-medium text-2xl">
              <Settings2 className="w-5 h-5 text-blue-500" />
              Report Settings
            </label>
          {/* <h1 className="text-2xl font-bold text-gray-800 mb-2">Report Settings</h1> */}
          <p className="text-gray-600">Cấu hình báo cáo doanh thu điện thoại</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 grid gap-6 md:grid-cols-2">

          {/* Email Recipients */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <Mail className="w-5 h-5 text-blue-500" />
              Người nhận
            </label>
            <input
              type="text"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="admin@example.com, manager@example.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors bg-white/50"
            />
            <p className="text-sm text-gray-500">Nhập nhiều email, phân cách bằng dấu phẩy</p>
          </div>

          {/* Content Type */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <FileText className="w-5 h-5 text-teal-500" />
              Nội dung gửi
            </label>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setContentType('full')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  contentType === 'full'
                    ? 'border-blue-400 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white/50 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold text-gray-800">Toàn bộ báo cáo</div>
                  <div className="text-sm text-gray-600">Summary + Biểu đồ + Bảng</div>
                </div>
              </button>
              <button
                onClick={() => setContentType('table')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  contentType === 'table'
                    ? 'border-blue-400 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white/50 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold text-gray-800">Chỉ bảng dữ liệu</div>
                  <div className="text-sm text-gray-600">Dữ liệu thô</div>
                </div>
              </button>
            </div>
          </div>

          {/* File Format */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <FileSpreadsheet className="w-5 h-5 text-green-500" />
              Định dạng file
            </label>
            <div className="flex gap-3 flex-wrap">
              {['csv', 'excel', 'pdf'].map((format) => (
                <button
                  key={format}
                  onClick={() => setFileFormat(format)}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all font-medium ${
                    fileFormat === format
                      ? 'border-teal-400 bg-teal-50 text-teal-700 shadow-md'
                      : 'border-gray-200 bg-white/50 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <Calendar className="w-5 h-5 text-orange-500" />
              Khoảng thời gian báo cáo
            </label>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 space-y-2">
                <label className="text-sm text-gray-600">Từ ngày</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50"
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm text-gray-600">Đến ngày</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors bg-white/50"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
