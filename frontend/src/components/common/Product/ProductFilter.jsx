import React, { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";

const Section = ({ title, children }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full text-left"
      >
        <span className="font-semibold text-gray-800">{title}</span>
        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && <div className="mt-3">{children}</div>}
    </div>
  );
};

const Pill = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-xl border text-sm mr-2 mb-2 transition
        ${active ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700"}
    `}
  >
    {children}
  </button>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 mb-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 accent-blue-600"
    />
    <span className="text-gray-700 text-sm">{label}</span>
  </label>
);

const ProductFilter = ({
  brand,
  onBrandChange,
  brands = [],

  priceRange,
  onPriceChange,

  customMinPrice = "",
  customMaxPrice = "",
  onCustomMinPriceChange,
  onCustomMaxPriceChange,

  os,
  onOsChange,

  cpu,
  onCpuChange,

  battery,
  onBatteryChange,

  ram,
  onRamChange,

  rom,
  onRomChange,

  screenSize,
  onScreenSizeChange,

  refreshRate,
  onRefreshRateChange,
}) => {
  return (
    <div className="w-72 bg-white shadow-lg rounded-2xl p-5 overflow-y-auto max-h-screen">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
        <Filter size={18} /> Bộ lọc tìm kiếm
      </h2>

      {/* BRAND */}
      <Section title="Hãng sản xuất">
        <div className="grid grid-cols-2 gap-3">
          {brands.map((b) => (
            <button
              key={b.value}
              onClick={() => onBrandChange(b.value)}
              className={`flex items-center justify-center gap-2 p-2 border rounded-xl shadow-sm
                transition text-sm 
                ${brand === b.value ? "border-blue-600 bg-blue-50" : "border-gray-300"}
              `}
            >
              <img src={b.logo} className="w-5 h-5" />
              <span>{b.label}</span>
            </button>
          ))}
        </div>

        <button className="text-blue-600 text-sm mt-2">Xem thêm</button>
      </Section>

      {/* PRICE */}
      <Section title="Mức giá">
        <Checkbox label="Tất cả" checked={priceRange.type === "all"} onChange={() => onPriceChange("all")} />
        <Checkbox label="Dưới 2 triệu" checked={priceRange.type === "under2"} onChange={() => onPriceChange("under2")} />
        <Checkbox label="Từ 2 - 4 triệu" checked={priceRange.type === "2-4"} onChange={() => onPriceChange("2-4")} />
        <Checkbox label="Từ 4 - 7 triệu" checked={priceRange.type === "4-7"} onChange={() => onPriceChange("4-7")} />
        <Checkbox label="Từ 7 - 13 triệu" checked={priceRange.type === "7-13"} onChange={() => onPriceChange("7-13")} />
        <Checkbox label="Từ 13 - 20 triệu" checked={priceRange.type === "13-20"} onChange={() => onPriceChange("13-20")} />
        <Checkbox label="Trên 20 triệu" checked={priceRange.type === "20+"} onChange={() => onPriceChange("20+")} />

        <p className="text-sm text-gray-500 mt-2">Hoặc nhập khoảng giá phù hợp với bạn:</p>

        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            placeholder="Từ"
            value={customMinPrice}
            onChange={(e) => onCustomMinPriceChange(e.target.value)}
            className="w-1/2 px-2 py-1 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Đến"
            value={customMaxPrice}
            onChange={(e) => onCustomMaxPriceChange(e.target.value)}
            className="w-1/2 px-2 py-1 border rounded-lg"
          />
        </div>
      </Section>

      {/* OS */}
      <Section title="Hệ điều hành">
        <div className="flex flex-wrap">
          <Pill active={os === "ios"} onClick={() => onOsChange("ios")}>iOS</Pill>
          <Pill active={os === "android"} onClick={() => onOsChange("android")}>Android</Pill>
        </div>
      </Section>

      {/* CPU */}
      <Section title="Chip xử lý">
        <div className="flex flex-wrap">
          <Pill active={cpu === "snapdragon"} onClick={() => onCpuChange("snapdragon")}>Snapdragon</Pill>
          <Pill active={cpu === "mediatek"} onClick={() => onCpuChange("mediatek")}>MediaTek</Pill>
          <Pill active={cpu === "apple"} onClick={() => onCpuChange("apple")}>Apple A-series</Pill>
          <Pill active={cpu === "exynos"} onClick={() => onCpuChange("exynos")}>Exynos</Pill>
          <Pill active={cpu === "kirin"} onClick={() => onCpuChange("kirin")}>Kirin</Pill>
        </div>
      </Section>

      {/* BATTERY */}
      <Section title="Dung lượng pin">
        <Checkbox label="Tất cả" checked={battery === "all"} onChange={() => onBatteryChange("all")} />
        <Checkbox label="Dưới 3000 mAh" checked={battery === "under3000"} onChange={() => onBatteryChange("under3000")} />
        <Checkbox label="3000 - 4000 mAh" checked={battery === "3-4"} onChange={() => onBatteryChange("3-4")} />
        <Checkbox label="4000 - 5500 mAh" checked={battery === "4-5.5"} onChange={() => onBatteryChange("4-5.5")} />
        <Checkbox label="Trên 5500 mAh" checked={battery === "5500+"} onChange={() => onBatteryChange("5500+")} />
      </Section>

      {/* RAM */}
      <Section title="RAM">
        <div className="flex flex-wrap">
          {["16", "12", "8", "6", "4", "3"].map((r) => (
            <Pill key={r} active={ram === r} onClick={() => onRamChange(r)}>
              {r} GB
            </Pill>
          ))}
        </div>
      </Section>

      {/* ROM - Updated to internal storage */}
      <Section title="Bộ nhớ trong">
        <div className="flex flex-wrap">
          {["64", "128", "256", "512", "1024"].map((s) => (
            <Pill key={s} active={rom === s} onClick={() => onRomChange(s)}>
              {s} GB
            </Pill>
          ))}
        </div>
      </Section>

      {/* SCREEN SIZE */}
      <Section title="Màn hình">
        <Checkbox label="Tất cả" checked={screenSize === "all"} onChange={() => onScreenSizeChange("all")} />
        <Checkbox label="Màn hình nhỏ" checked={screenSize === "small"} onChange={() => onScreenSizeChange("small")} />
        <Checkbox label="Từ 5 - 6.5 inch" checked={screenSize === "5-6.5"} onChange={() => onScreenSizeChange("5-6.5")} />
        <Checkbox label="6.5 - 6.8 inch" checked={screenSize === "6.5-6.8"} onChange={() => onScreenSizeChange("6.5-6.8")} />
        <Checkbox label="Trên 6.8 inch" checked={screenSize === "6.8+"} onChange={() => onScreenSizeChange("6.8+")} />
      </Section>

      {/* REFRESH RATE */}
      <Section title="Tần số quét">
        <div className="flex flex-wrap">
          {["144", "120", "90", "60"].map((hz) => (
            <Pill key={hz} active={refreshRate === hz} onClick={() => onRefreshRateChange(hz)}>
              {hz} Hz
            </Pill>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default ProductFilter;