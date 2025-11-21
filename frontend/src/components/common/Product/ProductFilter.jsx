// ProductFilter.jsx
import React from 'react';
import { Filter } from 'lucide-react';
import InputField from '../../../components/common/InputField';

const ProductFilter = ({
  searchQuery,
  onSearchChange,
  // selectedCategory,
  // onCategoryChange,
  priceRange,
  onPriceChange,
  minRating,
  onRatingChange,
  categories,
  // selectedCategory, // Commented out as per original
  onResetFilters,
  showFilters,
  onToggleFilters,
  isMobile = false,
}) => {
  return (
    <>
      {/* Mobile Filter Toggle */}
      {isMobile && (
        <div className="md:hidden mb-6 flex gap-3">
          <button
            onClick={onToggleFilters}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Filter size={20} />
            Filters
          </button>
          <div className="flex-1">
            <InputField
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={onSearchChange}
              icon={Filter} // Note: Original uses Search, but Filter for consistency; adjust if needed
            />
          </div>
        </div>
      )}

      {/* Mobile Filter Panel */}
      {isMobile && showFilters && (
        <div className="md:hidden bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={onCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
               >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div> */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price: {priceRange[0].toLocaleString()}₫ - {priceRange[1].toLocaleString()}₫
            </label>
            <input
              type="range"
              min="0"
              max="10000000"
              step="100000"
              value={priceRange[0]}
              onChange={(e) => onPriceChange([parseInt(e.target.value), priceRange[1]])}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="10000000"
              step="100000"
              value={priceRange[1]}
              onChange={(e) => onPriceChange([priceRange[0], parseInt(e.target.value)])}
              className="w-full mt-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rating: {minRating}★
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={minRating}
              onChange={(e) => onRatingChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <button
            onClick={onToggleFilters}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      )}

      {/* Desktop Sidebar Filters */}
      {!isMobile && (
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <InputField
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={onSearchChange}
              />
            </div>
            
            {/* <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={onCategoryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div> */}
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price Range: {priceRange[0].toLocaleString()}₫ - {priceRange[1].toLocaleString()}₫
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={priceRange[0]}
                  onChange={(e) => onPriceChange([parseInt(e.target.value), priceRange[1]])}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={priceRange[1]}
                  onChange={(e) => onPriceChange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>
         
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Minimum Rating: {minRating}★
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={minRating}
                onChange={(e) => onRatingChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
         
            <button
              onClick={onResetFilters}
              className="w-full px-4 py-2 bg-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductFilter;