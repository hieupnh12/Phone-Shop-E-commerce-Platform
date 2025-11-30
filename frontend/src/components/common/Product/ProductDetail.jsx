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
import Toast from "../../../components/common/Toast";
import { X, Smartphone, Camera, Cpu, Battery, Monitor, Zap, Shield, HardDrive, Palette } from 'lucide-react';
import ProductFeedback from "../../../components/common/Product/feedBackProduct";

const ProductDetailPage = () => {
  const [toast, setToast] = useState(null);
  const [product, setProduct] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [selectedRam, setSelectedRam] = useState(null);
  const [selectedRom, setSelectedRom] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState(null);
  // THÊM MỚI: State cho popup specs
  const [isOpen, setIsOpen] = useState(false);
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
        const defaultVersion = data.versions[0];
        setSelectedVersion(defaultVersion); // Chọn version đầu tiên mặc định
        // THÊM MỚI: Tự động set selected options từ default version để highlight ROM/Color
        setSelectedRam(defaultVersion.ram || null);
        setSelectedRom(defaultVersion.rom || null);
        setSelectedColor(defaultVersion.color || null);
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

  // FIX: Thêm useEffect để auto-update selectedVersion khi selections thay đổi (đề phòng async)
  useEffect(() => {
    if (!product?.versions?.length) return;

    const match = product.versions.find((v) =>
      (!selectedRam || v.ram === selectedRam) &&
      (!selectedRom || v.rom === selectedRom) &&
      (!selectedColor || v.color === selectedColor)
    );

    if (match) {
      setSelectedVersion(match);
    } else if (!selectedRam && !selectedRom && !selectedColor) {
      setSelectedVersion(product.versions[0]);
    }
    // Nếu không match, giữ version cũ hoặc fallback default (không set toast ở đây)
  }, [selectedRam, selectedRom, selectedColor, product]);

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
        setToast({
          type: "error",
          message: "Không tìm thấy phiên bản hợp lệ",
        });
        return;
      }

      console.log("CALL ADD TO CART:", selectedVersion.id);

      const res = await cartService.addToCart(selectedVersion.id, 1);

      setToast({
        type: "success",
        message: "Đã thêm vào giỏ hàng!",
      });
    } catch (err) {
      console.log("Add to cart error:", err);
      setToast({
        type: "error",
        message: "Không thể thêm vào giỏ hàng ",
      });
    }
  };

  // FIXED: Enhanced handleSelect - on conflict, reset other options and auto-set to available match
  const handleSelect = (type, value) => {
    // Determine if toggling (unselect if already selected)
    const isUnselecting = 
      (type === "ram" && selectedRam === value) ||
      (type === "rom" && selectedRom === value) ||
      (type === "color" && selectedColor === value);

    let tentativeRam = selectedRam;
    let tentativeRom = selectedRom;
    let tentativeColor = selectedColor;

    if (type === "ram") {
      tentativeRam = isUnselecting ? null : value;
    } else if (type === "rom") {
      tentativeRom = isUnselecting ? null : value;
    } else if (type === "color") {
      tentativeColor = isUnselecting ? null : value;
    }

    // Step 1: Try full tentative match
    let match = product.versions.find((v) =>
      (!tentativeRam || v.ram === tentativeRam) &&
      (!tentativeRom || v.rom === tentativeRom) &&
      (!tentativeColor || v.color === tentativeColor)
    );

    if (!match) {
      // Step 2: Conflict - reset OTHER options to null, keep the new one, find match
      let resetRam = type === "ram" ? tentativeRam : null;
      let resetRom = type === "rom" ? tentativeRom : null;
      let resetColor = type === "color" ? tentativeColor : null;

      // If unselecting and all would be null, fallback to default
      if (isUnselecting && !resetRam && !resetRom && !resetColor) {
        setSelectedRam(null);
        setSelectedRom(null);
        setSelectedColor(null);
        setSelectedVersion(product.versions[0]);
        return;
      }

      match = product.versions.find((v) =>
        (!resetRam || v.ram === resetRam) &&
        (!resetRom || v.rom === resetRom) &&
        (!resetColor || v.color === resetColor)
      );

      if (match) {
        // Auto-set the reset options to matched version's values
        setSelectedRam(resetRam || match.ram);
        setSelectedRom(resetRom || match.rom);
        setSelectedColor(resetColor || match.color);
        setSelectedVersion(match);
        console.log("Auto-adjusted to available combination:", match);
        return;
      } else {
        // Step 3: Still no match - toast and revert
        setToast({
          type: "error",
          message: "Phiên bản không có sẵn! Vui lòng thử lựa chọn khác.",
        });
        console.log("Reverted: No match even after reset");
        return;
      }
    }

    // Step 4: Full match - set normally
    setSelectedRam(tentativeRam);
    setSelectedRom(tentativeRom);
    setSelectedColor(tentativeColor);
    setSelectedVersion(match);
  };


