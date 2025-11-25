// Products/ProductsContainer.jsx (all logic and sub-components)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Loading from '../../../components/common/Loading';
import cartService from '../../../services/cartService';
import productWorker from '../../../services/productWorker';
import ProductListAll from '../../../components/common/Product/ProductListAll';
import ProductFilter from './ProductFilter';

const ProductsContainer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productCount, setProductCount] = useState(0);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [minRating, setMinRating] = useState(0);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await productWorker.fetchCategories();
        setCategories(categoriesData || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Lưu favorites khi thay đổi
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Tạo object filters để truyền xuống ProductListAll
  const filters = React.useMemo(() => ({
    search: searchQuery,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    minRating: minRating > 0 ? minRating : undefined,
  }), [searchQuery, priceRange, minRating]);

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
    navigate(`/products/${productId}`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 10000000]);
    setMinRating(0);
  };

  const handleProductsCountChange = (count) => {
    setProductCount(count);
  };

  // Filter handlers for ProductFilter
  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handlePriceChange = (newRange) => setPriceRange(newRange);
  const handleRatingChange = (newRating) => setMinRating(newRating);
  const handleToggleFilters = () => setShowFilters(!showFilters);

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex gap-6">
        {/* ProductFilter */}
        <ProductFilter
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          priceRange={priceRange}
          onPriceChange={handlePriceChange}
          minRating={minRating}
          onRatingChange={handleRatingChange}
          categories={categories}
          onResetFilters={handleResetFilters}
          showFilters={showFilters}
          onToggleFilters={handleToggleFilters}
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Results Summary */}
          <div className="mb-6 flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-white">
              Showing <span className="font-bold">{productCount}</span> products
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
            categories={categories}
            onResetFilters={handleResetFilters}
            onProductsCountChange={handleProductsCountChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsContainer;