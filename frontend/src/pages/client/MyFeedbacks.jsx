import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuthFullOptions } from '../../contexts/AuthContext';
import { Star, ChevronDown, MessageCircle, Trash2, Edit2, Check, X } from 'lucide-react';
import feedbackService from '../../services/feedbackService';
import orderService from '../../services/orderService';
import FeedbackForm from '../../components/feedback/FeedbackForm';
import Toast from '../../components/common/Toast';

const MyFeedbacksPage = () => {
  const { t } = useLanguage();
  const authContext = useAuthFullOptions();
  const user = authContext?.user;
  const [toast, setToast] = useState(null);
  

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
  

  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [allFeedbacksLoading, setAllFeedbacksLoading] = useState(true);
  const [allFeedbacksPage, setAllFeedbacksPage] = useState(0);
  const [allFeedbacksTotalPages, setAllFeedbacksTotalPages] = useState(0);
  const [selectedRating, setSelectedRating] = useState(null);
  const [showRatingFilter, setShowRatingFilter] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setFeedbacks([]);
        setTotalPages(0);
        setLoading(false);
        return;
      }
      
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
    if (user) {
      loadCompletedOrdersForFeedback();
    }
  }, [page, refreshTrigger, user]);

  useEffect(() => {
    const load = async () => {
      setAllFeedbacksLoading(true);
      try {
        let response;
        if (selectedRating) {
          response = await feedbackService.getAllFeedbacksByRating(allFeedbacksPage, 10, selectedRating);
        } else {
          response = await feedbackService.getAllFeedbacks(allFeedbacksPage, 10);
        }
        setAllFeedbacks(response.content || []);
        setAllFeedbacksTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error('Error loading all feedbacks:', error);
      } finally {
        setAllFeedbacksLoading(false);
      }
    };
    load();
  }, [allFeedbacksPage, selectedRating]);

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
      setToast({ type: 'success', message: 'Cập nhật đánh giá thành công!' });
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating feedback:', error);
      setToast({ type: 'error', message: 'Lỗi khi cập nhật đánh giá' });
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đánh giá này?')) {
      return;
    }

    try {
      await feedbackService.deleteFeedback(feedbackId);
      setToast({ type: 'success', message: 'Xóa đánh giá thành công!' });
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      setToast({ type: 'error', message: 'Lỗi khi xóa đánh giá' });
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

  const getRatingLabel = () => {
    if (!selectedRating) return 'Tất cả đánh giá';
    return `${selectedRating} sao`;
  };

  const FeedbackItem = ({ feedback, showEdit = false, onEdit = null, onDelete = null, isEditing = false, editContent = '', editRating = 0, onEditChange = null, onSave = null, onCancel = null }) => {
    if (isEditing) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Xếp hạng</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onEditChange?.({ rating: star })}
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
              onChange={(e) => onEditChange?.({ content: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {editContent.length}/500
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Cập nhật
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-semibold">{feedback.product_name}</p>
            <p className="text-sm text-gray-600">{feedback.customer_name}</p>
            <div className="flex gap-2 items-center mt-1">
              {renderStars(feedback.rate)}
              <span className="text-xs text-gray-500">
                {new Date(feedback.date).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
          {showEdit && (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit?.(feedback)}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => onDelete?.(feedback.feedback_id)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded border border-red-200"
              >
                Xóa
              </button>
            </div>
          )}
        </div>

        <p className="text-gray-700 text-sm">{feedback.content}</p>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageCircle className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Đánh giá sản phẩm</h1>
            </div>
            <p className="text-lg text-gray-600 mb-8">Khám phá những đánh giá từ khách hàng khác</p>
            <a 
              href="/login" 
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
            >
              <span>Đăng nhập để đánh giá</span>
            </a>
          </div>

          {/* All Feedbacks Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Đánh giá từ khách hàng</h2>
                
                {/* Rating Filter - Beautifully Styled */}
                <div className="relative">
                  <button
                    onClick={() => setShowRatingFilter(!showRatingFilter)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
                  >
                    <Star className="w-4 h-4 text-yellow-400" />
                    {getRatingLabel()}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showRatingFilter && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 min-w-48 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRating(null);
                          setShowRatingFilter(false);
                          setAllFeedbacksPage(0);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 font-medium transition-colors duration-200"
                      >
                        ⭐ Tất cả đánh giá
                      </button>
                      {[5, 4, 3, 2, 1].map(rating => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => {
                            setSelectedRating(rating);
                            setShowRatingFilter(false);
                            setAllFeedbacksPage(0);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 transition-colors duration-200 flex items-center justify-between border-t border-gray-100"
                        >
                          <span>{rating} sao</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
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
              {allFeedbacksLoading && allFeedbacks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="animate-spin mb-4">
                    <MessageCircle className="w-8 h-8 text-blue-400 mx-auto" />
                  </div>
                  <p className="text-gray-500 font-medium">Đang tải đánh giá...</p>
                </div>
              ) : allFeedbacks.length === 0 ? (
                <div className="text-center py-16">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Chưa có đánh giá nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allFeedbacks.map((feedback) => (
                    <div
                      key={feedback.feedback_id}
                      className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200 hover:border-gray-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{feedback.product_name}</h3>
                          <p className="text-sm text-gray-600">👤 {feedback.customer_name}</p>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                          {new Date(feedback.date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="mb-3">
                        {renderStars(feedback.rate)}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{feedback.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {allFeedbacksTotalPages > 1 && (
                <div className="flex gap-3 justify-center mt-8 pt-8 border-t border-gray-200">
                  <button
                    onClick={() => setAllFeedbacksPage(Math.max(0, allFeedbacksPage - 1))}
                    disabled={allFeedbacksPage === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    ← Trước
                  </button>
                  <div className="flex items-center px-4 py-2 bg-gray-100 rounded-lg">
                    <span className="font-medium text-gray-700">
                      {allFeedbacksPage + 1} / {allFeedbacksTotalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => setAllFeedbacksPage(Math.min(allFeedbacksTotalPages - 1, allFeedbacksPage + 1))}
                    disabled={allFeedbacksPage === allFeedbacksTotalPages - 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Sau →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Đánh giá sản phẩm</h1>
            </div>
            <button
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
            >
              <Star className="w-5 h-5" />
              {showFeedbackForm ? 'Đóng' : 'Viết đánh giá mới'}
            </button>
          </div>
        </div>

        {/* Feedback Form Modal */}
        {showFeedbackForm && completedOrders.length > 0 && (
          <div className="mb-8">
            <FeedbackForm
              onSuccess={handleFeedbackSuccess}
              onClose={() => setShowFeedbackForm(false)}
            />
          </div>
        )}

        {showFeedbackForm && completedOrders.length === 0 && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 flex items-center gap-3">
            <MessageCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-semibold">Chưa có đơn hàng hoàn thành</p>
              <p className="text-sm">Bạn cần hoàn thành ít nhất một đơn hàng để có thể đánh giá sản phẩm</p>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* My Feedbacks - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Đánh giá của tôi
                </h2>
              </div>
              <div className="p-6">
                {loading && feedbacks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin mb-4">
                      <MessageCircle className="w-8 h-8 text-blue-400 mx-auto" />
                    </div>
                    <p className="text-gray-500 font-medium">Đang tải...</p>
                  </div>
                ) : feedbacks.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Bạn chưa có đánh giá nào</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {feedbacks.map((feedback) => (
                      <div
                        key={feedback.feedback_id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                      >
                        {editingId === feedback.feedback_id ? (
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-semibold text-gray-700">Xếp hạng</label>
                              <div className="flex gap-2 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => setEditRating(star)}
                                    className="transition-transform hover:scale-125"
                                  >
                                    <Star
                                      className={`w-6 h-6 cursor-pointer ${
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
                              <label className="text-xs font-semibold text-gray-700">Nội dung</label>
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full mt-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                maxLength={500}
                              />
                              <p className="text-xs text-gray-500 mt-1">{editContent.length}/500</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateFeedback(feedback.feedback_id)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                              >
                                <Check className="w-4 h-4" />
                                Lưu
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                              >
                                <X className="w-4 h-4" />
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">{feedback.product_name}</h4>
                            <div className="flex items-center gap-2 mb-2">
                              {renderStars(feedback.rate)}
                              <span className="text-xs text-gray-500">
                                {new Date(feedback.date).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm mb-3 line-clamp-2">{feedback.content}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(feedback)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-xs font-medium"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDelete(feedback.feedback_id)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors text-xs font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Xóa
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* My Feedbacks Pagination */}
                {totalPages > 1 && (
                  <div className="flex gap-2 justify-center mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      ←
                    </button>
                    <span className="px-2 py-1 text-xs text-gray-600">
                      {page + 1}/{totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page === totalPages - 1}
                      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* All Feedbacks - Right Column */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Đánh giá từ khách hàng
                </h2>
                
                {/* Rating Filter */}
                <div className="relative">
                  <button
                    onClick={() => setShowRatingFilter(!showRatingFilter)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                  >
                    {getRatingLabel()}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showRatingFilter && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 min-w-48 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRating(null);
                          setShowRatingFilter(false);
                          setAllFeedbacksPage(0);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 font-medium transition-colors border-b border-gray-100"
                      >
                        ⭐ Tất cả đánh giá
                      </button>
                      {[5, 4, 3, 2, 1].map(rating => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => {
                            setSelectedRating(rating);
                            setShowRatingFilter(false);
                            setAllFeedbacksPage(0);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0"
                        >
                          <span>{rating} sao</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={`w-3 h-3 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {allFeedbacksLoading && allFeedbacks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="animate-spin mb-4">
                      <MessageCircle className="w-8 h-8 text-blue-400 mx-auto" />
                    </div>
                    <p className="text-gray-500 font-medium">Đang tải đánh giá...</p>
                  </div>
                ) : allFeedbacks.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Chưa có đánh giá nào</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {allFeedbacks.map((feedback) => (
                      <div
                        key={feedback.feedback_id}
                        className="border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{feedback.product_name}</h3>
                            <p className="text-sm text-gray-600">👤 {feedback.customer_name}</p>
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full whitespace-nowrap ml-2">
                            {new Date(feedback.date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="mb-3">
                          {renderStars(feedback.rate)}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{feedback.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* All Feedbacks Pagination */}
                {allFeedbacksTotalPages > 1 && (
                  <div className="flex gap-3 justify-center mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setAllFeedbacksPage(Math.max(0, allFeedbacksPage - 1))}
                      disabled={allFeedbacksPage === 0}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Trước
                    </button>
                    <div className="flex items-center px-4 py-2 bg-gray-100 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        {allFeedbacksPage + 1} / {allFeedbacksTotalPages}
                      </span>
                    </div>
                    <button
                      onClick={() => setAllFeedbacksPage(Math.min(allFeedbacksTotalPages - 1, allFeedbacksPage + 1))}
                      disabled={allFeedbacksPage === allFeedbacksTotalPages - 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default MyFeedbacksPage;