const ProductSpecsPopup = ({ product, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = React.useState('screen');

  if (!isOpen || !product) return null;

  const tabs = [
    { id: 'screen', label: 'Màn hình', icon: Monitor },
    { id: 'camera', label: 'Camera sau', icon: Camera },
    { id: 'cameraSelf', label: 'Camera trước', icon: Camera },
    { id: 'processor', label: 'Vi xử lý & đồ họa', icon: Cpu },
    { id: 'connection', label: 'Giao tiếp & kết nối', icon: Zap },
    { id: 'memory', label: 'RAM & Bộ nhớ', icon: HardDrive },
  ];

  const specsByTab = {
    screen: [
      { label: 'Kích thước màn hình', value: product.specifications?.['Screen Size' ]  + ' inches'|| 'null' },
      { label: 'Công nghệ màn hình', value: product.specifications?.['Screen Technology'] || 'null' },
      { label: 'Độ phân giải màn hình', value: product.specifications?.['Screen Resolution'] + ' pixels'|| 'null' },
      { label: 'Tính năng màn hình', value: 'Dynamic Island\nMàn hình Luôn Bật\nCông nghệ ProMotion với tốc độ làm mới thích ứng lên đến 120Hz\nMàn hình HDR\nTrue Tone\nDải màu rộng (P3)\nHaptic Touch\nTỷ lệ tương phản 2.000.000:1' },
      { label: 'Tần số quét', value: product.specifications?.['Scan Frequency'] || 'null' },
      { label: 'Kiểu màn hình', value: 'Dynamic Island' },
    ],
    camera: [
      { label: 'Camera sau', value: product.specifications?.['Rear Camera'] || 'Camera chính: 48MP, ƒ/1.78, 24mm, 2μm, chống rung quang học dịch chuyển cảm biến thế hệ thứ hai, Focus Pixels 100%' },
      { label: 'Quay video', value: '1080p@25fps, 1080p@30 fps, 1080p@60 fps hoặc 1080p@120 fps\n720p@30 fps' },
      { label: 'Tính năng camera', value: 'Flash True Tone\nPhotonic Engine\nDeep Fusion' },
    ],
    cameraSelf: [
      { label: 'Camera trước', value: 'Telephoto 2x 12MP: 52 mm, ƒ/1.6\nCamera góc siêu rộng: 48MP, 13 mm,ƒ/2.2 và trường ảnh 120°, Hybrid Focus Pixels, ảnh có độ phân giải' },
    ],
    processor: [
      { label: 'Chipset', value: product.specifications?.Chipset || 'Apple A17 Pro' },
      { label: 'Loại CPU', value: 'Apple A17 Pro 6 nhân' },
      { label: 'GPU', value: 'Apple GPU 6 nhân' },
    ],
    connection: [
      { label: 'Mạng di động', value: '5G' },
      { label: 'SIM', value: '2 SIM (nano‑SIM và eSIM)' },
      { label: 'Wifi', value: 'Wi‑Fi 6E (802.11ax)' },
      { label: 'Bluetooth', value: 'v5.3' },
      { label: 'Cổng kết nối/sạc', value: 'Type-C' },
      { label: 'Jack tai nghe', value: 'Type-C' },
      { label: 'Kết nối khác', value: 'NFC, OTG' },
    ],
    memory: [
      { label: 'Dung lượng RAM', value: product.versions?.[0]?.ram || '8 GB' },
      { label: 'Bộ nhớ trong', value: product.versions?.[0]?.rom || '256 GB' },
      { label: 'Bộ nhớ còn lại', value: 'Khoảng 245 GB' },
      { label: 'Danh bạ', value: 'Không giới hạn' },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Thông số kỹ thuật</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Product Info */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center gap-4">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-600">
                {product.brand} • {product.origin}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-white ">
          <div className="flex px-6 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {specsByTab[activeTab]?.map((spec, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <span className="text-sm font-semibold text-gray-700 min-w-[200px]">
                    {spec.label}
                  </span>
                  <span className="text-sm text-gray-900 flex-1 whitespace-pre-line">
                    {spec.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info for Screen tab */}
          {activeTab === 'screen' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Thông tin bổ sung
              </h4>
              <ul className="text-sm text-blue-800 space-y-1 ml-7">
                <li>• Màn hình Super Retina XDR với công nghệ OLED tiên tiến</li>
                <li>• Dynamic Island tích hợp linh hoạt</li>
                <li>• ProMotion với tần số quét lên đến 120Hz</li>
                <li>• Độ sáng tối đa 2000 nits ngoài trời</li>
              </ul>
            </div>
          )}

          {/* Warranty Info */}
          {activeTab === 'connection' && product.specifications?.['Warranty Period'] && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Bảo hành
              </h4>
              <p className="text-sm text-green-800">
                Thời gian bảo hành: {product.specifications['Warranty Period']}
              </p>
            </div>
          )}

          {/* Version Info */}
          {activeTab === 'memory' && product.versions && product.versions.length > 0 && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Các phiên bản có sẵn
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.versions.map((version, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-gray-900">
                        {version.ram} / {version.rom}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        version.stockQuantity > 0 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {version.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: version.color?.toLowerCase() }}
                        title={version.color}
                      />
                      <span className="text-gray-600">{version.color}</span>
                    </div>
                    <p className="text-sm font-semibold text-blue-600 mt-2">
                      {new Intl.NumberFormat('vi-VN').format(version.price)}đ
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Đóng
          </button>
          {/* <button
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
          >
            Thêm vào giỏ hàng
          </button> */}
        </div>
      </div>
    </div>
  );
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900">
        <div className="text-xl text-cyan-400">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900">
        <div className="text-xl text-red-400 mb-4">{error}</div>
        <button
          onClick={() => fetchProductDetail(productId)}
          className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900">
        <div className="text-xl text-cyan-100">Không tìm thấy sản phẩm</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Product Title & Rating */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Điện thoại {product.name}
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-cyan-100">
                {product.rating}
              </span>
              <span className="text-cyan-200/70">
                ({product.reviewCount} đánh giá)
              </span>
            </div>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Heart
                className={`w-5 h-5 transition-all ${
                  isFavorite ? "fill-red-500 text-red-500 scale-110" : ""
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


           
            {/* SỬA: Button để mở popup, sử dụng state mới */}
            <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
              onClick={() => setIsOpen(true)}
            >
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

        {/* THÊM MỚI: Render popup conditional, sử dụng product thực tế */}
        <ProductSpecsPopup
          product={product}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left - Images */}
          <div className="lg:col-span-2">
            {currentImageIndex === 0 ? (
              <div className="bg-gradient-to-br from-pink-200 via-rose-200 to-orange-200 rounded-2xl p-8 h-[500px] flex flex-col justify-between shadow-xl">
                <div className="bg-white rounded-xl p-6 mb-4 flex-1 flex items-center justify-center shadow-lg">
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
              <div className="bg-white rounded-2xl p-8 h-[500px] flex items-center justify-center shadow-xl">
                <img
                  src={images[currentImageIndex]}
                  alt={product.name}
                  className="max-w-full max-h-[420px] object-contain"
                />
              </div>
            )}

            {/* Thumbnail Images */}
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
                    className="p-2 bg-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex-shrink-0"
                  >
                    <ChevronLeft className="w-5 h-5 text-cyan-600" />
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
                          className={`w-24 h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
                            currentImageIndex === idx
                              ? "border-cyan-500 shadow-lg shadow-cyan-500/50 scale-105 opacity-100 ring-2 ring-cyan-400"
                              : "border-gray-300 hover:border-gray-400 opacity-50 hover:opacity-80 bg-white"
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
                    className="p-2 bg-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex-shrink-0"
                  >
                    <ChevronRight className="w-5 h-5 text-cyan-600" />
                  </button>
                </div>
                <div className="text-center mt-3 text-sm text-cyan-100">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>
            )}

            {/* Cam kết sản phẩm */}
            <div className="mt-6 bg-white rounded-xl p-4 shadow-lg">
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
                  <span>Miễn phí vận chuyển với đơn hàng  từ 300 000đ trở lên  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Product Info */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-6 shadow-xl">
  {/* Price Box */}
  <div className="bg-gradient-to-br from-gray-50 to-cyan-50 rounded-xl p-8 mb-6 border border-gray-200">
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-2 font-medium">Giá sản phẩm</p>
      <p className="text-4xl font-bold text-cyan-600 mb-2">
        {formatPrice(currentDiscountedPrice)}
      </p>
      {(selectedVersion?.discount || product.discount) > 0 && (
        <p className="text-base text-gray-400 line-through">
          {formatPrice(currentPrice)}
        </p>
      )}
    </div>
  </div>

              {/* Versions */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Phiên bản</h3>

                {product.versions &&
                  product.versions.length > 0 &&
                  (() => {
                    // FIX: Không dùng filteredVersions nữa, luôn dùng all options
                    // Get all possible options (không filter)
                    const allRams = Array.from(
                      new Set(product.versions.map((v) => v.ram))
                    );
                    const allRoms = Array.from(
                      new Set(product.versions.map((v) => v.rom))
                    );
                    const allColors = Array.from(
                      new Set(product.versions.map((v) => v.color))
                    );

                    return (
                      <div className="space-y-3">
                        {/* RAM (nếu dùng, uncomment) */}
                        {/* <div>
                          <div className="text-sm text-gray-600 mb-2">RAM</div>
                          <div className="flex flex-wrap gap-2">
                            {allRams.map((r) => {
                              const isSelected = selectedRam === r;
                              return (
                                <button
                                  key={r}
                                  onClick={() => handleSelect('ram', r)}
                                  className={`px-3 py-2 rounded-lg border-2 transition ${
                                    isSelected 
                                      ? "border-cyan-500 bg-cyan-50 text-cyan-700 shadow-lg font-semibold"
                                      : "border-gray-300 bg-white text-gray-700 hover:border-cyan-400 hover:bg-cyan-50/50"
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
                              const isSelected = selectedRom === r;
                              return (
                                <button
                                  key={r}
                                  onClick={() => handleSelect("rom", r)}
                                  className={`px-7 py-4 rounded-xl text-base border-2 transition-all ${
                                    isSelected
                                      ? "border-cyan-500 bg-cyan-50 text-cyan-700 shadow-lg font-semibold"
                                      : "border-gray-300 bg-white text-gray-700 hover:border-cyan-400 hover:bg-cyan-50/50"
                                  }`}
                                >
                                  {r}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <div className="font-bold text-gray-900 mb-3">
                            Màu sắc
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {allColors.map((c) => {
                              const isSelected = selectedColor === c;
                              return (
                                <button
                                  key={c}
                                  onClick={() => handleSelect("color", c)}
                                  className={`px-7 py-4 rounded-xl text-base border-2 transition-all ${
                                    isSelected
                                      ? "border-cyan-500 bg-cyan-50 text-cyan-700 shadow-lg font-semibold"
                                      : "border-gray-300 bg-white text-gray-700 hover:border-cyan-400 hover:bg-cyan-50/50"
                                  }`}
                                >
                                  {c}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Optional: Show current selection summary */}
                        {selectedVersion && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-900">
                              {selectedVersion.ram} / {selectedVersion.rom} / {selectedVersion.color}
                            </div>
                            <div className="text-lg font-bold text-red-600 mt-1">
                              {formatPrice(selectedVersion.price)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </div>

              {/* Smember Savings */}
              {/* <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 flex items-center gap-3 mb-6 border border-red-200">
                <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-2 rounded-lg shadow-lg">
                  <Gift className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">
                    Tiết kiệm thêm đến{" "}
                    <span className="font-bold text-red-600">306.000đ</span> cho
                    Smember
                  </p>
                </div>
                <button className="text-red-600 font-medium hover:text-red-700">
                  Kiểm tra giá cuối →
                </button>
              </div> */}

              {/* Promotions */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 mb-6 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">
                    Khuyến mãi hấp dẫn
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">
                      1
                    </div>
                    <div className="text-sm text-gray-700 flex-1">
                      Giúp hỗ trợ vẫn chuyển miễn phí trong phạm vi 20km {" "}
                      {/* <button className="text-blue-600 font-medium ml-1 hover:text-blue-700">
                        Xem chi tiết
                      </button> */}
                    </div>
                  </div>
                  {/* <div className="flex gap-3">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">
                      2
                    </div>
                    <div className="text-sm text-gray-700 flex-1">
                      Giảm ngay 5% tối đa 500k mua Apple Watch/Airpods khi mua
                      iPhone{" "}
                      <button className="text-blue-600 font-medium ml-1 hover:text-blue-700">
                        Xem chi tiết
                      </button>
                    </div>
                  </div> */}
                  {/* Thêm các promo khác nếu cần */}
                </div>
              </div>

              {/* Installment */}
              {/* <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200">
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
              </div> */}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={async () => {
                    if (!selectedVersion?.id) {
                      alert("Không tìm thấy phiên bản hợp lệ!");
                      return;
                    }

                    await cartService.addToCart(selectedVersion.id, 1);
                    navigate("/payment");
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2"
                >
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

              {/* <div className="grid grid-cols-2 gap-4 mt-3">
                <button className="border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-medium hover:bg-blue-50 transition-all">
                  TRẢ GÓP 0% (Duyệt nhanh)
                </button>
                <button className="border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-medium hover:bg-blue-50 transition-all">
                  MUA TẠI CỬA HÀNG
                </button>
              </div> */}
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type} 
          onClose={() => setToast(null)}
        />
      )}
            <ProductFeedback productId={productId} />

    </div>

  );
};

export default ProductDetailPage;