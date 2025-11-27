import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Star, X, ChevronDown } from 'lucide-react';
import feedbackService from '../../services/feedbackService';
import orderService from '../../services/orderService';

const FeedbackForm = ({ productId, onSuccess, onClose }) => {
  const { t } = useLanguage();
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

  // Tải danh sách đơn hàng hoàn thành
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tải sản phẩm khi chọn đơn hàng
  useEffect(() => {
    const load = async () => {
      if (selectedOrder?.orderId) {
        try {
          // Nếu API có endpoint để lấy products từ order, sử dụng nó
          // Tạm thời, giả sử order object chứa product list
          if (selectedOrder?.products) {
            setOrderProducts(selectedOrder.products);
            if (selectedOrder.products.length > 0) {
              setSelectedProductId(selectedOrder.products[0].productId);
            }
          }
        } catch (err) {
          console.error('Error loading order products:', err);
          setOrderProducts([]);
        }
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrder?.orderId]);

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
      await feedbackService.createFeedback({
        product_id: selectedProductId || productId,
        rate: rating,
        content: content.trim()
      });
      
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t('feedback.writeReview') || 'Viết đánh giá'}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order Selection - chỉ hiển thị nếu không có productId */}
          {!productId && (
            <div>
              <label className="block text-sm font-medium mb-2">Chọn đơn hàng</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowOrderDropdown(!showOrderDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg flex justify-between items-center hover:bg-gray-50"
                  disabled={loadingOrders}
                >
                  <span>{getSelectedOrderName()}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showOrderDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 rounded-lg bg-white shadow-lg z-10 max-h-40 overflow-y-auto">
                    {completedOrders.length === 0 ? (
                      <div className="p-3 text-gray-500 text-sm">Không có đơn hàng hoàn thành</div>
                    ) : (
                      completedOrders.map(order => (
                        <button
                          key={order.orderId}
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b last:border-b-0"
                        >
                          Đơn #{order.orderId} - {order.totalPrice?.toLocaleString()} VNĐ
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
              <label className="block text-sm font-medium mb-2">Chọn sản phẩm</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProductDropdown(!showProductDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg flex justify-between items-center hover:bg-gray-50"
                >
                  <span>{getSelectedProductName()}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showProductDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 rounded-lg bg-white shadow-lg z-10 max-h-40 overflow-y-auto">
                    {orderProducts.map(product => (
                      <button
                        key={product.productId}
                        type="button"
                        onClick={() => {
                          setSelectedProductId(product.productId);
                          setShowProductDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b last:border-b-0"
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
          <div>
            <label className="block text-sm font-medium mb-2">{t('feedback.rating') || 'Đánh giá'}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('feedback.content') || 'Nội dung'}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
              disabled={loading}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {content.length}/500
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : t('feedback.submit') || 'Gửi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
