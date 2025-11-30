// Products/ProductsContainer.jsx (all logic and sub-components)
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../../../services/api';
import { fetchCountProduct } from '../../../services/productWorker';
import ProductListAll from '../../../components/common/Product/ProductListAll';
import ProductFilter from './ProductFilter';

const ProductsContainer = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [brand, setBrand] = useState('');
  const [os, setOs] = useState('');
  const [cpu, setCpu] = useState('');
  const [battery, setBattery] = useState('all');
  const [ram, setRam] = useState('');
  const [rom, setRom] = useState('');
  const [screenSize, setScreenSize] = useState('all');
  const [refreshRate, setRefreshRate] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Lưu favorites khi thay đổi
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const pricePresetMap = useMemo(
    () => ({
      all: [0, 10000000],
      under2: [0, 2000000],
      '2-4': [2000000, 4000000],
      '4-7': [4000000, 7000000],
      '7-13': [7000000, 13000000],
      '13-20': [13000000, 20000000],
      '20+': [20000000, 100000000],
    }),
    []
  );

  // Tạo object filters để truyền xuống ProductListAll
  const filters = useMemo(() => {
    const [presetMin, presetMax] = pricePresetMap[priceRange] || [0, 0];
    const hasCustomRange = !!(customMinPrice || customMaxPrice);
const usePreset = priceRange !== 'all' && !hasCustomRange;

    return {
      productName: searchQuery || undefined,
      ...(usePreset && { minPrice: presetMin, maxPrice: presetMax }),  // Chỉ add nếu không 'all'
    ...(usePreset && { priceRange }),  // Tương tự
    ...(hasCustomRange && { customMinPrice: customMinPrice || undefined, customMaxPrice: customMaxPrice || undefined }),
      minRating: minRating > 0 ? minRating : undefined,
      brandName: brand || undefined,
      operatingSystemName: os || undefined,
      chipset: cpu || undefined,
      batteryRange: battery != 'all' ? battery : undefined,
      ramName: ram || undefined,
      romName: rom || undefined,
      screenSizeRange: screenSize != 'all' ? screenSize : undefined,
      scanFrequency: refreshRate || undefined,
    };
  }, [
    battery,
    brand,
    cpu,
    customMaxPrice,
    customMinPrice,
    minRating,
    os,
    pricePresetMap,
    priceRange,
    ram,
    refreshRate,
    rom,
    screenSize,
    searchQuery,
  ]);

  const brandOptions = useMemo(
    () =>[
  // { label: 'Apple', value: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { label: 'Samsung', value: 'Samsung', logo: '../image/samsung-swoop-svgrepo-com.svg' },
  { label: 'Xiaomi', value: 'Xiaomi', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg' },
  { label: 'OPPO', value: 'OPPO', logo: '../image/oppo-seeklogo.svg' },
  { label: 'Apple', value: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { label: 'Sony', value: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg' },
  { label: 'Google', value: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' }
],
    []
  );

  // Handlers
  const handleAddToCart = async (productId) => {
    try {
      await cartService.addByImei(productId);
      alert('Added to cart!');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add to cart.');
    }
  };

  const handleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleViewDetail = (productId) => {
    navigate(`/user/products/${productId}`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setPriceRange('all');
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setMinRating(0);
    setBrand('');
    setOs('');
    setCpu('');
    setBattery('all');
    setRam('');
    setRom('');
    setScreenSize('all');
    setRefreshRate('');
  };

  const handleProductsCountChange = (count) => {
    setTotalCount(count);
  };

  // Filter handlers for ProductFilter
  const handleSearchChange = (e) => {
    const { value } = e.target;
    console.log('[ProductFilter] searchQuery ->', value);
    setSearchQuery(value);
  };
  const handlePriceChange = (rangeKey) => {
    console.log('[ProductFilter] priceRange preset ->', rangeKey);
    setPriceRange(rangeKey);
    if (customMinPrice || customMaxPrice) {
      setCustomMinPrice('');
      setCustomMaxPrice('');
    }
  };
  const handleRatingChange = (newRating) => {
    console.log('[ProductFilter] minRating ->', newRating);
    setMinRating(newRating);
  };

  useEffect(() => {
    console.log('[ProductFilter] filters payload ->', filters);
  }, [filters]);


  // Fetch the total count asynchronously on mount (or when dependencies change, if any)
  const loadTotalCount = async () => {
    try {
      const data = await fetchCountProduct(); // Assumes fetchCountProduct returns the count directly (no ID needed for total count)
      const count = data?.result ||  -1;
      setTotalCount(count);
    // setTotalCount(data.totalCount || 0); // ← THÊM MỚI: Lưu tổng count từ API (nếu có; fallback 0)
    console.log("so luong san pham la : ",totalCount);
    return 
      } catch (error) {
      console.error('Error loading total product count:', error);
      setTotalCount(0); // Fallback to 0 on error
    }
  };

useEffect(() => {
  loadTotalCount();
}, []); // Empty for mount-only; or add filter deps for re-fetch on changes

 

// Fetch product specifications for popup
// const specificationsPopup = async (productId) => {
// try{
//     const data = 
//     return data;
// }catch(error){
//   console.error('Error loading product specifications:', error);
//   }};






  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex gap-6">
        {/* ProductFilter */}
        <ProductFilter
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          brand={brand}
          onBrandChange={(value) => {
            console.log('[ProductFilter] brand ->', value);
            // const brandValue = value && typeof value === 'object' ? value.value : value;
            setBrand(value);
          }}
          brands={brandOptions}
          priceRange={priceRange}
          onPriceChange={handlePriceChange}
          customMinPrice={customMinPrice}
          customMaxPrice={customMaxPrice}
          onCustomMinPriceChange={(value) => {
            console.log('[ProductFilter] customMinPrice ->', value);
            setCustomMinPrice(value);
            if (priceRange !== 'all') {
              setPriceRange('all');
            }
          }}
          onCustomMaxPriceChange={(value) => {
            console.log('[ProductFilter] customMaxPrice ->', value);
            setCustomMaxPrice(value);
            if (priceRange !== 'all') {
              setPriceRange('all');
            }
          }}
          os={os}
          onOsChange={(value) => {
            console.log('[ProductFilter] operatingSystem ->', value);
            setOs(value);
          }}
          cpu={cpu}
          onCpuChange={(value) => {
            console.log('[ProductFilter] chipset ->', value);
            setCpu(value);
          }}
          battery={battery}
          onBatteryChange={(value) => {
            console.log('[ProductFilter] batteryRange ->', value);
            setBattery(value);
          }}
          ram={ram}
          onRamChange={(value) => {
            console.log('[ProductFilter] ramName ->', value);
            setRam(value);
          }}
          rom={rom}
          onRomChange={(value) => {
            console.log('[ProductFilter] romName ->', value);
            setRom(value);
          }}
          screenSize={screenSize}
          onScreenSizeChange={(value) => {
            console.log('[ProductFilter] screenSizeRange ->', value);
            setScreenSize(value);
          }}
          refreshRate={refreshRate}
          onRefreshRateChange={(value) => {
            console.log('[ProductFilter] scanFrequency ->', value);
            setRefreshRate(value);
          }}
          minRating={minRating}
          onMinRatingChange={handleRatingChange}
          onResetFilters={() => {
            console.log('[ProductFilter] reset invoked');
            handleResetFilters();
          }}
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Results Summary */}
          <div className="mb-6 flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <p className="text-white">
            Showing <span className="font-bold">{totalCount}</span> products
            {/* {totalCount === 1 ? ' (1 result)' : ' results'} Improved pluralization for better UX */}
          </p>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>

          {/* Render ProductListAll */}
          <ProductListAll
            filters={filters}
            favorites={favorites}
            onAddToCart={handleAddToCart}
            onFavorite={handleFavorite}
            onViewDetail={handleViewDetail}
            onResetFilters={handleResetFilters}
            onProductsCountChange={handleProductsCountChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsContainer;