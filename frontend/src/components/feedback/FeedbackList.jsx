import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Star, Trash2, Edit2, ChevronDown } from 'lucide-react';
import feedbackService from '../../services/feedbackService';

const FeedbackList = ({ productId, onEdit, refreshTrigger }) => {
  const { t } = useLanguage();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [showRatingFilter, setShowRatingFilter] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await feedbackService.getFeedbacksByProduct(
          productId,
          0,
          10,
          null // Reset filter
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, refreshTrigger]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await feedbackService.getFeedbacksByProduct(
          productId,
          page,
          10,
          selectedRating
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRating, page]);

  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đánh giá này?')) {
      return;
    }

    setDeleting(feedbackId);
    try {
      await feedbackService.deleteFeedback(feedbackId);
      setPage(0); // Reset to first page
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Lỗi khi xóa đánh giá');
    } finally {
      setDeleting(null);
    }
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

  const getRatingLabel = () => {
    if (!selectedRating) return 'Tất cả đánh giá';
    return `${selectedRating} sao`;
  };

  if (loading && feedbacks.length === 0) {
    return <div className="text-center py-8">Đang tải đánh giá...</div>;
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('feedback.noReviews') || 'Chưa có đánh giá'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Rating Filter */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Đánh giá của khách hàng</h3>
        <div className="relative">
          <button
            onClick={() => setShowRatingFilter(!showRatingFilter)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            {getRatingLabel()}
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showRatingFilter && (
            <div className="absolute right-0 top-full mt-1 border border-gray-300 rounded-lg bg-white shadow-lg z-10 min-w-40">
              <button
                type="button"
                onClick={() => {
                  setSelectedRating(null);
                  setShowRatingFilter(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b"
              >
                Tất cả đánh giá
              </button>
              {[5, 4, 3, 2, 1].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => {
                    setSelectedRating(rating);
                    setShowRatingFilter(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b last:border-b-0 flex items-center gap-2"
                >
                  <span>{rating} sao</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedbacks List */}
      {feedbacks.map((feedback) => (
        <div
          key={feedback.feedback_id}
          className="border border-gray-200 rounded-lg p-4"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold">{feedback.customer_name}</p>
              <div className="flex gap-2 items-center mt-1">
                {renderStars(feedback.rate)}
                <span className="text-xs text-gray-500">
                  {new Date(feedback.date).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit?.(feedback)}
                className="p-2 hover:bg-gray-100 rounded"
                title="Edit"
              >
                <Edit2 className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={() => handleDelete(feedback.feedback_id)}
                disabled={deleting === feedback.feedback_id}
                className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>

          <p className="text-gray-700 text-sm">{feedback.content}</p>
        </div>
      ))}

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
  );
};

export default FeedbackList;
