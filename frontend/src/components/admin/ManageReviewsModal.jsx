import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Edit2, Trash2, Star, RefreshCw } from 'lucide-react';
import Modal from '../common/Modal';
import feedbackService from '../../services/feedbackService';
import Toast from '../common/Toast';
import { useLanguage } from '../../contexts/LanguageContext';

const ManageReviewsModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [toast, setToast] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const fetchReviews = useCallback(async (page = currentPage) => {
    try {
      setLoading(true);
      let data;
      
      if (selectedRating) {
        data = await feedbackService.getAllFeedbacksByRating(page, pageSize, selectedRating);
      } else {
        data = await feedbackService.getAllFeedbacks(page, pageSize);
      }

      const pageData = data?.result || data;
      let reviewsList = [];
      if (pageData?.content) {
        reviewsList = Array.isArray(pageData.content) ? pageData.content : [];
        setTotalPages(pageData.totalPages || 0);
        setTotalElements(pageData.totalElements || 0);
      } else {
        reviewsList = Array.isArray(pageData) ? pageData : [];
        setTotalPages(Math.ceil(reviewsList.length / pageSize));
        setTotalElements(reviewsList.length);
      }
      
      // Normalize field names from snake_case to camelCase
      // Backend returns customer_name, customer_phone and product_name (snake_case)
      const normalizedReviews = reviewsList.map((review, index) => {
        const normalized = {
          ...review,
          // Support both snake_case and camelCase
          customerName: review.customer_name || review.customerName || null,
          customerPhone: review.customer_phone || review.customerPhone || null,
          productName: review.product_name || review.productName || null,
          feedbackId: review.feedback_id || review.feedbackId,
          customerId: review.customer_id || review.customerId,
          productId: review.product_id || review.productId,
        };
        // Debug log to check what we're receiving (first review only)
        if (index === 0) {
          console.log('Sample review data from API:', review);
          console.log('Normalized review:', normalized);
        }
        return normalized;
      });
      
      setReviews(normalizedReviews);
    } catch (err) {
      console.error('Fetch reviews failed:', err);
      showToast('Không thể tải danh sách đánh giá!', 'error');
      setReviews([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, selectedRating, showToast]);

  useEffect(() => {
    if (isOpen) {
      fetchReviews(0);
      setCurrentPage(0);
    }
  }, [isOpen, selectedRating]);

  useEffect(() => {
    if (isOpen) {
      fetchReviews(currentPage);
    }
  }, [currentPage, isOpen]);

  const handleEdit = (review) => {
    setEditingReview(review);
    setEditContent(review.content || '');
    setEditRating(review.rate || 5);
  };

  const handleSaveEdit = async () => {
    if (!editingReview) return;

    if (!editContent.trim() || editContent.trim().length < 15) {
      showToast('Nội dung đánh giá phải có ít nhất 15 ký tự!', 'error');
      return;
    }

    try {
      setLoading(true);
      await feedbackService.updateFeedback(editingReview.feedbackId, {
        content: editContent.trim(),
        rate: editRating,
      });
      showToast('Cập nhật đánh giá thành công!', 'success');
      setEditingReview(null);
      fetchReviews(currentPage);
    } catch (err) {
      console.error('Update review failed:', err);
      showToast('Cập nhật đánh giá thất bại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      setDeletingId(confirmDelete);
      await feedbackService.deleteFeedback(confirmDelete);
      showToast('Xóa đánh giá thành công!', 'success');
      setConfirmDelete(null);
      fetchReviews(currentPage);
    } catch (err) {
      console.error('Delete review failed:', err);
      showToast('Xóa đánh giá thất bại!', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const customerName = review.customer_name || review.customerName || '';
    const customerPhone = review.customer_phone || review.customerPhone || '';
    const productName = review.product_name || review.productName || '';
    return (
      review.content?.toLowerCase().includes(query) ||
      customerName.toLowerCase().includes(query) ||
      customerPhone.toLowerCase().includes(query) ||
      productName.toLowerCase().includes(query)
    );
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Quản lý đánh giá"
        size="full"
        className="max-h-[90vh]"
      >
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-end pb-4 border-b">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo nội dung, khách hàng, sản phẩm..."
                  className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lọc theo sao
              </label>
              <select
                value={selectedRating || ''}
                onChange={(e) => {
                  setSelectedRating(e.target.value ? parseInt(e.target.value) : null);
                  setCurrentPage(0);
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
            </div>

            <button
              onClick={() => {
                setCurrentPage(0);
                fetchReviews(0);
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
          </div>

          {/* Stats */}
          <div className="text-sm text-gray-600">
            Tổng số: <strong>{totalElements}</strong> đánh giá
            {totalPages > 1 && ` (Trang ${currentPage + 1}/${totalPages})`}
          </div>

          {/* Reviews Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-3 border text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="p-3 border text-left text-sm font-semibold text-gray-700">Khách hàng</th>
                    <th className="p-3 border text-left text-sm font-semibold text-gray-700">Số điện thoại</th>
                    <th className="p-3 border text-left text-sm font-semibold text-gray-700">Sản phẩm</th>
                    <th className="p-3 border text-left text-sm font-semibold text-gray-700">Đánh giá</th>
                    <th className="p-3 border text-left text-sm font-semibold text-gray-700">Nội dung</th>
                    <th className="p-3 border text-left text-sm font-semibold text-gray-700">Ngày</th>
                    <th className="p-3 border text-center text-sm font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500">
                        Đang tải...
                      </td>
                    </tr>
                  ) : filteredReviews.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500">
                        Không có đánh giá nào
                      </td>
                    </tr>
                  ) : (
                    filteredReviews.map((review) => (
                      <tr key={review.feedbackId} className="hover:bg-gray-50">
                        <td className="p-3 border text-sm">{review.feedbackId}</td>
                        <td className="p-3 border text-sm">{review.customerName || 'N/A'}</td>
                        <td className="p-3 border text-sm">{review.customerPhone || review.customer_phone || 'N/A'}</td>
                        <td className="p-3 border text-sm">{review.productName || 'N/A'}</td>
                        <td className="p-3 border">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rate || 0)}
                          </div>
                        </td>
                        <td className="p-3 border text-sm max-w-xs">
                          <div className="truncate" title={review.content}>
                            {review.content || 'N/A'}
                          </div>
                        </td>
                        <td className="p-3 border text-sm text-gray-600">
                          {review.date
                            ? new Date(review.date).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </td>
                        <td className="p-3 border text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(review)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Sửa"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(review.feedbackId)}
                              disabled={deletingId === review.feedbackId}
                              className="p-2 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0 || loading}
                className="px-3 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1 || loading}
                className="px-3 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Modal */}
      {editingReview && (
        <Modal
          isOpen={!!editingReview}
          onClose={() => setEditingReview(null)}
          title="Sửa đánh giá"
          size="md"
          footer={
            <>
              <button
                onClick={() => setEditingReview(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá (sao)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={24}
                      className={
                        star <= editRating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">{editRating} sao</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung đánh giá
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập nội dung đánh giá (tối thiểu 15 ký tự)..."
              />
              <div className="mt-1 text-xs text-gray-500">
                {editContent.length} / 15 ký tự (tối thiểu)
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <Modal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          title="Xác nhận xóa"
          size="sm"
          footer={
            <>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deletingId === confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId === confirmDelete ? 'Đang xóa...' : 'Xóa'}
              </button>
            </>
          }
        >
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
          </p>
        </Modal>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default ManageReviewsModal;

