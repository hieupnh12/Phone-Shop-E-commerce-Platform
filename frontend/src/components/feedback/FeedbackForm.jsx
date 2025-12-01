import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuthFullOptions } from '../../contexts/AuthContext';
import { Star, X, ChevronDown, PenLine } from 'lucide-react';
import feedbackService from '../../services/feedbackService';
import orderService from '../../services/orderService';

// StarRating Component
const StarRating = ({ rating, onRate, size = "medium", interactive = true }) => {
  const sizeClasses = {
    small: "w-5 h-5",
    medium: "w-8 h-8",
    large: "w-10 h-10",
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate(star)}
          className={`transition-transform duration-200 ${interactive ? "hover:scale-110" : "cursor-default"}`}
          disabled={!interactive}
        >
          <Star
            className={`${sizeClasses[size]} transition-colors ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-600"
            }`}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
};

const FeedbackForm = ({ productId, onSuccess, onClose }) => {
  const { t } = useLanguage();
  const authContext = useAuthFullOptions();
  const user = authContext?.user;
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(productId);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderProducts, setOrderProducts] = useState([]);
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [myFeedbackProducts, setMyFeedbackProducts] = useState(new Set());

  useEffect(() => {
    const loadMyFeedbacks = async () => {
      if (!user) return;
      try {
        const response = await feedbackService.getMyFeedbacks(0, 1000);
        const feedbackProductIds = new Set(
          (response.content || []).map(fb => fb.product_id)
        );
        setMyFeedbackProducts(feedbackProductIds);
      } catch (err) {
        console.error('Error loading my feedbacks:', err);
      }
    };
    loadMyFeedbacks();
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setLoadingOrders(true);
      try {
        const orders = await orderService.getCompletedOrders();
        setCompletedOrders(Array.isArray(orders) ? orders : []);
        if (!productId && orders.length > 0) {
          setSelectedOrder(orders[0]);
        }
      } catch (err) {
        console.error('Error loading orders:', err);
        setCompletedOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    load();
  }, [productId]);

  useEffect(() => {
    const load = async () => {
      if (selectedOrder?.orderId) {
        try {
          if (selectedOrder?.orderDetails && selectedOrder.orderDetails.length > 0) {
            const products = selectedOrder.orderDetails
              .filter(detail => !myFeedbackProducts.has(detail.productId))
              .map(detail => ({
                productId: detail.productId,
                nameProduct: detail.productName || 'Unknown Product'
              }));
            setOrderProducts(products);
            if (products.length > 0) {
              setSelectedProductId(products[0].productId);
            } else {
              setSelectedProductId(null);
            }
          } else {
            setOrderProducts([]);
            setSelectedProductId(null);
          }
        } catch (err) {
          console.error('Error loading order products:', err);
          setOrderProducts([]);
          setSelectedProductId(null);
        }
      }
    };
    load();
  }, [selectedOrder?.orderId, myFeedbackProducts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError(t('feedback.selectRating') || 'Vui lòng chọn đánh giá');
      return;
    }

    if (!content.trim()) {
      setError(t('feedback.enterContent') || 'Vui lòng nhập nội dung');
      return;
    }

    if (!selectedProductId && !productId) {
      setError('Vui lòng chọn sản phẩm');
      return;
    }

    setLoading(true);
    try {
      const finalProductId = selectedProductId || productId;
      await feedbackService.createFeedback({
        product_id: finalProductId,
        rate: rating,
        content: content.trim()
      });
      
      setMyFeedbackProducts(prev => new Set([...prev, finalProductId]));
      
      onSuccess?.();
      setRating(0);
      setContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedOrderName = () => {
    if (productId) return null;
    return selectedOrder ? `Đơn #${selectedOrder.orderId}` : 'Chọn đơn hàng';
  };

  const getSelectedProductName = () => {
    if (orderProducts.length === 0) return 'Chọn sản phẩm';
    const product = orderProducts.find(p => p.productId === selectedProductId);
    return product?.nameProduct || 'Chọn sản phẩm';
  };

  // If user is not logged in
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PenLine className="w-5 h-5 text-cyan-400" />
              {t('feedback.writeReview') || 'Viết đánh giá'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Đăng nhập để viết đánh giá</h3>
            <p className="text-slate-400 mb-6">Vui lòng đăng nhập để chia sẻ trải nghiệm của bạn</p>
            <a 
              href="/login" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 transition-colors font-semibold"
            >
              Đăng nhập ngay
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="w-full max-w-xl max-h-[90vh] bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <PenLine className="w-5 h-5 text-cyan-400" />
            {t('feedback.writeReview') || 'Đánh giá & nhận xét'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Order Selection */}
            {!productId && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Chọn đơn hàng</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowOrderDropdown(!showOrderDropdown)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl flex justify-between items-center hover:bg-slate-900/70 transition-colors text-white"
                    disabled={loadingOrders}
                  >
                    <span className={loadingOrders ? "text-slate-500" : "text-white"}>
                      {loadingOrders ? "Đang tải..." : getSelectedOrderName()}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showOrderDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showOrderDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto">
                      {completedOrders.length === 0 ? (
                        <div className="p-4 text-slate-400 text-sm text-center">Không có đơn hàng hoàn thành</div>
                      ) : (
                        completedOrders.map(order => (
                          <button
                            key={order.orderId}
                            type="button"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-700/50 text-sm border-b border-slate-700/50 last:border-b-0 transition-colors"
                          >
                            <div className="font-medium text-white">Đơn #{order.orderId}</div>
                            <div className="text-xs text-slate-400">{order.totalPrice?.toLocaleString()} VNĐ</div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Product Selection */}
            {!productId && selectedOrder && orderProducts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Chọn sản phẩm</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowProductDropdown(!showProductDropdown)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl flex justify-between items-center hover:bg-slate-900/70 transition-colors text-white"
                  >
                    <span>{getSelectedProductName()}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showProductDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showProductDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto">
                      {orderProducts.map(product => (
                        <button
                          key={product.productId}
                          type="button"
                          onClick={() => {
                            setSelectedProductId(product.productId);
                            setShowProductDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-700/50 text-sm text-white border-b border-slate-700/50 last:border-b-0 transition-colors"
                        >
                          {product.nameProduct}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rating Stars */}
            <div className="text-center py-4">
              <h3 className="font-semibold text-white mb-4">Đánh giá chung</h3>
              <div className="flex justify-center mb-3">
                <StarRating
                  rating={rating}
                  onRate={setRating}
                  size="large"
                  interactive={true}
                />
              </div>
              {rating > 0 && (
                <p className="text-slate-400 text-sm">
                  {rating === 5 && "Tuyệt vời"}
                  {rating === 4 && "Tốt"}
                  {rating === 3 && "Bình thường"}
                  {rating === 2 && "Tệ"}
                  {rating === 1 && "Rất Tệ"}
                </p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block font-medium text-slate-300 mb-2">
                Viết đánh giá của bạn
              </label>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setError("");
                }}
                placeholder="Xin mời chia sẻ cảm nhận về sản phẩm (tối thiểu 15 ký tự)"
                className="w-full h-28 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none text-white placeholder-slate-500 transition-all"
                disabled={loading}
                maxLength={500}
              />
              <p className="text-sm text-slate-500 mt-1 text-right">
                {content.length}/500
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors font-medium"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!rating || content.length < 15 || loading}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                  rating && content.length >= 15 && !loading
                    ? "bg-cyan-500 text-white hover:bg-cyan-400"
                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                {loading ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
