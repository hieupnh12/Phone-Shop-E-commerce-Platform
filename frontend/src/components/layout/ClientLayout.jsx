import React, { useState, useEffect } from "react";
import { ShoppingCart, Outlet } from "lucide-react";
import { useNavigate, Outlet as RouterOutlet } from "react-router-dom";
import { getUserRole } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import Header from "./Header";
import ClientSidebar from "./ClientSidebar";
import backgroundVideo from "../../video/17series.mp4";
import { useAuth } from "../../reducers";
import { fetchTop5Products } from "../../services/productWorker";
import { Flame, TrendingUp, Star } from "lucide-react";

const ClientLayout = ({ children, showHero = true }) => {
  const { t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hotProduct, setHotProduct] = useState([]);

  const navigate = useNavigate();
  const user = getUserRole();

  const slogans = [
    {
      title: t('home.slogan1Title'),
      subtitle: t('home.slogan1Subtitle'),
      description: t('home.slogan1Description'),
    },
    {
      title: t('home.slogan2Title'),
      subtitle: t('home.slogan2Subtitle'),
      description: t('home.slogan2Description'),
    },
    {
      title: t('home.slogan3Title'),
      subtitle: t('home.slogan3Subtitle'),
      description: t('home.slogan3Description'),
    },
    {
      title: t('home.slogan4Title'),
      subtitle: t('home.slogan4Subtitle'),
      description: t('home.slogan4Description'),
    },
    {
      title: t('home.slogan5Title'),
      subtitle: t('home.slogan5Subtitle'),
      description: t('home.slogan5Description'),
    },
  ];

  const hotProductTop5 = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTop5Products();
      console.log("✓ Hot product fetched:", data);
      setHotProduct(data.products || []);
    } catch (err) {
      setError("Failed to fetch top products.");
    } finally {
      setLoading(false);
    }
  };

  // THÊM MỚI: Gọi fetch khi component mount
  useEffect(() => {
    hotProductTop5();
  }, []); // Dependency rỗng để chỉ gọi 1 lần

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slogans.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // fl scroll
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
    }
    // TODO: Thêm logic thêm vào giỏ hàng ở đây
  };

// THÊM MỚI: Handler cho button "Xem Tất Cả Sản Phẩm" - navigate đến trang Products (/products)
  const handleViewAllProducts = () => {
    navigate("/user/products"); // Route đến Products/index.jsx (cấu hình trong router)
  };

  const handleViewProductId = (id) => {
    console.log("handleViewProductId called with ID:", id); // Log ID trong function để xác nhận
    if (!id) {
      console.error("Invalid product ID:", id);
      return; // Không navigate nếu id undefined/null
    }
    navigate(`user/products/${id}`); // Navigate với ID đúng
    console.log("Navigated to to /products/", id); // Log sau navigate
  };

  // cal do mo video khi scroll
  const videoOpacity = Math.max(1 - scrollY / 400, 0);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gray-950">
      <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className="flex pt-0 relative z-10">
        <ClientSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 overflow-x-hidden">
          {showHero && (
            <>
              <div className="relative h-screen flex items-center justify-center group overflow-hidden">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ opacity: videoOpacity }}
                  className="absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-500"
                >
                  <source src={backgroundVideo} type="video/mp4" />
                  Trình duyệt của bạn không hỗ trợ video nền.
                </video>

                <div className="absolute inset-0 bg-black/40 z-0" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-0" />

            {/* slogan slide */}
            <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center flex flex-col items-center justify-center h-full transform translate-y-[19%]">
              {slogans.map((slogan, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${
                    index === currentSlide
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10 pointer-events-none"
                  }`}
                >
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
                    {" "}
                    {slogan.title}{" "}
                  </h1>{" "}
                  <p className="text-xl sm:text-2xl lg:text-3xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {" "}
                    {slogan.subtitle}{" "}
                  </p>{" "}
                  <p className="text-base sm:text-lg text-gray-200 mb-8 drop-shadow-lg">
                    {" "}
                    {slogan.description}{" "}
                  </p>{" "}
                  <button 
                  onClick={handleBuyNow}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2 rounded-full text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50">
                    {" "}
                    {t('home.buyNow')}{" "}
                  </button>
                </div>
              ))}
            </div>

                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                  {slogans.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "bg-white w-8"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Hot product */}
          return (
          <div className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-950 via-blue-950/30 to-gray-900 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
              {/* Header Section */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-6 py-2 mb-4">
                  <Flame className="w-5 h-5 text-red-500 animate-pulse" />
                  <span className="text-red-400 font-semibold text-sm uppercase tracking-wider">
                    Đang Bán Chạy
                  </span>
                  <TrendingUp className="w-5 h-5 text-red-500" />
                </div>

                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3 drop-shadow-2xl">
                  Sản Phẩm{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    Hot Nhất
                  </span>
                </h2>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                  Top 5 điện thoại được khách hàng tin tùng và lựa chọn nhiều
                  nhất
                </p>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col justify-center items-center py-16">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                  <div className="text-white text-lg font-medium">
                    Đang tải sản phẩm hot...
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-16 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <div className="text-red-400 text-6xl mb-4">⚠️</div>
                  <p className="text-red-400 text-lg mb-6 font-medium">
                    {error}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {/* Products Grid */}
              {!loading && !error && hotProduct.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                  {hotProduct.map((product, index) => {
                    const version = product.versions?.[0];
                    const formatPrice = (price) => {
                      return new Intl.NumberFormat("vi-VN").format(price) + "đ";
                    };
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleViewProductId(product.id)}
                        className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer"
                        style={{
                          animationDelay: `${index * 100}ms`,
                        }}
                      >
                        {/* Ranking Badge */}
                        <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg z-10">
                          #{index + 1}
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                              (product.badge || "HOT") === "HOT"
                                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                                : (product.badge || "MỚI") === "MỚI"
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                            }`}
                          >
                            {product.badge || "HOT"}
                          </span>
                        </div>

                        {/* Product Image */}
                        <div className="relative mb-4 mt-4">
                          <div className="aspect-square bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center overflow-hidden group-hover:from-blue-500/30 group-hover:via-purple-500/30 group-hover:to-pink-500/30 transition-all duration-500">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>

                          {/* Trending indicator */}
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <TrendingUp className="w-3 h-3" />
                            <span className="font-semibold">
                              {/* {product.soldCount} */}
                              1000 đã bán
                            </span>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="mt-6">
                          <h3 className="text-white font-semibold text-sm mb-3 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-300 transition-colors">
                            {product.name}
                          </h3>

                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-3 h-3 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                            <span className="text-gray-400 text-xs ml-1">
                              (4.8)
                            </span>
                          </div>

                          {/* Price */}
                          <div className="mb-4">
                            <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold text-lg">
                              {formatPrice(version?.price || 0)}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProductId(product.id);
                              }}
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50"
                            >
                              Xem chi tiết
                            </button>
                            {/* <button
                              onClick={(e) => handleAddToCart(e, product)}
                              className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-white/20 hover:border-white/40"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Thêm vào giỏ
                            </button> */}
                          </div>
                        </div>

                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500 pointer-events-none"></div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* View All Button */}
              {!loading && !error && hotProduct.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={handleViewAllProducts}
                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <span>Xem Tất Cả Sản Phẩm</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          );
          {/* Route Content via Outlet */}
          {children}
          <RouterOutlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
