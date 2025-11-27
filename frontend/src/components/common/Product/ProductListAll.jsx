import React, { useEffect, useMemo, useState } from 'react';
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProductAll, fetchSearchAll } from '../../../services/productWorker';
import { useNavigate } from "react-router-dom";

const PhoneShopList = (props) => { // ← THAY ĐỔI: Sử dụng fetchAllProducts thay fetch thủ công
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const navigate = useNavigate();
  const PAGE_SIZE = 8;

  const normalizedFilters = useMemo(() => {
    if (!props.filters) return {};
    return Object.entries(props.filters).reduce((acc, [key, value]) => {
      if (value === undefined || value === null) {
        return acc;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return acc; 
      }
      acc[key] = value;
      return acc;
    }, {});
  }, [props.filters]);

  const filtersKey = useMemo(() => JSON.stringify(normalizedFilters), [normalizedFilters]);

  useEffect(() => {
    setCurrentPage(0);
  }, [filtersKey]);

  // CẬP NHẬT (của tôi):
const [error, setError] = useState(null);  // ← THÊM: State error



const loadAllProducts = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await fetchProductAll(0, 1000);
    const list = data.products || [];
    setAllProducts(list);
    setFilteredProducts(list);
    const count = data.total || list.length;
    setTotalCount(count);
    props.onProductsCountChange?.(count);
  } catch (error) {
    console.error('Lỗi tải danh sách sản phẩm:', error);
    setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
    setAllProducts([]);
    setFilteredProducts([]);
    setTotalCount(0);
    props.onProductsCountChange?.(0);
  } finally {
    setLoading(false);
  }
};
 
useEffect(() => {
  loadAllProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);



const hasFilters = useMemo(() => {
  const nonPriceFilters = Object.entries(normalizedFilters).filter(([k]) => !['minPrice', 'maxPrice', 'priceRange'].includes(k));
  return nonPriceFilters.length > 0 || (normalizedFilters.priceRange && normalizedFilters.priceRange !== 'all');
}, [normalizedFilters]);


useEffect(() => {
  if (!allProducts.length) {
    return;
  }


if (!hasFilters) {
    setFilteredProducts(allProducts);
    setTotalCount(allProducts.length);
    props.onProductsCountChange?.(allProducts.length);
    setError(null);
    setLoading(false);
    return;
  }

  const runSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const searchData = await fetchSearchAll(normalizedFilters, 0, 200);
      // 👇 FIX: Sử dụng searchData.products thay vì .versions (vì fetchSearchAll giờ return products enriched)
      // Không cần matchedNames nữa, vì search đã filter và enrich sẵn
      const matches = searchData.products || [];

      setFilteredProducts(matches);
      const count = matches.length;
      setTotalCount(count);  // Hoặc searchData.total * searchData.size nếu cần total pages, nhưng với size=200 lớn, length ≈ total
      props.onProductsCountChange?.(count);
      if (!count) {
        setError('Không tìm thấy sản phẩm phù hợp.');
      } else {
        setError(null);
      }
    } catch (error) {
      console.error('Lỗi tìm kiếm sản phẩm:', error);
      setError('Không thể tìm kiếm sản phẩm. Vui lòng thử lại sau.');
      setFilteredProducts([]);
      setTotalCount(0);
      props.onProductsCountChange?.(0);
    } finally {
      setLoading(false);
    }
  };

  runSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [filtersKey, allProducts]);
// useEffect(() => {
//   // Fetch the total count asynchronously on mount (or when dependencies change, if any)
//   const loadTotalCount = async () => {
//     try {
//       const count = await fetchCountProduct(); // Assumes fetchCountProduct returns the count directly (no ID needed for total count)
//       setTotalCount(count);
//     // setTotalCount(data.totalCount || 0); // ← THÊM MỚI: Lưu tổng count từ API (nếu có; fallback 0)
//     console.log("so luong san pham lal : ",totalCount);
//       } catch (error) {
//       console.error('Error loading total product count:', error);
//       setTotalCount(0); // Fallback to 0 on error
//     }
//   };

//   loadTotalCount();
// }, []);


//   Sau fetch thành công - gửi count lên component cha khi products thay đổi
// ← SỬA: Gửi TỔNG SỐ sản phẩm (totalCount) thay vì products.length (per page)
  // useEffect(() => {
  //   props.onProductsCountChange?.(totalCount || 0); // ← THAY ĐỔI: Dùng totalCount để gửi tổng toàn bộ
  //       // THÊM: Tự tính totalCount ở frontend dựa trên totalPages và pageSize (8)
  // }, [totalCount]); // ← THAY ĐỔI: Depend vào totalCount thay vì products (vì totalCount chỉ thay đổi khi fetch, không phụ thuộc page)




  // ← GIỮ: toggleFavorite, nhưng dùng product.id sau transform
  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };




  
  // ← GIỮ: formatPrice
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price * 1) + 'đ';
  };




  //  const handleViewProductId = () =>{
  //      navigate(`/products/${products.id}`);
  //  }

