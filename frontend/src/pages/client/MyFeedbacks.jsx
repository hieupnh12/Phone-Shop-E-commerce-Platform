import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Star } from 'lucide-react';
import feedbackService from '../../services/feedbackService';
import orderService from '../../services/orderService';
import FeedbackForm from '../../components/feedback/FeedbackForm';

const MyFeedbacksPage = () => {
  const { t } = useLanguage();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [completedOrders, setCompletedOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await feedbackService.getMyFeedbacks(page, 10);
        setFeedbacks(response.content || []);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error('Error loading feedbacks:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
    loadCompletedOrdersForFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, refreshTrigger]);

  const loadCompletedOrdersForFeedback = async () => {
    try {
      const orders = await orderService.getCompletedOrders();
      setCompletedOrders(Array.isArray(orders) ? orders : []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setCompletedOrders([]);
    }
  };

  const handleEdit = (feedback) => {
    setEditingId(feedback.feedback_id);
    setEditRating(feedback.rate);
    setEditContent(feedback.content);
  };

  const handleUpdateFeedback = async (feedbackId) => {
    try {
      await feedbackService.updateFeedback(feedbackId, {
        rate: editRating,
        content: editContent,
        product_id: feedbacks.find(f => f.feedback_id === feedbackId)?.product_id
      });
      setEditingId(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Lỗi khi cập nhật đánh giá');
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đánh giá này?')) {
      return;
    }

    try {
      await feedbackService.deleteFeedback(feedbackId);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Lỗi khi xóa đánh giá');
    }
  };

  const handleFeedbackSuccess = () => {
    setShowFeedbackForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('feedback.myReviews') || 'Đánh giá của tôi'}</h1>
        <button
          onClick={() => setShowFeedbackForm(!showFeedbackForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showFeedbackForm ? 'Đóng' : 'Viết đánh giá mới'}
        </button>
      </div>

      {/* Feedback Form Modal for New Feedback */}
      {showFeedbackForm && completedOrders.length > 0 && (
        <FeedbackForm
          onSuccess={handleFeedbackSuccess}
          onClose={() => setShowFeedbackForm(false)}
        />
      )}

      {showFeedbackForm && completedOrders.length === 0 && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          Bạn chưa có đơn hàng hoàn thành nào để đánh giá
        </div>
      )}

      {/* Existing Feedbacks */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Đánh giá đã gửi</h2>
        
        {loading && feedbacks.length === 0 ? (
          <div className="text-center py-8">Đang tải đánh giá...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('feedback.noReviews') || 'Bạn chưa có đánh giá nào'}
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.feedback_id}
                className="border border-gray-200 rounded-lg p-4"
              >
                {editingId === feedback.feedback_id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Xếp hạng</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setEditRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= editRating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Nội dung</label>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                        maxLength={500}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {editContent.length}/500
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateFeedback(feedback.feedback_id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Cập nhật
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{feedback.product_name}</p>
                        <div className="flex gap-2 items-center mt-1">
                          {renderStars(feedback.rate)}
                          <span className="text-xs text-gray-500">
                            {new Date(feedback.date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(feedback)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => handleDelete(feedback.feedback_id)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded border border-red-200"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm">{feedback.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex gap-2 justify-center mt-6">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50"
            >
              Trước
            </button>
            <div className="flex items-center px-3">
              Trang {page + 1}/{totalPages}
            </div>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFeedbacksPage;
