import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Truck, X, ShoppingBag, Smartphone, Plus, Minus, CreditCard } from "lucide-react";

// Mock cartService để demo
const cartService = {
  getCart: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      success: true,
      cartItems: [
        {
          imei: "352094087982341",
          productId: "ip15pm-256",
          productName: "iPhone 15 Pro Max 256GB",
          image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80",
          price: 29990000,
          quantity: 1
        },
        {
          imei: "352094087982342",
          productId: "ss-s24u-512",
          productName: "Samsung Galaxy 10 Ultra 1GB",
          image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
          price: 9000000,
          quantity: 1
        }
      ]
    };
  },
  removeByImei: async (imei) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },
  updateQuantity: async (imei, quantity) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  }
};

// Format tiền VND
const vnd = (n) =>
  new Intl.NumberFormat("vi-VN", { 
    style: "currency", 
    currency: "VND", 
    maximumFractionDigits: 0 
  }).format(Number.isFinite(n) ? n : 0);

export default function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [removingImei, setRemovingImei] = useState(null);
  const [updatingImei, setUpdatingImei] = useState(null);

  // Lấy giỏ hàng
  const loadCart = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await cartService.getCart();
      if (data?.success) {
        setItems(data.cartItems || []);
      } else {
        setErr(data?.message || "Không lấy được giỏ hàng");
      }
    } catch (e) {
      setErr(e.message || "Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Cập nhật số lượng
  const updateQuantity = async (imei, delta) => {
    const item = items.find(x => x.imei === imei);
    if (!item) return;
    
    const newQuantity = (item.quantity || 1) + delta;
    if (newQuantity < 1) return;
    
    try {
      setUpdatingImei(imei);
      setItems(prev => prev.map(x => 
        x.imei === imei ? { ...x, quantity: newQuantity } : x
      ));
      
      const res = await cartService.updateQuantity(imei, newQuantity);
      if (!res?.success) {
        setItems(prev => prev.map(x => 
          x.imei === imei ? { ...x, quantity: item.quantity } : x
        ));
        setErr(res?.message || "Không cập nhật được số lượng");
      }
    } catch (e) {
      setItems(prev => prev.map(x => 
        x.imei === imei ? { ...x, quantity: item.quantity } : x
      ));
      setErr(e.message || "Lỗi mạng");
    } finally {
      setUpdatingImei(null);
    }
  };

  // Xóa sản phẩm
  const removeItem = async (imei) => {
    try {
      setRemovingImei(imei);
      const res = await cartService.removeByImei(imei);
      if (res?.success) {
        setItems(prev => prev.filter(x => x.imei !== imei));
      } else {
        setErr(res?.message || "Không xóa được sản phẩm");
      }
    } catch (e) {
      setErr(e.message || "Lỗi mạng");
    } finally {
      setRemovingImei(null);
    }
  };

  // Tính toán
  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.price) || 0) * (it.quantity || 1), 0),
    [items]
  );
  const shippingFee = subtotal >= 10000000 ? 0 : 30000;
  const total = subtotal + shippingFee;
  const freeShipProgress = Math.min((subtotal / 10000000) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => window.history.back()}
            className="p-2.5 hover:bg-white rounded-xl transition-all duration-200 hover:shadow-sm group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <ShoppingBag className="w-7 h-7 lg:w-8 lg:h-8 text-blue-600" />
              Giỏ hàng của bạn
            </h1>
            {items.length > 0 && (
              <p className="text-sm text-slate-600 mt-1">
                {items.length} sản phẩm
              </p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {err && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 flex items-center gap-2">
            <span className="text-red-600">⚠</span>
            <span>{err}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left - Items & Shipping Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Free Shipping Banner */}
            {items.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2.5 rounded-lg">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Miễn phí vận chuyển
                      </p>
                      <p className="text-sm text-slate-700 mt-0.5">
                        {freeShipProgress >= 100 
                          ? '🎉 Bạn được freeship!' 
                          : `Mua thêm ${vnd(10000000 - subtotal)} để được freeship`
                        }
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    freeShipProgress >= 100 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {freeShipProgress >= 100 ? '✓ Đạt' : `${Math.round(freeShipProgress)}%`}
                  </span>
                </div>
                <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      freeShipProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${freeShipProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-600">Đang tải giỏ hàng...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                  <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Giỏ hàng trống
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                    Khám phá sản phẩm
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.imei}
                    className={`group relative bg-white rounded-xl p-4 lg:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 ${
                      removingImei === item.imei ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-xl flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 overflow-hidden">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.productName} 
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Smartphone className="w-12 h-12 text-slate-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base lg:text-lg text-slate-900 mb-2 line-clamp-2">
                          {item.productName || "Sản phẩm"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                            IMEI: {item.imei}
                          </span>
                          <span className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
                            Chính hãng
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div>
                            <div className="text-xl lg:text-2xl font-bold text-blue-600">
                              {vnd(item.price)}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-xs text-slate-500 mt-1">
                                {vnd(item.price)} x {item.quantity}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item.imei, -1)}
                                disabled={item.quantity <= 1 || updatingImei === item.imei}
                                className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                title="Giảm số lượng"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-semibold text-slate-900">
                                {item.quantity || 1}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.imei, +1)}
                                disabled={updatingImei === item.imei}
                                className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                title="Tăng số lượng"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeItem(item.imei)}
                              disabled={removingImei === item.imei}
                              className="flex items-center gap-1 text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
                              title="Xóa khỏi giỏ"
                            >
                              {removingImei === item.imei ? (
                                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <X className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:sticky lg:top-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-600" />
                Tổng đơn hàng
              </h2>

              <div className="space-y-4 border-b border-slate-200 pb-5 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Tạm tính</span>
                  <span className="font-semibold text-slate-900">{vnd(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    Phí vận chuyển
                  </span>
                  <span className={`font-semibold ${shippingFee === 0 ? 'text-green-600' : 'text-slate-900'}`}>
                    {shippingFee === 0 ? 'Miễn phí' : vnd(shippingFee)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 bg-slate-50 rounded-lg p-4">
                <span className="text-lg font-bold text-slate-900">Tổng cộng</span>
                <span className="text-2xl font-bold text-blue-600">{vnd(total)}</span>
              </div>

              <button 
                disabled={items.length === 0 || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/30 disabled:shadow-none flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Thanh toán ngay
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                Miễn phí đổi trả trong 7 ngày
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}