// Function handleViewProductId - log bên trong để debug
  const handleViewProductId = (id) => {
    console.log('handleViewProductId called with ID:', id); // Log ID trong function để xác nhận
    if (!id) {
      console.error('Invalid product ID:', id);
      return; // Không navigate nếu id undefined/null
    }
    navigate(`/products/${id}`); // Navigate với ID đúng
    console.log('Navigated to /products/', id); // Log sau navigate
  };



  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-100 text-lg">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error && !filteredProducts.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button 
            onClick={() => {
              if (Object.keys(normalizedFilters).length > 0) {
                setFilteredProducts([]);
                setCurrentPage(0);
              }
              loadAllProducts();
            }}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition shadow-lg shadow-cyan-500/30"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900">
      {/* Header */}
      <div className="bg-slate-800/60 backdrop-blur-md border-b border-cyan-500/20 sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">Điện thoại</h1>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['OPPO', 'HONOR', 'Nubia', 'Sony', 'Nokia', 'Infinix', 'Nothing Phone', 'Masstel', 'Realme', 'Itel', 'vivo'].map(brand => (
              <button 
                key={brand} 
                className="px-4 py-2 bg-slate-700/30 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-full text-sm font-medium whitespace-nowrap transition-all text-cyan-100 hover:text-cyan-300 hover:border-cyan-400/40"
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main>
        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => {
              const version = product.versions?.[0];
              const isFavorite = favorites.has(product.id);
              const discount = product.discount || 0;
              const screenSize = product.specifications?.['Screen Size'];
              const ram = version?.ram || 'null';
              const storage = version?.rom || 'null';

              return (
                <div 
                  key={product.id} 
                  className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative group hover:scale-[1.02] hover:-translate-y-1"
                >
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                      Giảm {discount}%
                    </div>
                  )}

                  {/* Installment Badge */}
                  <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg">
                    Trả góp 0%
                  </div>

                  {/* Image Container */}
                  <button
                    onClick={() => {
                      console.log('Product ID:', product.id);
                      handleViewProductId(product.id);
                    }}
                    className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 group-hover:from-gray-100 group-hover:to-gray-200 transition-all"
                  >
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-contain transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </button>

                  {/* Product Info */}
                  <div className="p-4 bg-white">
                    <button
                      onClick={() => {
                        console.log('Product ID:', product.id);
                        handleViewProductId(product.id);
                      }}
                      className="text-base font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[40px] hover:text-cyan-600 transition-colors text-left"
                    >
                      {product.name} | Chính hãng                 
                    </button>

                    {/* Price */}
                    <div className="mb-3">
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl font-bold text-cyan-600">
                          {product.price ? formatPrice(product.price) : 'Liên hệ'}
                        </p>
                        {discount > 0 && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatPrice(Math.round(product.price / (1 - discount / 100)))}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Specifications Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs rounded-full font-medium border border-gray-300">
                        {screenSize}
                      </span>
                      <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs rounded-full font-medium border border-gray-300">
                        {storage}
                      </span>
                    </div>

                    {/* Smember Promotion */}
                    {product.discount > 0 && (
                      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 text-xs px-3 py-2 rounded-lg mb-3 border border-cyan-200 font-medium">
                        Smember giảm đến {Math.round(product.price * 0.01)}.000đ
                      </div>
                    )}

                    {/* Installment Info */}
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                      Trả góp 0% - 0đ phụ thu - 0đ trả trước - kỳ hạn đến 12 tháng
                    </p>

                    {/* Rating & Favorite */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-800 text-sm">{product.rating || 5}</span>
                      </div>
                      <button 
                        onClick={() => toggleFavorite(product.id)}
                        className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 transition-colors"
                      >
                        <Heart 
                          className={`w-5 h-5 transition-all ${isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-cyan-600'}`}
                        />
                        <span className="text-sm font-medium">Yêu thích</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-12">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 border border-gray-200"
            >
              <ChevronLeft className="w-6 h-6 text-cyan-600" />
            </button>
            
            <span className="px-6 py-3 bg-white rounded-full shadow-lg font-semibold text-gray-800 border border-gray-200">
              Trang {Math.min(currentPage + 1, totalPages)} / {totalPages}
            </span>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage + 1 >= totalPages}
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 border border-gray-200"
            >
              <ChevronRight className="w-6 h-6 text-cyan-600" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
export default PhoneShopList;