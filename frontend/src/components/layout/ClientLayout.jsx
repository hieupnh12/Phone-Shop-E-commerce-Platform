import React, { useState, useEffect } from "react";
import { ShoppingCart, Outlet } from "lucide-react";
import { useNavigate, Outlet as RouterOutlet } from "react-router-dom";
import { getUserRole } from "../../contexts/AuthContext";
import Header from "./Header";
import ClientSidebar from "./ClientSidebar";
import backgroundVideo from "../../video/17series.mp4";
import { useAuth } from "../../reducers";




const ClientLayout = ({ children, showHero = true }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const user = getUserRole();

  const slogans = [
    {
      title: "Công Nghệ Đỉnh Cao",
      subtitle: "Trải nghiệm iPhone mới nhất 2025",
      description: "Chip A18 Pro - Hiệu năng vượt trội",
    },
    {
      title: "Giá Tốt Nhất Thị Trường",
      subtitle: "Cam kết giá rẻ hơn hoàn tiền",
      description: "Trả góp 0% - Không lãi suất",
    },
    {
      title: "Bảo Hành Chính Hãng",
      subtitle: "Apple Authorized Reseller",
      description: "12 tháng bảo hành toàn cầu",
    },
    {
      title: "Giao Hàng Siêu Tốc",
      subtitle: "Nhận hàng trong 2 giờ tại Hà Nội",
      description: "Miễn phí vận chuyển toàn quốc",
    },
    {
      title: "Trade-In Máy Cũ",
      subtitle: "Thu cũ đổi mới giá cao",
      description: "Lên đời iPhone dễ dàng hơn",
    },
  ];

  const hotProducts = [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      price: "29.990.000đ",
      image: "📱",
      badge: "HOT",
    },
    {
      id: 2,
      name: "iPhone 15 Plus",
      price: "24.990.000đ",
      image: "📱",
      badge: "MỚI",
    },
    {
      id: 3,
      name: "iPhone 14 Pro",
      price: "22.990.000đ",
      image: "📱",
      badge: "SALE",
    },
    {
      id: 4,
      name: "iPhone 15",
      price: "21.990.000đ",
      image: "📱",
      badge: "HOT",
    },
    {
      id: 5,
      name: "iPhone 14 Plus",
      price: "19.990.000đ",
      image: "📱",
      badge: "SALE",
    },
    {
      id: 6,
      name: "iPhone 13 Pro",
      price: "17.990.000đ",
      image: "📱",
      badge: "SALE",
    },
  ];

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
    navigate("/products"); // Route đến Products/index.jsx (cấu hình trong router)
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
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2 rounded-full text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50">
                    {" "}
                    Buy Now{" "}
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
          {showHero && (
          <div className="relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-950 to-gray-900">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  Sản Phẩm Bán Chạy
                </h2>
                <p className="text-gray-300 text-lg drop-shadow">
                  Top điện thoại được yêu thích nhất
                </p>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {hotProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer"
                  >
                    <div className="relative mb-3">
                      <span
                        className={`absolute top-0 right-0 px-2 py-1 rounded-full text-xs font-bold ${
                          product.badge === "HOT"
                            ? "bg-red-500"
                            : product.badge === "MỚI"
                            ? "bg-green-500"
                            : "bg-orange-500"
                        } text-white`}
                      >
                        {product.badge}
                      </span>
                      <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                        <span className="text-5xl">{product.image}</span>
                      </div>
                    </div>

                    <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>

                    <p className="text-blue-400 font-bold text-base mb-3">
                      {product.price}
                    </p>

                    <div className="space-y-2">
                      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-all duration-300">
                        Xem chi tiết
                      </button>
                      <button 
                        onClick={handleAddToCart}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>



            {/* THÊM MỚI: onClick cho button "Xem Tất Cả Sản Phẩm" */}       
              <div className="text-center mt-8">
                <button
                onClick={handleViewAllProducts}
                 className="bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white px-8 py-3 rounded-full font-semibold border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105"
                 >
                  Xem Tất Cả Sản Phẩm →
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Route Content via Outlet */}
          {children}
          <RouterOutlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
