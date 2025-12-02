import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuthFullOptions } from '../../contexts/AuthContext';
import { Star, MessageCircle, Trash2, Edit2, Check, X, ChevronLeft, ChevronRight, PenLine, Eye } from 'lucide-react';
import feedbackService from '../../services/feedbackService';
import orderService from '../../services/orderService';
import FeedbackForm from '../../components/feedback/FeedbackForm';
import Toast from '../../components/common/Toast';

// ========== HELPER COMPONENTS (đặt ngoài để tránh re-create) ==========

// Render Stars
const renderStarsStatic = (rating) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${
          star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'
        }`}
      />
    ))}
  </div>
);

// Feedback Card Component - ĐẶT NGOÀI để tránh bị re-create
const FeedbackCard = ({ 
  feedback, 
  showEdit = false, 
  isEditing = false,
  editRating,
  editContent,
  onEditRatingChange,
  onEditContentChange,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  t,
  navigate
}) => (
  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/70 transition-all duration-200">
    {isEditing ? (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 block">{t('feedback.rating')}</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onEditRatingChange(star)}
                className="hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= editRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 block">{t('feedback.content')}</label>
          <textarea
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
            rows="3"
            maxLength={500}
          />
          <p className="text-xs text-slate-500 mt-1">{editContent.length}/500</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 transition-colors text-sm font-medium"
          >
            <Check className="w-4 h-4" />
            {t('feedback.save')}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors text-sm font-medium"
          >
            <X className="w-4 h-4" />
            {t('feedback.cancel')}
          </button>
        </div>
      </div>
    ) : (
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {(feedback.customer_name || feedback.product_name)?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-white text-sm truncate">{feedback.product_name}</h4>
              {feedback.customer_name && (
                <p className="text-xs text-slate-400 truncate">{feedback.customer_name}</p>
              )}
            </div>
          </div>
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {new Date(feedback.date).toLocaleDateString('vi-VN')}
          </span>
        </div>
        <div className="mb-2">
          {renderStarsStatic(feedback.rate)}
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{feedback.content}</p>
        
        {/* Button Xem sản phẩm */}
        {(feedback.product_id || feedback.productId) && (
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <button
              onClick={() => navigate(`/user/products/${feedback.product_id || feedback.productId}`)}
              className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              {t('feedback.viewProduct') || 'Xem sản phẩm'}
            </button>
          </div>
        )}
        
        {showEdit && (
          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700/50">
            <button
              onClick={() => onEdit(feedback)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-cyan-400 bg-cyan-500/10 rounded-lg hover:bg-cyan-500/20 transition-colors text-xs font-medium"
            >
              <Edit2 className="w-3.5 h-3.5" />
              {t('feedback.editReview')}
            </button>
            <button
              onClick={() => onDelete(feedback.feedback_id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors text-xs font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('feedback.deleteReview')}
            </button>
          </div>
        )}
      </div>
    )}
  </div>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex gap-2 justify-center mt-6 pt-4 border-t border-slate-700/50">
      <button
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
        className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-slate-400" />
      </button>
      <span className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300">
        {currentPage + 1} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
        disabled={currentPage === totalPages - 1}
        className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  );
};

// Loading Component
const LoadingState = ({ t }) => (
  <div className="text-center py-12">
    <div className="w-12 h-12 mx-auto mb-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
    <p className="text-slate-400">{t('feedback.loading')}</p>
  </div>
);

// Empty State Component
const EmptyState = ({ message, t }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
      <MessageCircle className="w-8 h-8 text-slate-600" />
    </div>
    <p className="text-slate-500">{message || t('feedback.noReviews')}</p>
  </div>
);

// ========== MAIN COMPONENT ==========
const MyFeedbacksPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const authContext = useAuthFullOptions();
  const user = authContext?.user;
  const [toast, setToast] = useState(null);

  // My feedbacks (chỉ khi đăng nhập)
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

  // All feedbacks (cho cả guest và user)
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [allFeedbacksLoading, setAllFeedbacksLoading] = useState(true);
  const [allFeedbacksPage, setAllFeedbacksPage] = useState(0);
  const [allFeedbacksTotalPages, setAllFeedbacksTotalPages] = useState(0);
  const [selectedRating, setSelectedRating] = useState(null);

  // Load my feedbacks khi đăng nhập
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

  // Load all feedbacks - LUÔN chạy kể cả chưa đăng nhập
  useEffect(() => {
    const loadAllFeedbacks = async () => {
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
        setAllFeedbacks([]);
      } finally {
        setAllFeedbacksLoading(false);
      }
    };
    loadAllFeedbacks();
  }, [allFeedbacksPage, selectedRating, refreshTrigger]);

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
      setToast({ type: 'success', message: t('feedback.updateSuccess') });
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating feedback:', error);
      setToast({ type: 'error', message: t('feedback.updateError') });
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm(t('feedback.confirmDelete'))) {
      return;
    }

    try {
      await feedbackService.deleteFeedback(feedbackId);
      setToast({ type: 'success', message: t('feedback.deleteSuccess') });
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      setToast({ type: 'error', message: t('feedback.deleteError') });
    }
  };

  const handleFeedbackSuccess = () => {
    setShowFeedbackForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  // Filter buttons component
  const FilterButtons = ({ className = "" }) => (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button
        onClick={() => {
          setSelectedRating(null);
          setAllFeedbacksPage(0);
        }}
        className={`py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
          selectedRating === null
            ? "bg-cyan-500 text-white shadow-md"
            : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600"
        }`}
      >
        Tất cả
      </button>
      {[5, 4, 3, 2, 1].map((rating) => (
        <button
          key={rating}
          onClick={() => {
            setSelectedRating(rating);
            setAllFeedbacksPage(0);
          }}
          className={`py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
            selectedRating === rating
              ? "bg-cyan-500 text-white shadow-md"
              : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600"
          }`}
        >
          {rating} <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        </button>
      ))}
    </div>
  );

  // All Feedbacks Section - dùng chung cho cả guest và user
  const AllFeedbacksSection = ({ showHeader = true, navigate }) => (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
      {showHeader && (
        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
            {t('feedback.allReviews')}
          </h2>
        </div>
      )}
      
      <div className="p-6">
        {/* Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Lọc theo đánh giá</h3>
          <FilterButtons />
        </div>

        {/* List */}
        {allFeedbacksLoading ? (
          <LoadingState t={t} />
        ) : allFeedbacks.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <div className="space-y-3">
            {allFeedbacks.map((feedback) => (
              <FeedbackCard key={feedback.feedback_id} feedback={feedback} t={t} navigate={navigate} />
            ))}
          </div>
        )}

        <Pagination 
          currentPage={allFeedbacksPage} 
          totalPages={allFeedbacksTotalPages} 
          onPageChange={setAllFeedbacksPage} 
        />
      </div>
    </div>
  );

  // ============ GUEST VIEW ============
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 mt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">{t('feedback.title')}</h1>
            </div>
            <p className="text-slate-400 mb-6">{t('feedback.exploreReviews')}</p>
            <a 
              href="/login" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 transition-colors font-semibold"
            >
              <PenLine className="w-5 h-5" />
              {t('feedback.loginToReview')}
            </a>
          </div>

          {/* All Feedbacks */}
          <AllFeedbacksSection navigate={navigate} />
        </div>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // ============ LOGGED IN VIEW ============
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('feedback.title')}</h1>
          </div>
          <button
            onClick={() => setShowFeedbackForm(!showFeedbackForm)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 transition-colors font-semibold"
          >
            <PenLine className="w-5 h-5" />
            {showFeedbackForm ? t('feedback.close') : t('feedback.writeReview')}
          </button>
        </div>

        {/* Feedback Form Modal */}
        {showFeedbackForm && completedOrders.length > 0 && (
          <FeedbackForm
            onSuccess={handleFeedbackSuccess}
            onClose={() => setShowFeedbackForm(false)}
          />
        )}

        {showFeedbackForm && completedOrders.length === 0 && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 flex items-center gap-3">
            <MessageCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">{t('feedback.noCompletedOrders')}</p>
              <p className="text-sm text-amber-300/70">{t('feedback.needCompletedOrder')}</p>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Feedbacks - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden sticky top-24">
              <div className="px-5 py-4 border-b border-slate-700/50 bg-cyan-500/10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  {t('feedback.myReviews')}
                </h2>
              </div>
              
              <div className="p-5">
                {loading ? (
                  <LoadingState t={t} />
                ) : feedbacks.length === 0 ? (
                  <EmptyState message={t('feedback.noReviews')} t={t} />
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {feedbacks.map((feedback) => (
                      <FeedbackCard
                        key={feedback.feedback_id}
                        feedback={feedback}
                        showEdit={true}
                        isEditing={editingId === feedback.feedback_id}
                        editRating={editRating}
                        editContent={editContent}
                        onEditRatingChange={setEditRating}
                        onEditContentChange={setEditContent}
                        onSave={() => handleUpdateFeedback(feedback.feedback_id)}
                        onCancel={() => setEditingId(null)}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        t={t}
                        navigate={navigate}
                      />
                    ))}
                  </div>
                )}
                
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </div>
          </div>

          {/* All Feedbacks - Right Column */}
          <div className="lg:col-span-2">
            <AllFeedbacksSection navigate={navigate} />
          </div>
        </div>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default MyFeedbacksPage;
