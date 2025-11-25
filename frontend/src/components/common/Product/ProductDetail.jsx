import React, { useState, useEffect, useMemo } from "react";
import {
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Check,
  Gift,
  CreditCard,
} from "lucide-react";
import productWorker from "../../../services/productWorker";
import { useNavigate, Outlet as RouterOutlet } from "react-router-dom";
import { useParams } from "react-router-dom"; // Import useParams
import cartService from "../../../services/cartService";

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [selectedRam, setSelectedRam] = useState(null);
  const [selectedRom, setSelectedRom] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Lấy productId từ URL params
  const { id } = useParams(); // Lấy :id từ route /products/:id
  const productId = parseInt(id, 10); // Chuyển sang number nếu cần



  const fetchProductDetail = async (id) => {
    if (!id) {
      setError("ID sản phẩm không hợp lệ.");
      setProduct(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await productWorker.fetchProductById(id);

      // Giả sử data từ backend cần được transform, nhưng ở đây set trực tiếp (thêm transform nếu cần)
      setProduct(data);
      console.log("✓ Product detail fetched:", data);
      if (data?.versions?.length > 0) {
        setSelectedVersion(data.versions[0]); // Chọn version đầu tiên mặc định
      }
      console.log("✓ Selected version set:", data.versions);
    } catch (error) {
      console.error("Lỗi fetch sản phẩm:", error);
      const message =
        error.response?.status === 404
          ? "Sản phẩm không tồn tại."
          : "Không thể tải sản phẩm. Vui lòng thử lại sau.";
      setError(message);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };











  useEffect(() => {
    if (productId) {
      fetchProductDetail(productId); // Fetch với ID từ params
    }
  }, [productId]); // Depend vào productId để re-fetch nếu ID thay đổi

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const calculateDiscountPrice = (price, discount) => {
    return Math.round(price * (1 - discount / 100));
  };

  // Derived values (images, prices) - compute before any early returns so hooks stay ordered
  const discountedPrice = calculateDiscountPrice(
    product?.price || 0,
    product?.discount || 0
  );

  // Build images array prioritizing selectedVersion.picture, then versions[].picture, then product.image
  // Normalize images: backend may return arrays or single-string fields.
  const images = useMemo(() => {
    // helper: accept string, object, or array -> return string URL or null
    const toUrl = (item) => {
      if (!item) return null;
      if (typeof item === "string") return item;
      if (typeof item === "object") {
        // common fields where URL may be stored
        return (
          item.image ||
          item.url ||
          item.src ||
          item.path ||
          item.link ||
          item.href ||
          item.publicUrl ||
          null
        );
      }
      return null;
    };

    // selectedVersion.picture/images may be array/string/object
    const sv = selectedVersion?.picture ?? selectedVersion?.images;
    if (Array.isArray(sv)) {
      const arr = sv.map(toUrl).filter(Boolean);
      if (arr.length) return arr;
    } else {
      const url = toUrl(sv);
      if (url) return [url];
    }

    // collect pictures from all versions (they may be arrays/strings/objects)
    const versionPics = (product?.versions || [])
      .flatMap((v) => {
        const p = v.picture ?? v.images;
        if (!p) return [];
        if (Array.isArray(p)) return p.map(toUrl).filter(Boolean);
        const single = toUrl(p);
        return single ? [single] : [];
      })
      .filter(Boolean);
    if (versionPics.length) return versionPics;

    // product.image / product.picture may be array/string/object
    const prodImg =
      product?.image ?? product?._raw?.picture ?? product?.picture;
    if (Array.isArray(prodImg)) {
      const arr = prodImg.map(toUrl).filter(Boolean);
      if (arr.length) return arr;
    } else {
      const url = toUrl(prodImg);
      if (url) return [url];
    }

    return ["https://via.placeholder.com/400?text=No+Image"];
  }, [product, selectedVersion]);

  const currentPrice = selectedVersion?.price || product?.price || 0;
  const currentDiscountedPrice = calculateDiscountPrice(
    currentPrice,
    selectedVersion?.discount || product?.discount || 0
  );

  // Reset image index when selected version or product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [images]);

  // Debug: log images and current index to inspect values
  useEffect(() => {
    try {
      console.log("ProductDetail - images array:", images);
      console.log("ProductDetail - currentImageIndex:", currentImageIndex);
      console.log(
        "ProductDetail - current image src:",
        images?.[currentImageIndex]
      );
    } catch (err) {
      console.warn("ProductDetail log error:", err);
    }
  }, [images, currentImageIndex]);

  // Search version helper - calls productWorker.fetchSearchProductVersion
  const searchVersion = async () => {
    try {
      const v = await productWorker.fetchSearchProductVersion(
        product.name,
        selectedRom,
        selectedRam,
        selectedColor
      );
      if (v) {
        setSelectedVersion(v);
        return v;
      }

      // Fallback to local match
      const found = product.versions.find(
        (ver) =>
          (selectedRam ? ver.ram === selectedRam : true) &&
          (selectedRom ? ver.rom === selectedRom : true) &&
          (selectedColor ? ver.color === selectedColor : true)
      );
      if (found) setSelectedVersion(found);
      return found || null;
    } catch (err) {
      console.warn("Version search failed, falling back to local match", err);
      const found = product.versions.find(
        (ver) =>
          (selectedRam ? ver.ram === selectedRam : true) &&
          (selectedRom ? ver.rom === selectedRom : true) &&
          (selectedColor ? ver.color === selectedColor : true)
      );
      if (found) setSelectedVersion(found);
      return found || null;
    }
  };
  // === ADD TO CART ===
 const handleAddToCart = async () => {
  try {
    if (!selectedVersion?.id) {
      alert("Không có phiên bản hợp lệ!");
      return;
    }

    console.log("CALL ADD TO CART:", selectedVersion.id);

    const res = await cartService.addToCart(selectedVersion.id, 1);

    alert("Đã thêm vào giỏ hàng!");
  } catch (err) {
    console.log("Add to cart error:", err);
    alert("Không thể thêm vào giỏ hàng.");
  }
};





  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600 mb-4">{error}</div>
        <button
          onClick={() => fetchProductDetail(productId)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Không tìm thấy sản phẩm</div>
        <button
          onClick={() => fetchProductDetail(productId)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ml-4"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <button className="text-blue-600 hover:text-blue-700 font-medium"
            onClick={() => navigate('/products')}>
            ← Quay lại
          </button>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Product Title & Rating */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Điện thoại {product.name}
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{product.rating}</span>
              <span className="text-gray-500">
                ({product.reviewCount} đánh giá)
              </span>
            </div>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""
                  }`}
              />
              <span>Yêu thích</span>
            </button>
            <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span>Hỏi đáp</span>
            </button>
            <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Thông số</span>
            </button>
            <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                />
              </svg>
              <span>So sánh</span>
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left - Images */}
          <div className="lg:col-span-2">
            {currentImageIndex === 0 ? (
              <div className="bg-gradient-to-br from-pink-200 via-rose-200 to-orange-200 rounded-2xl p-8 h-[500px] flex flex-col justify-between">
                {/* Main Image (first) */}
                <div className="bg-white rounded-xl p-6 mb-4 flex-1 flex items-center justify-center">
                  <img
                    src={images[currentImageIndex]}
                    alt={product.name}
                    className="max-w-full max-h-[280px] object-contain"
                  />
                </div>

                {/* Feature Highlights (only on first image) */}
                <div className="text-white text-l">
                  <h3 className="text-sm font-semibold mb-2">
                    TÍNH NĂNG NỔI BẬT
                  </h3>
                  <ul className="space-y-1 text-[10px]">
                    <li className="flex items-start gap-2">
                      <span className="text-white">●</span>
                      <span>
                        {product.name} có thiết kế titan nhẹ và bền bỉ, với màn
                        hình Super Retina XDR{" "}
                        {product.specifications?.["Screen Size"]} lớn hơn.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white">●</span>
                      <span>
                        Tính năng Điều Khiển Camera cho phép truy cập nhanh các
                        công cụ như thu phóng, giúp chụp ảnh dễ dàng.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white">●</span>
                      <span>
                        Camera Ultra Wide 48MP ghi lại chi tiết sắc nét, trong
                        khi camera Telephoto 5x chụp xa ấn tượng.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              // Non-first images: consistent height with first section
              <div className="bg-white rounded-2xl p-8 h-[500px] flex items-center justify-center border-2 border-gray-100">
                <img
                  src={images[currentImageIndex]}
                  alt={product.name}
                  className="max-w-full max-h-[420px] object-contain"
                />
              </div>
            )}

            {/* Thumbnail Images with Smooth Scroll */}
            {images.length > 1 && (
              <div className="relative mt-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newIndex =
                        currentImageIndex === 0
                          ? images.length - 1
                          : currentImageIndex - 1;
                      setCurrentImageIndex(newIndex);
                    }}
                    className="p-2 bg-white rounded-lg shadow hover:shadow-md hover:bg-gray-50 transition-all duration-200 flex-shrink-0"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div
                    className="flex-1 overflow-hidden"
                    ref={(el) => {
                      if (el && images.length > 0) {
                        const containerWidth = el.offsetWidth;
                        const imageWidth = 112; // 96px (w-24) + 12px (gap-3)
                        const visibleImages = Math.floor(
                          containerWidth / imageWidth
                        );
                        const maxScroll = Math.max(
                          0,
                          images.length - visibleImages
                        );

                        // Lưu giá trị này để sử dụng trong style
                        el.dataset.maxScroll = maxScroll.toString();
                      }
                    }}
                  >
                    <div
                      className="flex gap-3 transition-transform duration-300 ease-in-out"
                      style={{
                        transform: `translateX(-${(() => {
                          const container = document.querySelector(
                            ".flex-1.overflow-hidden"
                          );
                          if (!container) return currentImageIndex * 50;

                          const maxScroll = parseInt(
                            container.dataset.maxScroll || "0"
                          );
                          const scrollPosition = Math.min(
                            currentImageIndex,
                            maxScroll
                          );
                          return scrollPosition * 98;
                        })()}px)`,
                      }}
                    >
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-24 h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${currentImageIndex === idx
                            ? "border-blue-600 shadow-md scale-105 opacity-100"
                            : "border-gray-200 hover:border-gray-300 opacity-40 hover:opacity-70"
                            }`}
                        >
                          <img
                            src={img}
                            alt={`View ${idx + 1}`}
                            className="w-full h-full object-contain bg-gray-50"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newIndex =
                        currentImageIndex === images.length - 1
                          ? 0
                          : currentImageIndex + 1;
                      setCurrentImageIndex(newIndex);
                    }}
                    className="p-2 bg-white rounded-lg shadow hover:shadow-md hover:bg-gray-50 transition-all duration-200 flex-shrink-0"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                {/* Image Counter */}
                <div className="text-center mt-3 text-sm text-gray-500">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>
            )}
            {/* </div>
</div> */}
            {/* Cam kết sản phẩm */}
            <div className="mt-6 bg-white rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-3">Cam kết sản phẩm</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>
                    Bảo hành chính hãng{" "}
                    {product.specifications?.["Warranty Period"]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Hỗ trợ 1 đổi 1 trong 30 ngày</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Miễn phí vận chuyển toàn quốc</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Product Info */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-6">
              {/* Price Box */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Giá sản phẩm</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatPrice(currentDiscountedPrice)}
                    </p>
                    {(selectedVersion?.discount || product.discount) > 0 && (
                      <p className="text-sm text-gray-400 line-through">
                        {formatPrice(currentPrice)}
                      </p>
                    )}
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">
                      Thu cũ lên đời chi từ
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(currentDiscountedPrice - 2000000)}
                    </p>
                    <button className="text-sm text-red-600 font-medium mt-1">
                      Trợ giá đến 2.000.000{" "}
                      <span className="text-blue-600">Định giá ngay →</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Versions (dynamic filtering) */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Phiên bản</h3>

                {product.versions && product.versions.length > 0 && (() => {
                  // Filter available versions based on current selections
                  const filteredVersions = product.versions.filter(v => {
                    if (selectedRam && v.ram !== selectedRam) return false;
                    if (selectedRom && v.rom !== selectedRom) return false;
                    if (selectedColor && v.color !== selectedColor) return false;
                    return true;
                  });

                  // Get available options from filtered versions
                  const availableRams = new Set(filteredVersions.map(v => v.ram));
                  const availableRoms = new Set(filteredVersions.map(v => v.rom));
                  const availableColors = new Set(filteredVersions.map(v => v.color));

                  // Get all possible options
                  const allRams = Array.from(new Set(product.versions.map(v => v.ram)));
                  const allRoms = Array.from(new Set(product.versions.map(v => v.rom)));
                  const allColors = Array.from(new Set(product.versions.map(v => v.color)));

                  // Handle selection and auto-update
                  const handleSelect = (type, value) => {
                    let newRam = selectedRam;
                    let newRom = selectedRom;
                    let newColor = selectedColor;

                    if (type === 'ram') newRam = selectedRam === value ? null : value;
                    if (type === 'rom') newRom = selectedRom === value ? null : value;
                    if (type === 'color') newColor = selectedColor === value ? null : value;

                    setSelectedRam(newRam);
                    setSelectedRom(newRom);
                    setSelectedColor(newColor);

                    // Auto-find matching version
                    const match = product.versions.find(v => {
                      if (newRam && v.ram !== newRam) return false;
                      if (newRom && v.rom !== newRom) return false;
                      if (newColor && v.color !== newColor) return false;
                      return true;
                    });

                    if (match) {
                      setSelectedVersion(match);
                    } else if (!newRam && !newRom && !newColor) {
                      setSelectedVersion(product.versions[0]);
                    }
                  };

                  return (
                    <div className="space-y-3">
                      {/* <div>
                        <div className="text-sm text-gray-600 mb-2">RAM</div>
                        <div className="flex flex-wrap gap-2">
                          {allRams.map((r) => {
                            const isAvailable = availableRams.has(r);
                            const isSelected = selectedRam === r;
                            return (
                              <button
                                key={r}
                                onClick={() => isAvailable && handleSelect('ram', r)}
                                disabled={!isAvailable}
                                className={`px-3 py-2 rounded-lg border-2 transition ${
                                  isSelected 
                                    ? "border-red-600 bg-red-50" 
                                    : isAvailable
                                    ? "border-gray-200 hover:border-gray-300"
                                    : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"
                                }`}
                              >
                                {r}
                              </button>
                            );
                          })}
                        </div>
                      </div> */}
                      <div>
                        <div className="text-sm text-gray-600 mb-2">ROM</div>
                        <div className="flex flex-wrap gap-2">
                          {allRoms.map((r) => {
                            const isAvailable = availableRoms.has(r);
                            const isSelected = selectedRom === r;
                            return (
                              <button
                                key={r}
                                onClick={() => isAvailable && handleSelect('rom', r)}
                                disabled={!isAvailable}
                                className={`px-5 py-3 rounded-xl text-base border-2 transition ${isSelected
                                  ? "border-red-600 bg-red-50"
                                  : isAvailable
                                    ? "border-gray-200 hover:border-gray-300"
                                    : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"
                                  }`}
                              >
                                {r}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-600 mb-2">Màu sắc</div>
                        <div className="flex flex-wrap gap-2">
                          {allColors.map((c) => {
                            const isAvailable = availableColors.has(c);
                            const isSelected = selectedColor === c;
                            return (
                              <button
                                key={c}
                                onClick={() => isAvailable && handleSelect('color', c)}
                                disabled={!isAvailable}
                                className={`px-5 py-3 rounded-xl text-base border-2 transition ${isSelected
                                  ? "border-red-600 bg-red-50"
                                  : isAvailable
                                    ? "border-gray-200 hover:border-gray-300"
                                    : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"
                                  }`}
                              >
                                {c}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Show currently selected version */}
                      {/* {selectedVersion && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-900">
                            {selectedVersion.ram} / {selectedVersion.rom} / {selectedVersion.color}
                          </div>
                          <div className="text-lg font-bold text-red-600 mt-1">
                            {formatPrice(selectedVersion.price)}
                          </div>
                        </div>
                      )} */}
                    </div>
                  );
                })()}
              </div>

              {/* Smember Savings */}
              <div className="bg-red-50 rounded-lg p-4 flex items-center gap-3 mb-6">
                <div className="bg-red-600 text-white p-2 rounded-lg">
                  <Gift className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">
                    Tiết kiệm thêm đến{" "}
                    <span className="font-bold text-red-600">306.000đ</span> cho
                    Smember
                  </p>
                </div>
                <button className="text-red-600 font-medium">
                  Kiểm tra giá cuối →
                </button>
              </div>

              {/* Promotions (hardcode vì không có trong data, có thể fetch riêng) */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-gray-900">
                    Khuyến mãi hấp dẫn
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div className="text-sm text-gray-700 flex-1">
                      Đặc quyền trợ giá lên đến 3 triệu khi thu cũ lên đời
                      iPhone{" "}
                      <button className="text-blue-600 font-medium ml-1">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div className="text-sm text-gray-700 flex-1">
                      Giảm ngay 5% tối đa 500k mua Apple Watch/Airpods khi mua
                      iPhone{" "}
                      <button className="text-blue-600 font-medium ml-1">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                  {/* Thêm các promo khác nếu cần */}
                </div>
              </div>

              {/* Installment */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-gray-900">
                    Trả góp 0% lãi suất
                  </h3>
                </div>
                <p className="text-sm text-gray-700">
                  Trả trước từ 10% qua công ty tài chính hoặc 0đ qua thẻ tín
                  dụng. Kỳ hạn đến 12 tháng.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2">
                  MUA NGAY
                  <span className="text-sm font-normal">(Giao tận nơi)</span>
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-6 h-6" />
                  THÊM VÀO GIỎ
                </button>



              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <button className="border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-medium hover:bg-blue-50 transition">
                  TRẢ GÓP 0% (Duyệt nhanh)
                </button>
                <button className="border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-medium hover:bg-blue-50 transition">
                  MUA TẠI CỬA HÀNG
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Promotional Banner */}
        {/* <div className="mt-6">
          <img
            src="https://via.placeholder.com/1200x150/ff1493/ffffff?text=Chào+Bạn+Mới+-+Giảm+thêm+300k+-+Nhận+ngay"
            alt="Promotion"
            className="w-full rounded-xl"
          />
        </div> */}
      </div>
    </div>
  );
};

export default ProductDetailPage;
