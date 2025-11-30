import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  X,
  ShoppingBag,
  Smartphone,
  Plus,
  Minus,
  CreditCard,
  CheckSquare,
  Square,
} from "lucide-react";
import cartService from "../../services/cartService";
import { useLanguage } from "../../contexts/LanguageContext";
import Toast from "../../components/common/Toast";

// Format tiền VND
const vnd = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);

// Giới hạn số lượng tối đa cho mỗi sản phẩm
const MAX_QUANTITY = 5;

export default function ShoppingCart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  // Lấy productVersionId cần tự động chọn từ navigation state (nếu có)
  const autoSelectProductVersionId = location.state?.autoSelectProductVersionId || null;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [removingProductVersionId, setRemovingProductVersionId] =
    useState(null);
  const [updatingProductVersionId, setUpdatingProductVersionId] =
    useState(null);
  // State để quản lý các sản phẩm được chọn để thanh toán
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [toast, setToast] = useState(null);

  // Lấy giỏ hàng
  const loadCart = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await cartService.getCart();
      if (data?.success) {
        // Map dữ liệu từ API về format cần thiết
        const mappedItems = (data.cartItems || []).map((item) => ({
          productVersionId: item.productVersionId,
          productId: item.productId,
          productName: item.productName,
          image: item.image,
          price: item.price,
          quantity: item.quantity || 1,
          stockQuantity: item.stockQuantity || 0, // Số lượng tồn kho
        }));
        setItems(mappedItems);
      } else {
        const errorMsg = data?.message || t('cart.failedLoad');
        setErr(errorMsg);
        setItems([]);
        setToast({
          type: 'error',
          message: errorMsg
        });
      }
    } catch (e) {
      const errorMsg = e.message || t('cart.networkError');
      setErr(errorMsg);
      setItems([]);
      setToast({
        type: 'error',
        message: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Khi items thay đổi, tự động chọn sản phẩm
  useEffect(() => {
    if (items.length > 0) {
      // Nếu có autoSelectProductVersionId (từ "Mua ngay"), chỉ chọn sản phẩm đó
      if (autoSelectProductVersionId) {
        const item = items.find((item) => item.productVersionId === autoSelectProductVersionId);
        if (item && (item.stockQuantity === undefined || item.quantity <= item.stockQuantity)) {
          // Chỉ chọn sản phẩm vừa thêm
          setSelectedItems(new Set([autoSelectProductVersionId]));
          // Xóa state để không tự động chọn lại lần sau
          window.history.replaceState({}, document.title);
        } else {
          // Nếu sản phẩm không hợp lệ, chọn tất cả sản phẩm hợp lệ
          const validItems = items.filter(
            (item) =>
              item.stockQuantity === undefined ||
              item.quantity <= item.stockQuantity
          );
          setSelectedItems(new Set(validItems.map((item) => item.productVersionId)));
        }
      } else {
        // Nếu không có autoSelectProductVersionId, chọn tất cả các sản phẩm hợp lệ
        const validItems = items.filter(
          (item) =>
            item.stockQuantity === undefined ||
            item.quantity <= item.stockQuantity
        );
        setSelectedItems(new Set(validItems.map((item) => item.productVersionId)));
      }
    }
  }, [items.length, autoSelectProductVersionId]); // Chạy khi items thay đổi hoặc có autoSelectProductVersionId

  // Toggle chọn/bỏ chọn sản phẩm
  const toggleItemSelection = (productVersionId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productVersionId)) {
        newSet.delete(productVersionId);
      } else {
        newSet.add(productVersionId);
      }
      return newSet;
    });
  };

  // Chọn tất cả / Bỏ chọn tất cả
  const toggleSelectAll = () => {
    const validItems = items.filter(
      (item) =>
        item.stockQuantity === undefined ||
        item.quantity <= item.stockQuantity
    );
    if (selectedItems.size === validItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(validItems.map((item) => item.productVersionId)));
    }
  };

  // Cập nhật số lượng
  const updateQuantity = async (productVersionId, delta) => {
    const item = items.find((x) => x.productVersionId === productVersionId);
    if (!item) return;

    const newQuantity = (item.quantity || 1) + delta;

    // Kiểm tra giới hạn tối thiểu và tối đa
    if (newQuantity < 1) return;
    if (newQuantity > MAX_QUANTITY) {
      const errorMsg = `Số lượng tối đa cho mỗi sản phẩm là ${MAX_QUANTITY}`;
      setErr(errorMsg);
      setToast({
        type: 'error',
        message: errorMsg
      });
      return;
    }

    // Kiểm tra số lượng tồn kho
    if (item.stockQuantity !== undefined && newQuantity > item.stockQuantity) {
      const errorMessage = `Sản phẩm "${item.productName}" chỉ còn ${item.stockQuantity} sản phẩm trong kho. Không thể tăng số lượng lên ${newQuantity}.`;
      console.warn('⚠️ Số lượng sản phẩm không đủ:', {
        productName: item.productName,
        requestedQuantity: newQuantity,
        availableStock: item.stockQuantity,
        currentQuantity: item.quantity
      });
      setErr(errorMessage);
      setToast({
        type: 'error',
        message: errorMessage
      });
      return;
    }

    try {
      setUpdatingProductVersionId(productVersionId);
      setErr(""); // Xóa lỗi trước đó
      setItems((prev) =>
        prev.map((x) =>
          x.productVersionId === productVersionId
            ? { ...x, quantity: newQuantity }
            : x
        )
      );

      const res = await cartService.updateQuantity(
        productVersionId,
        newQuantity
      );
      if (!res?.success) {
        setItems(prev => prev.map(x =>
          x.productVersionId === productVersionId ? { ...x, quantity: item.quantity } : x
        ));
        const errorMsg = res?.message || t('cart.failedUpdate');
        console.error('❌ Cập nhật số lượng thất bại:', {
          productVersionId,
          requestedQuantity: newQuantity,
          error: errorMsg,
          response: res
        });
        setErr(errorMsg);
        setToast({
          type: 'error',
          message: errorMsg
        });
      } else {
        console.log('✅ Cập nhật số lượng thành công:', {
          productName: item.productName,
          newQuantity,
          stockQuantity: item.stockQuantity
        });
      }
    } catch (e) {
      setItems(prev => prev.map(x =>
        x.productVersionId === productVersionId ? { ...x, quantity: item.quantity } : x
      ));
      const errorMsg = e.message || t('cart.networkError2');
      setErr(errorMsg);
      setToast({
        type: 'error',
        message: errorMsg
      });
    } finally {
      setUpdatingProductVersionId(null);
    }
  };

  // Xóa sản phẩm
  const removeItem = async (productVersionId) => {
    const item = items.find((x) => x.productVersionId === productVersionId);
    try {
      setRemovingProductVersionId(productVersionId);
      const res = await cartService.removeItem(productVersionId);
      if (res?.success) {
        setItems((prev) =>
          prev.filter((x) => x.productVersionId !== productVersionId)
        );
        setToast({
          type: 'success',
          message: `Đã xóa "${item?.productName || 'sản phẩm'}" khỏi giỏ hàng`
        });
      } else {
        const errorMsg = res?.message || t('cart.failedDelete');
        setErr(errorMsg);
        setToast({
          type: 'error',
          message: errorMsg
        });
      }
    } catch (e) {
      const errorMsg = e.message || t('cart.networkError2');
      setErr(errorMsg);
      setToast({
        type: 'error',
        message: errorMsg
      });
    } finally {
      setRemovingProductVersionId(null);
    }
  };

  // Tính toán chỉ dựa trên các sản phẩm được chọn
  const selectedItemsList = useMemo(
    () => items.filter((item) => selectedItems.has(item.productVersionId)),
    [items, selectedItems]
  );

  const subtotal = useMemo(
    () =>
      selectedItemsList.reduce(
        (sum, it) => sum + (Number(it.price) || 0) * (it.quantity || 1),
        0
      ),
    [selectedItemsList]
  );
  const FREE_SHIP_LIMIT = 1000;
  const shippingFee = subtotal >= FREE_SHIP_LIMIT ? 0 : 30000;
  const total = subtotal + shippingFee;
  const freeShipProgress = Math.min((subtotal / FREE_SHIP_LIMIT) * 100, 100);

  // Kiểm tra xem có sản phẩm nào hết hàng không
  const hasOutOfStockItems = items.some(
    (item) => item.stockQuantity !== undefined && item.quantity > item.stockQuantity
  );

  // Kiểm tra xem có sản phẩm nào được chọn không
  const hasSelectedItems = selectedItems.size > 0;

  // Xử lý thanh toán - chuyển đến trang payment với danh sách sản phẩm được chọn
  const handleCheckout = () => {
    if (!hasSelectedItems) {
      setToast({
        type: 'warning',
        message: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán'
      });
      return;
    }
    // Chuyển đến trang payment với state chứa danh sách productVersionId được chọn
    navigate('/user/payment', {
      state: {
        selectedProductVersionIds: Array.from(selectedItems)
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Cảnh báo tổng thể nếu có sản phẩm hết hàng */}
        {hasOutOfStockItems && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-red-600 font-bold text-xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-1">
                  Có sản phẩm không đủ hàng trong giỏ của bạn
                </h3>
                <p className="text-sm text-red-700">
                  Vui lòng điều chỉnh số lượng hoặc xóa sản phẩm hết hàng trước khi thanh toán
                </p>
              </div>
            </div>
          </div>
        )}

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
              {t('cart.cartOf')}
            </h1>
            {items.length > 0 && (
              <p className="text-sm text-slate-600 mt-1">
                {items.length} {t('cart.products')}
              </p>
            )}
          </div>
        </div>


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
                        {t('cart.freeShippingLabel')}
                      </p>
                      <p className="text-sm text-slate-700 mt-0.5">
                        {freeShipProgress >= 100
                          ? t('cart.freeshipReached')
                          : `${t('cart.buyMore').replace('{amount}', vnd(10000000 - subtotal))}`
                        }
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${freeShipProgress >= 100
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                    }`}>
                    {freeShipProgress >= 100 ? t('cart.achieved') : `${Math.round(freeShipProgress)}%`}
                  </span>
                </div>
                <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      freeShipProgress >= 100 ? "bg-green-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${freeShipProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Select All Checkbox */}
            {items.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-4">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-3 w-full text-left hover:bg-slate-50 rounded-lg p-2 transition-colors"
                >
                  {selectedItems.size === items.filter(
                    (item) =>
                      item.stockQuantity === undefined ||
                      item.quantity <= item.stockQuantity
                  ).length && selectedItems.size > 0 ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                  <span className="font-semibold text-slate-900">
                    Chọn tất cả ({selectedItems.size}/{items.length})
                  </span>
                </button>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-600">{t('cart.loadingCart')}</p>
                </div>
              ) : items.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                  <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {t('cart.empty')}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {t('cart.addProducts')}
                  </p>
                  <button
                    onClick={() => navigate("/user/products")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                  >
                    {t('cart.exploreProducts')}
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const isSelected = selectedItems.has(item.productVersionId);
                  const isOutOfStock = item.stockQuantity !== undefined && item.quantity > item.stockQuantity;
                  const canSelect = !isOutOfStock;
                  
                  return (
                  <div
                    key={item.productVersionId}
                    className={`group relative bg-white rounded-xl p-4 lg:p-5 border-2 shadow-sm hover:shadow-md transition-all duration-200 ${
                      removingProductVersionId === item.productVersionId
                        ? "opacity-50"
                        : isSelected
                        ? "border-blue-500 bg-blue-50/30"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      <div className="flex items-start pt-1">
                        <button
                          onClick={() => canSelect && toggleItemSelection(item.productVersionId)}
                          disabled={!canSelect}
                          className={`transition-all ${
                            canSelect
                              ? "cursor-pointer hover:scale-110"
                              : "cursor-not-allowed opacity-40"
                          }`}
                          title={
                            canSelect
                              ? isSelected
                                ? "Bỏ chọn sản phẩm"
                                : "Chọn sản phẩm để thanh toán"
                              : "Sản phẩm không đủ hàng, không thể chọn"
                          }
                        >
                          {isSelected && canSelect ? (
                            <CheckSquare className="w-6 h-6 text-blue-600" />
                          ) : (
                            <Square className="w-6 h-6 text-slate-400" />
                          )}
                        </button>
                      </div>

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
                          {item.productName || t('cart.product')}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
                            {t('cart.authentic')}
                          </span>
                          {item.stockQuantity !== undefined && (
                            <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-lg font-medium ${
                              item.stockQuantity > 0 
                                ? item.stockQuantity <= 5
                                  ? "bg-orange-50 text-orange-700"
                                  : "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}>
                              {item.stockQuantity > 0 
                                ? `Còn ${item.stockQuantity} sản phẩm`
                                : "Hết hàng"}
                            </span>
                          )}
                        </div>

                        {/* Cảnh báo hết hàng */}
                        {item.stockQuantity !== undefined && item.quantity > item.stockQuantity && (
                          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <span className="text-red-600 font-semibold text-sm">⚠️</span>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-red-700">
                                  Sản phẩm không đủ hàng
                                </p>
                                <p className="text-xs text-red-600 mt-1">
                                  Số lượng trong giỏ: <span className="font-semibold">{item.quantity}</span>
                                  {" • "}
                                  Số lượng tồn kho: <span className="font-semibold">{item.stockQuantity}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

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
                                onClick={() =>
                                  updateQuantity(item.productVersionId, -1)
                                }
                                disabled={
                                  item.quantity <= 1 ||
                                  updatingProductVersionId ===
                                    item.productVersionId
                                }
                                className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                title={t('cart.decreaseQuantity')}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-semibold text-slate-900">
                                {item.quantity || 1}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.productVersionId, +1)
                                }
                                disabled={
                                  updatingProductVersionId ===
                                    item.productVersionId ||
                                  (item.quantity || 1) >= MAX_QUANTITY ||
                                  (item.stockQuantity !== undefined && 
                                   (item.quantity || 1) >= item.stockQuantity)
                                }
                                className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                title={
                                  (item.quantity || 1) >= MAX_QUANTITY
                                    ? `Số lượng tối đa là ${MAX_QUANTITY}`
                                    : "Tăng số lượng"
                                }
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeItem(item.productVersionId)}
                              disabled={
                                removingProductVersionId ===
                                item.productVersionId
                              }
                              className="flex items-center gap-1 text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
                              title={t('cart.deleteFromCart')}
                            >
                              {removingProductVersionId ===
                              item.productVersionId ? (
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
                );
                })
              )}
            </div>
          </div>

          {/* Right - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:sticky lg:top-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-600" />
                {t('cart.orderSummary')}
              </h2>

              <div className="space-y-4 border-b border-slate-200 pb-5 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">{t('cart.subtotal')}</span>
                  <span className="font-semibold text-slate-900">{vnd(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    {t('cart.shippingFee')}
                  </span>
                  <span className={`font-semibold ${shippingFee === 0 ? 'text-green-600' : 'text-slate-900'}`}>
                    {shippingFee === 0 ? t('cart.freeShipping') : vnd(shippingFee)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 bg-slate-50 rounded-lg p-4">
                <span className="text-lg font-bold text-slate-900">{t('cart.total')}</span>
                <span className="text-2xl font-bold text-blue-600">{vnd(total)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!hasSelectedItems || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/30 disabled:shadow-none flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {hasSelectedItems
                  ? `${t('cart.paymentNow')} (${selectedItems.size} sản phẩm)`
                  : t('cart.paymentNow')}
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                {t('cart.returnPolicy')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
