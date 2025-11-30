import React, { useMemo, useState } from "react";
import { ChevronDown, Filter, Search } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex justify-between items-center w-full text-left"
      >
        <span className="font-semibold text-slate-800">{title}</span>
        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && <div className="mt-3">{children}</div>}
    </div>
  );
};

const Pill = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-xl border text-sm transition mr-2 mb-2
      ${
        active
          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
          : "border-slate-300 text-slate-700 hover:border-blue-400"
      }
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
    <span className="text-slate-700 text-sm">{label}</span>
  </label>
);

const ProductFilter = ({
  searchQuery = "",
  onSearchChange = () => {},
  brand = "",
  onBrandChange = () => {},
  brands = [],
  priceRange = "all",
  onPriceChange = () => {},
  customMinPrice = "",
  customMaxPrice = "",
  onCustomMinPriceChange = () => {},
  onCustomMaxPriceChange = () => {},
  os = "",
  onOsChange = () => {},
  cpu = "",
  onCpuChange = () => {},
  battery = "all",
  onBatteryChange = () => {},
  ram = "",
  onRamChange = () => {},
  rom = "",
  onRomChange = () => {},
  screenSize = "all",
  onScreenSizeChange = () => {},
  refreshRate = "",
  onRefreshRateChange = () => {},
  minRating = 0,
  onMinRatingChange = () => {},
  onResetFilters = () => {},
}) => {
  const { t } = useLanguage();
  
  const ratingOptions = [
    { label: t('common.all'), value: 0 },
    { label: `${t('common.from')} 3 ${t('common.stars')}`, value: 3 },
    { label: `${t('common.from')} 4 ${t('common.stars')}`, value: 4 },
    { label: `${t('common.from')} 4.5 ${t('common.stars')}`, value: 4.5 },
    { label: `${t('common.from')} 5 ${t('common.stars')}`, value: 5 },
  ];
  
  const isPriceRangeSelected = (range) => priceRange === range;
  const isBatterySelected = (range) => battery === range;
  const isScreenSizeSelected = (range) => screenSize === range;

  const hasAnyFilter = useMemo(() => {
    return (
      searchQuery ||
      brand ||
      priceRange !== "all" ||
      customMinPrice ||
      customMaxPrice ||
      os ||
      cpu ||
      battery !== "all" ||
      ram ||
      rom ||
      screenSize !== "all" ||
      refreshRate ||
      minRating > 0
    );
  }, [
    battery,
    brand,
    cpu,
    customMaxPrice,
    customMinPrice,
    minRating,
    os,
    priceRange,
    ram,
    refreshRate,
    rom,
    screenSize,
    searchQuery,
  ]);

  return (
    <div className="w-full lg:w-72 bg-white shadow-lg rounded-2xl p-5 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Filter size={18} /> Bộ lọc tìm kiếm
        </h2>
        <button
          type="button"
          onClick={onResetFilters}
          disabled={!hasAnyFilter}
          className="text-sm text-blue-600 hover:text-blue-700 disabled:text-slate-300 disabled:cursor-not-allowed"
        >
          Đặt lại
        </button>
      </div>

      <Section title="Từ khóa">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Tên sản phẩm, mã..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm"
          />
        </div>
      </Section>

      {brands.length > 0 && (
        <Section title="Hãng sản xuất">
          <div className="grid grid-cols-2 gap-3">
            {brands.map((b) => (
              <button
                key={b.value}
                onClick={() => onBrandChange(brand === b.value ? "" : b.value)}
                className={`flex items-center justify-center gap-2 p-2 border rounded-xl shadow-sm text-sm transition
                  ${brand === b.value ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-700"}
                `}
              >
                {b.logo ? <img src={b.logo} alt={b.label} className="w-5 h-5" /> : null}
                <span>{b.label}</span>
              </button>
            ))}
          </div>
          {/* <button className="text-blue-600 text-sm mt-2">Xem thêm</button> */}
        </Section>
      )}

      <Section title="Mức giá">
        <Checkbox label="Tất cả" checked={isPriceRangeSelected("all")} onChange={() => onPriceChange("all")} />
        <Checkbox label="Dưới 2 triệu" checked={isPriceRangeSelected("under2")} onChange={() => onPriceChange("under2")} />
        <Checkbox label="Từ 2 - 4 triệu" checked={isPriceRangeSelected("2-4")} onChange={() => onPriceChange("2-4")} />
        <Checkbox label="Từ 4 - 7 triệu" checked={isPriceRangeSelected("4-7")} onChange={() => onPriceChange("4-7")} />
        <Checkbox label="Từ 7 - 13 triệu" checked={isPriceRangeSelected("7-13")} onChange={() => onPriceChange("7-13")} />
        <Checkbox label="Từ 13 - 20 triệu" checked={isPriceRangeSelected("13-20")} onChange={() => onPriceChange("13-20")} />
        <Checkbox label="Trên 20 triệu" checked={isPriceRangeSelected("20+")} onChange={() => onPriceChange("20+")} />

        <p className="text-xs text-slate-500 mt-2">Hoặc nhập khoảng giá (VND):</p>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            placeholder="Từ"
            value={customMinPrice}
            onChange={(e) => onCustomMinPriceChange(e.target.value)}
            className="w-1/2 px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder={t('profile.toPrice')}
            value={customMaxPrice}
            onChange={(e) => onCustomMaxPriceChange(e.target.value)}
            className="w-1/2 px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </Section>

      <Section title={t('profile.minRating')}>
        <div className="flex flex-wrap">
          {ratingOptions.map((option) => (
            <Pill
              key={option.value}
              active={minRating === option.value}
              onClick={() => onMinRatingChange(option.value)}
            >
              {option.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Hệ điều hành">
        <div className="flex flex-wrap">
          <Pill active={os === "ios"} onClick={() => onOsChange(os === "ios" ? "" : "ios")}>
            iOS
          </Pill>
          <Pill active={os === "android"} onClick={() => onOsChange(os === "android" ? "" : "android")}>
            Android
          </Pill>
        </div>
      </Section>

      <Section title="Chip xử lý">
        <div className="flex flex-wrap">
          {["snapdragon", "mediatek", "apple", "exynos", "kirin"].map((chip) => (
            <Pill key={chip} active={cpu === chip} onClick={() => onCpuChange(cpu === chip ? "" : chip)}>
              {chip === "apple" ? "Apple A-series" : chip.charAt(0).toUpperCase() + chip.slice(1)}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Dung lượng pin">
        <Checkbox label="Tất cả" checked={isBatterySelected("all")} onChange={() => onBatteryChange("all")} />
        <Checkbox label="Dưới 3000 mAh" checked={isBatterySelected("under3000")} onChange={() => onBatteryChange("under3000")} />
        <Checkbox label="3000 - 4000 mAh" checked={isBatterySelected("3-4")} onChange={() => onBatteryChange("3-4")} />
        <Checkbox label="4000 - 5500 mAh" checked={isBatterySelected("4-5.5")} onChange={() => onBatteryChange("4-5.5")} />
        <Checkbox label="Trên 5500 mAh" checked={isBatterySelected("5500+")} onChange={() => onBatteryChange("5500+")} />
      </Section>

      {/* <Section title="RAM">
        <div className="flex flex-wrap">
          {["16", "12", "8", "6", "4", "3"].map((r) => (
            <Pill key={r} active={ram === r} onClick={() => onRamChange(ram === r ? "" : r)}>
              {r} GB
            </Pill>
          ))}
        </div>
      </Section> */}

      <Section title="Bộ nhớ trong">
        <div className="flex flex-wrap">
          {["64", "128", "256", "512", "1024"].map((s) => (
            <Pill key={s} active={rom === s} onClick={() => onRomChange(rom === s ? "" : s)}>
              {s} GB
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Màn hình">
        <Checkbox label="Tất cả" checked={isScreenSizeSelected("all")} onChange={() => onScreenSizeChange("all")} />
        <Checkbox label="Màn hình nhỏ" checked={isScreenSizeSelected("small")} onChange={() => onScreenSizeChange("small")} />
        <Checkbox label="Từ 5 - 6.5 inch" checked={isScreenSizeSelected("5-6.5")} onChange={() => onScreenSizeChange("5-6.5")} />
        <Checkbox label="6.5 - 6.8 inch" checked={isScreenSizeSelected("6.5-6.8")} onChange={() => onScreenSizeChange("6.5-6.8")} />
        <Checkbox label="Trên 6.8 inch" checked={isScreenSizeSelected("6.8+")} onChange={() => onScreenSizeChange("6.8+")} />
      </Section>

      <Section title="Tần số quét">
        <div className="flex flex-wrap">
          {["144", "120", "90", "60"].map((hz) => (
            <Pill key={hz} active={refreshRate === hz} onClick={() => onRefreshRateChange(refreshRate === hz ? "" : hz)}>
              {hz} Hz
            </Pill>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default ProductFilter;