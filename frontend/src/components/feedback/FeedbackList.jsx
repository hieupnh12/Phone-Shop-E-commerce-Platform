import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Star, Trash2, Edit2, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import feedbackService from '../../services/feedbackService';
import { useAuthFullOptions } from '../../contexts/AuthContext';

const FeedbackList = ({ productId, onEdit, refreshTrigger, selectedRating: externalSelectedRating, showActions = true }) => {
  const { t } = useLanguage();
  const { user } = useAuthFullOptions();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  
  const activeRating = externalSelectedRating !== undefined ? externalSelectedRating : selectedRating;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await feedbackService.getFeedbacksByProduct(
          productId,
          0,
          10,
          null
        );
        setFeedbacks(response.content || []);
        setTotalPages(response.totalPages || 1);
        setPage(0);
      } catch (error) {
        console.error('Error loading feedbacks:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId, refreshTrigger]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await feedbackService.getFeedbacksByProduct(
          productId,
          page,
          10,
          activeRating
        );
        setFeedbacks(response.content || []);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error('Error loading feedbacks:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeRating, page, productId]);

  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đánh giá này?')) {
      return;
    }

    setDeleting(feedbackId);
    try {
      await feedbackService.deleteFeedback(feedbackId);
      setPage(0);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Lỗi khi xóa đánh giá');
    } finally {
      setDeleting(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
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

  if (loading && feedbacks.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-10 h-10 mx-auto mb-3 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-gray-500">Đang tải đánh giá...</p>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
          <MessageCircle className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-gray-500">
          {t('feedback.noReviews') || 'Chưa có đánh giá'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Rating Filter - chỉ hiển thị khi không có externalSelectedRating */}
      {externalSelectedRating === undefined && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-3">Lọc đánh giá theo</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRating(null)}
              className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                selectedRating === null
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
                className={`py-2 px-4 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedRating === rating
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {rating} <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feedbacks List */}
      <div className="space-y-3">
        {feedbacks.map((feedback) => (
          <div
            key={feedback.feedback_id}
            className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {feedback.customer_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{feedback.customer_name}</p>
                  <div className="flex gap-2 items-center mt-0.5">
                    {renderStars(feedback.rate)}
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.date).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
              {/* Chỉ hiển thị nút xóa/edit khi showActions = true và review đó là của chính user đó */}
              {showActions && user && (
                (String(feedback.customer_id) === String(user.customerId)) ||
                (String(feedback.customer_id) === String(user.id)) ||
                (String(feedback.customerId) === String(user.customerId)) ||
                (String(feedback.customerId) === String(user.id)) ||
                (String(feedback.user_id) === String(user.id))
              ) && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(feedback)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(feedback.feedback_id)}
                    disabled={deleting === feedback.feedback_id}
                    className="p-2 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-gray-700 text-sm leading-relaxed">{feedback.content}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center px-4 py-2 bg-gray-100 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              {page + 1} / {totalPages}
            </span>
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
