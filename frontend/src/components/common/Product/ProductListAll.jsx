import React, { useState, useEffect } from 'react';
import { Heart, Star, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import productWorker from '../../../services/productWorker'; // ← THÊM: Import productWorker (điều chỉnh đường dẫn nếu cần)
import { useNavigate, Outlet } from "react-router-dom";

const PhoneShopList = (props) => { // ← THAY ĐỔI: Sử dụng fetchAllProducts thay fetch thủ công
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1); // ← THÊM: Để lưu totalPages từ API
  const [favorites, setFavorites] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  // CẬP NHẬT (của tôi):
const [error, setError] = useState(null);  // ← THÊM: State error

const fetchProducts = async (page) => {
  setLoading(true); 
  setError(null);  // ← THÊM: Reset error
  try {
    const data = await productWorker.fetchAllProducts(page,8);
    setProducts(data.products || []);
    setTotalPages(data.totalPages - 2|| 1);
  } catch (error) {
    console.error('Lỗi fetch sản phẩm:', error);
    setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');  // ← THÊM: Thông báo lỗi user-friendly
    setProducts([]);  // ← THAY: Rỗng thay vì mock
    setTotalPages(1);
  } finally {
    setLoading(false);
  }
};




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



  // Sau fetch thành công - gửi count lên component cha khi products thay đổi
  useEffect(() => {
    props.onProductsCountChange?.(products.length || 0);
  }, [products]);
  // ← GIỮ: formatPrice
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price * 1000) + 'đ';
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



  // ← XÓA: calculateDiscount thủ công, vì transform đã có product.discount
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }


// THÊM MỚI: Sau if (loading) {...}
if (error) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button 
          onClick={() => fetchProducts(currentPage)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header - GIỮ NGUYÊN */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800">Điện thoại</h1>
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {['OPPO', 'HONOR', 'Nubia', 'Sony', 'Nokia', 'Infinix', 'Nothing Phone', 'Masstel', 'Realme', 'Itel', 'vivo'].map(brand => (
              <button key={brand} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium whitespace-nowrap transition">
                {brand}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main>

      {/* Products Grid - THAY ĐỔI: Adjust fields theo transform */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {products.map((product) => {
            const version = product.versions?.[0];
            const isFavorite = favorites.has(product.id);
            const discount = product.discount || 0;
            const screenSize = product.specifications?.['Screen Size'];
            const ram = version?.ram || '8 GB';
            const storage = version?.rom || '128 GB';

            return (
              <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                {/* Discount Badge - Top Left */}
                {discount > 0 && (
                  <div className="absolute top-2 left-2 z-10 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                    Giảm {discount}%
                  </div>
                )}

                {/* Installment Badge - Top Right */}
                <div className="absolute top-2 right-2 z-10 bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-semibold border border-blue-300">
                  Trả góp 0%
                </div>

                {/* Image Container */}
                <button
                  onClick={() => {
                   console.log('Product ID:', product.id); // Log ID trước khi truyền
                    handleViewProductId(product.id);
                    }}

                    className="relative bg-white p-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-contain"
                  />
                </button>
                {/* Product Info */}
                <div className="p-4">
                  
                  {/* Product Name with Official Badge */}
                  <button
                  onClick={() => {
                    console.log('Product ID:', product.id); // Log ID trước khi truyền
                    handleViewProductId(product.id);
                      }}
                   className="text-base font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[40px] ">
                    {product.name} | Chính hãng                 
                  </button>
                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-bold text-red-600">
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
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300">
                      {screenSize}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300">
                      {storage}
                    </span>
                  </div>

                  {/* Smember Promotion */}
                  {product.discount > 0 && (
                    <div className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded mb-3">
                      Smember giảm đến {Math.round(product.price * 0.01)}.000đ
                    </div>
                  )}

                  {/* Installment Info */}
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
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
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-blue-600'}`}
                      />
                      <span className="text-sm font-medium">Yêu thích</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>



        {/* Pagination - THAY ĐỔI: Dùng totalPages từ API */}
        <div className="flex justify-center items-center gap-4 mt-12">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="p-3 bg-white rounded-full shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          
          <span className="px-6 py-2 bg-white rounded-full shadow-md font-semibold text-gray-700">
            Trang {currentPage + 1} / {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))} // ← THAY: Giới hạn bằng totalPages
            disabled={currentPage + 1 >= totalPages}
            className="p-3 bg-white rounded-full shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>

      </div>
          </main>

    </div>
  );
  
};
export default PhoneShopList;