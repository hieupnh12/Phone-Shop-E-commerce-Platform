import React, { useState, useEffect } from "react";
import { ShoppingCart, Outlet } from "lucide-react";
import { useNavigate, Outlet as RouterOutlet } from "react-router-dom";
import { getUserRole } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import Header from "./Header";
import backgroundVideo from "../../video/17series.mp4";
import { useAuth } from "../../reducers";
import { fetchTop5Products } from "../../services/productWorker";
import feedbackService from "../../services/feedbackService";
import { Flame, TrendingUp, Star, Zap } from "lucide-react";

const ClientLayout = ({ children, showHero = true }) => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hotProduct, setHotProduct] = useState([]);
  const [productRatings, setProductRatings] = useState({}); // { productId: { averageRating, totalReviews } }

  const navigate = useNavigate();
  const user = getUserRole();

  const slogans = [
    {
      title: t("home.slogan1Title"),
      subtitle: t("home.slogan1Subtitle"),
      description: t("home.slogan1Description"),
    },
    {
      title: t("home.slogan2Title"),
      subtitle: t("home.slogan2Subtitle"),
      description: t("home.slogan2Description"),
    },
    {
      title: t("home.slogan3Title"),
      subtitle: t("home.slogan3Subtitle"),
      description: t("home.slogan3Description"),
    },
    {
      title: t("home.slogan4Title"),
      subtitle: t("home.slogan4Subtitle"),
      description: t("home.slogan4Description"),
    },
    {
      title: t("home.slogan5Title"),
      subtitle: t("home.slogan5Subtitle"),
      description: t("home.slogan5Description"),
    },
  ];

  const hotProductTop5 = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTop5Products();
      console.log("✓ Hot product fetched:", data);
      const products = data.products || [];
      setHotProduct(products);
      
      // Fetch ratings cho tất cả sản phẩm
      if (products.length > 0) {
        fetchProductRatings(products);
      }
    } catch (err) {
      setError(t('home.failedToFetchHotProducts'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch ratings cho danh sách sản phẩm - KHÔNG yêu cầu đăng nhập
  const fetchProductRatings = async (products) => {
    try {
      console.log("📊 Fetching ratings for products (public access):", products.map(p => ({ id: p.id, name: p.name })));
      
      const ratingPromises = products.map(async (product) => {
        // Sử dụng product.id hoặc product.idProduct (tùy format)
        const productId = product.id || product.idProduct;
        
        if (!productId) {
          console.warn(`⚠️ Product missing ID:`, product);
          return {
            productId: product.id || product.idProduct,
            averageRating: 0,
            totalReviews: 0,
          };
        }
        
        try {
          // Gọi API rating - endpoint này KHÔNG yêu cầu authentication
          // Sử dụng Promise.allSettled để đảm bảo không bị fail nếu một request lỗi
          const [avgRatingResult, statsResult] = await Promise.allSettled([
            feedbackService.getAverageRating(productId),
            feedbackService.getRatingStats(productId),
          ]);
          
          // Xử lý average rating response
          let averageRating = 0;
          if (avgRatingResult.status === 'fulfilled') {
            const avgRatingResponse = avgRatingResult.value;
            console.log(`📊 Rating response for product ${productId}:`, {
              avgRatingResponse,
              productName: product.name
            });
            
            // Handle different response formats
            // Backend có thể trả về Double trực tiếp hoặc object
            if (typeof avgRatingResponse === 'number') {
              averageRating = avgRatingResponse;
            } else if (avgRatingResponse?.average_rating !== undefined) {
              averageRating = avgRatingResponse.average_rating;
            } else if (avgRatingResponse?.averageRating !== undefined) {
              averageRating = avgRatingResponse.averageRating;
            } else if (avgRatingResponse?.result !== undefined) {
              // Nếu có wrapper result
              const result = avgRatingResponse.result;
              averageRating = typeof result === 'number' ? result : (result?.average_rating || result?.averageRating || 0);
            }
          } else {
            console.warn(`⚠️ Failed to fetch average rating for product ${productId}:`, avgRatingResult.reason);
          }
          
          // Xử lý stats response
          let totalReviews = 0;
          if (statsResult.status === 'fulfilled') {
            const statsResponse = statsResult.value;
            if (statsResponse?.total_reviews !== undefined) {
              totalReviews = statsResponse.total_reviews;
            } else if (statsResponse?.totalReviews !== undefined) {
              totalReviews = statsResponse.totalReviews;
            } else if (statsResponse?.result) {
              const result = statsResponse.result;
              totalReviews = result?.total_reviews || result?.totalReviews || 0;
            }
          } else {
            console.warn(`⚠️ Failed to fetch rating stats for product ${productId}:`, statsResult.reason);
          }
          
          console.log(`✅ Parsed rating for product ${productId}:`, {
            averageRating,
            totalReviews,
            productName: product.name
          });
          
          return {
            productId: productId,
            averageRating: Number(averageRating) || 0,
            totalReviews: Number(totalReviews) || 0,
          };
        } catch (err) {
          // Xử lý lỗi một cách graceful - không throw để không làm crash component
          console.warn(`⚠️ Error fetching rating for product ${productId} (non-blocking):`, err?.message || err);
          return {
            productId: productId,
            averageRating: 0,
            totalReviews: 0,
          };
        }
      });
      
      // Sử dụng allSettled để đảm bảo tất cả promises được resolve, kể cả khi có lỗi
      const ratingResults = await Promise.allSettled(ratingPromises);
      const ratingsMap = {};
      
      ratingResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value?.productId) {
          const rating = result.value;
          ratingsMap[rating.productId] = {
            averageRating: rating.averageRating,
            totalReviews: rating.totalReviews,
          };
        }
      });
      
      console.log("📊 Final productRatings map:", ratingsMap);
      console.log("📊 Product IDs in hotProduct:", products.map(p => p.id || p.idProduct));
      setProductRatings(ratingsMap);
    } catch (err) {
      // Xử lý lỗi tổng thể - không làm crash component, chỉ log
      console.warn("⚠️ Error fetching product ratings (non-blocking):", err?.message || err);
      // Vẫn set empty map để component vẫn render được với default ratings
      setProductRatings({});
    }
  };

  // THÊM MỚI: Gọi fetch khi component mount và auto-refresh định kỳ (realtime)
  useEffect(() => {
    // Load ngay lập tức
    hotProductTop5();
    
    // Auto-refresh mỗi 30 giây để cập nhật realtime
    const refreshInterval = setInterval(() => {
      console.log("🔄 Auto-refreshing hot products...");
      hotProductTop5();
    }, 30000); // 30 giây = 30000ms
    
    // Cleanup interval khi component unmount
    return () => {
      clearInterval(refreshInterval);
    };
  }, []); // Dependency rỗng để chỉ setup 1 lần

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

  // const handleAddToCart = () => {
  //   if (!user) {
  //     navigate("/login");
  //   }
  //   // TODO: Thêm logic thêm vào giỏ hàng ở đây
  // };

  const handleBuyNow = () => {
    navigate("/user/products");
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
      <Header />

      <div className="flex pt-0 relative z-10">
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
                  {t('home.videoNotSupported')}
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
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2 rounded-full text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50"
                      >
                        {" "}
                        {t("home.buyNow")}{" "}
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
          <div className="relative py-16 px-4">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Container wrapper */}
            <div className="relative max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="relative mb-12">
                {/* Glowing line */}
                <div className="absolute top-0 left-0 w-24 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-transparent rounded-full"></div>
                
                <div className="flex items-center gap-4 mb-4 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
                      <div className="absolute inset-0 blur-lg bg-orange-500/50"></div>
                    </div>
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                      {t('home.hotProducts')}
                    </h2>
                  </div>
                  <Zap className="w-6 h-6 text-yellow-400 animate-bounce" />
                </div>
                
                <p className="text-gray-400 text-lg ml-12">
                  {t('home.hotProductsDescription')}
                </p>
              </div>

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
                    {t('home.retry')}
                  </button>
                </div>
              )}

              {/* Main container box */}
              {!error && hotProduct.length > 0 && (
                <div className="relative">
                  {/* Border glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-20 blur-xl"></div>
                  
                  {/* Inner container */}
                  <div className="relative bg-gradient-to-br from-slate-900/90 via-blue-900/30 to-slate-900/90 backdrop-blur-xl rounded-3xl border border-cyan-500/30 shadow-2xl overflow-hidden">
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                    
                    {/* Corner decorations */}
                    <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-cyan-400/50 rounded-tl-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-purple-400/50 rounded-br-3xl"></div>

                    {/* Content padding */}
                    <div className="p-8">
                      {/* Products Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {hotProduct.map((product, index) => {
                          const version = product.versions?.[0];
                          const formatPrice = (price) => {
                            return new Intl.NumberFormat("vi-VN").format(price) + "đ";
                          };
                          return (
                            <div
                              key={product.id}
                              onClick={() => handleViewProductId(product.id)}
                              className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 cursor-pointer"
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
                                    (product.badge || t('home.badgeHot')) === t('home.badgeHot')
                                      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                                      : (product.badge || t('home.badgeNew')) === t('home.badgeNew')
                                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                      : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                  }`}
                                >
                                  {product.badge || t('home.badgeHot')}
                                </span>
                              </div>

                              {/* Product Image */}
                              <div className="relative mb-4 mt-4">
                                <div className="aspect-square bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center overflow-hidden group-hover:from-cyan-500/30 group-hover:via-blue-500/30 group-hover:to-purple-500/30 transition-all duration-500 border border-cyan-500/20">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                </div>

                                {/* Trending indicator */}
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs px-5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                  <TrendingUp className="w-3 h-3" />
                                  <span className="font-semibold">
                                    {product.soldQuantity || product.soldCount || 0}{" "}
                                    {t('home.sold')}
                                  </span>
                                </div>
                              </div>

                              {/* Product Info */}
                              <div className="mt-6">
                                <h3 className="text-white font-semibold text-sm mb-3 line-clamp-2 min-h-[2.5rem] group-hover:text-cyan-300 transition-colors">
                                  {product.name}
                                </h3>

                                {/* Rating */}
                                {(() => {
                                  // Sử dụng product.id hoặc product.idProduct
                                  const productId = product.id || product.idProduct;
                                  const rating = productRatings[productId];
                                  const averageRating = rating?.averageRating || 0;
                                  const totalReviews = rating?.totalReviews || 0;
                                  const roundedRating = Math.round(averageRating);
                                  
                                  return (
                                    <div className="flex items-center gap-1 mb-3">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3 h-3 ${
                                            i < roundedRating
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "fill-gray-600 text-gray-600"
                                          }`}
                                        />
                                      ))}
                                      <span className="text-gray-400 text-xs ml-1">
                                        {averageRating > 0 ? `(${averageRating.toFixed(1)})` : "(0.0)"}
                                        {totalReviews > 0 && (
                                          <span className="text-gray-500"> • {totalReviews} {t('home.reviews')}</span>
                                        )}
                                      </span>
                                    </div>
                                  );
                                })()}

                                {/* Price */}
                                <div className="mb-4">
                                  <p className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-bold text-lg">
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
                                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50"
                                  >
                                    {t('home.viewDetails')}
                                  </button>
                                </div>
                              </div>

                              {/* Hover effect overlay */}
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-500 pointer-events-none"></div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bottom accent line */}
                      <div className="mt-8 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* View all button */}
              {!error && hotProduct.length > 0 && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleViewAllProducts}
                    className="group relative px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {t('home.viewAllProducts')}
                      <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Route Content via Outlet */}
          {children}
          <RouterOutlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
