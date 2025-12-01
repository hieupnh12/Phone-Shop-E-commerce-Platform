import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const options = [
  { value: 'none',  label: 'Không lọc' },
  { value: 'day',   label: 'Theo ngày' },
  { value: 'week',  label: 'Theo tuần' },
  { value: 'month', label: 'Theo tháng' },
  { value: 'year',  label: 'Theo năm' },
];

export default function RangeTypeSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = options.find(o => o.value === value)?.label || 'Chọn kiểu lọc';

  return (
    <div className="relative w-full max-w-xs">
      {/* Nút hiển thị giá trị hiện tại */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-1.5 text-left bg-white border border-gray-300 rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);  // <-- quan trọng: cập nhật giá trị cha
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 cursor-pointer hover:bg-blue-50 transition ${
                  value === opt.value ? 'bg-blue-100 text-sm text-blue-800 font-semibold' : 'text-gray-700'
                }`}
              >
                {opt.label}
              </li>
            ))}
          </ul>

          {/* Click ngoài để đóng */}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
}