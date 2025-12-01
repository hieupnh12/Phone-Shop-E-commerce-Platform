import React, { useState, useEffect } from "react";
import {
  X,
  Star,
} from "lucide-react";
import feedbackService from "../../../services/feedbackService";
import orderService from "../../../services/orderService";
import { useAuthFullOptions } from "../../../contexts/AuthContext";
import FeedbackList from "../../feedback/FeedbackList";

// Dữ liệu giả định cho phần đánh giá theo trải nghiệm (KHÔNG ĐỤNG VÀO)
const experienceRatingsDisplay = [
  { label: "Hiệu năng", rating: 5, count: 11 },
  { label: "Thời lượng pin", rating: 5, count: 11 },
  { label: "Chất lượng camera", rating: 5, count: 11 },
];

// Component StarRating cho CẢ HIỂN THỊ (Display) và TƯƠNG TÁC (Interactive)
const StarRating = ({
  rating,
  onRate,
  size = "medium",
  interactive = true,
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-10 h-10",
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRate(star)}
          className={`transition-transform ${
            interactive ? "hover:scale-110" : "cursor-default"
          }`}
          disabled={!interactive}
        >
          <Star
            className={`${sizeClasses[size]} transition-colors ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
            strokeWidth={interactive ? 1.5 : 0} // Dùng strokeWidth 0 cho display để giống hình hơn
            fill={star <= rating ? "#facc15" : "currentColor"}
          />
        </button>
      ))}
    </div>
  );
};

const ProductFeedback = ({ productId, productName, productImage }) => {
  const authContext = useAuthFullOptions();
  const user = authContext?.user;

  // State cho rating stats
  const [ratingStats, setRatingStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // State cho popup
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [overallRating, setOverallRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // State cho kiểm tra quyền đánh giá
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  
  // State cho filter và refresh
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch rating stats
  useEffect(() => {
    const loadStats = async () => {
      if (!productId) return;
      setLoadingStats(true);
      try {
        const response = await feedbackService.getRatingStats(productId);
        // Handle both direct response and nested response.data
        const stats = response?.data || response?.result || response;
        console.log("Rating stats received:", stats);
        setRatingStats(stats);
      } catch (error) {
        console.error("Error loading rating stats:", error);
        setRatingStats(null);
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, [productId, refreshTrigger]);

  // Kiểm tra user đã mua sản phẩm và đã đánh giá chưa
  useEffect(() => {
    const checkPermission = async () => {
      if (!user || !productId) {
        setCheckingPermission(false);
        return;
      }

      setCheckingPermission(true);
      try {
        // Kiểm tra đã mua sản phẩm chưa
        const completedOrders = await orderService.getCompletedOrders();
        const hasBought = completedOrders.some(order => 
          order.orderDetails?.some(detail => detail.productId === productId)
        );
        setHasPurchased(hasBought);

        // Kiểm tra đã đánh giá chưa
        const myFeedbacks = await feedbackService.getMyFeedbacks(0, 1000);
        const hasReviewedProduct = (myFeedbacks.content || []).some(
          fb => fb.product_id === productId
        );
        setHasReviewed(hasReviewedProduct);
      } catch (error) {
        console.error("Error checking permission:", error);
        setHasPurchased(false);
        setHasReviewed(false);
      } finally {
        setCheckingPermission(false);
      }
    };
    checkPermission();
  }, [user, productId]);

  // Tính toán rating distribution từ stats - Luôn hiển thị 5 mức sao, kể cả khi chưa có đánh giá
  const totalReviews = ratingStats?.total_reviews || ratingStats?.totalReviews || 0;
  const ratingDistribution = [
    { 
      stars: 5, 
      count: ratingStats?.five_star_count || ratingStats?.fiveStarCount || 0, 
      percentage: totalReviews > 0 ? ((ratingStats?.five_star_count || ratingStats?.fiveStarCount || 0) / totalReviews) : 0 
    },
    { 
      stars: 4, 
      count: ratingStats?.four_star_count || ratingStats?.fourStarCount || 0, 
      percentage: totalReviews > 0 ? ((ratingStats?.four_star_count || ratingStats?.fourStarCount || 0) / totalReviews) : 0 
    },
    { 
      stars: 3, 
      count: ratingStats?.three_star_count || ratingStats?.threeStarCount || 0, 
      percentage: totalReviews > 0 ? ((ratingStats?.three_star_count || ratingStats?.threeStarCount || 0) / totalReviews) : 0 
    },
    { 
      stars: 2, 
      count: ratingStats?.two_star_count || ratingStats?.twoStarCount || 0, 
      percentage: totalReviews > 0 ? ((ratingStats?.two_star_count || ratingStats?.twoStarCount || 0) / totalReviews) : 0 
    },
    { 
      stars: 1, 
      count: ratingStats?.one_star_count || ratingStats?.oneStarCount || 0, 
      percentage: totalReviews > 0 ? ((ratingStats?.one_star_count || ratingStats?.oneStarCount || 0) / totalReviews) : 0 
    },
  ];

  const averageRating = ratingStats?.average_rating || ratingStats?.averageRating || 0;

  // Handle submit feedback
  const handleSubmit = async () => {
    if (!overallRating || reviewText.length < 15) {
      setError("Vui lòng chọn đánh giá và nhập ít nhất 15 ký tự");
      return;
    }

    if (!hasPurchased) {
      setError("Bạn chỉ có thể đánh giá sản phẩm đã mua");
      return;
    }

    if (hasReviewed) {
      setError("Bạn đã đánh giá sản phẩm này rồi");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await feedbackService.createFeedback({
        product_id: productId,
        rate: overallRating,
        content: reviewText.trim()
      });
      
      // Reset form và refresh
      setShowReviewPopup(false);
      setOverallRating(0);
      setReviewText("");
      setHasReviewed(true);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (rating) => {
    setSelectedRatingFilter(rating === "all" ? null : rating);
  };

  if (loadingStats) {
    return (
      <div className="max-w-6xl mx-auto p-4 bg-gray-50 font-sans">
        <div className="bg-white shadow-xl rounded-xl p-6">
          <div className="text-center py-8">Đang tải đánh giá...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 font-sans">
      <div className="bg-white shadow-xl rounded-xl p-6 md:items-center">
        {/* Phần 1: Giao diện hiển thị đánh giá */}
        <h1 className="text-xl font-bold text-gray-800 mb-6 pb-2">
          Đánh giá {productName || "Sản phẩm"}
        </h1>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Main Rating Summary Block - Trở thành phần chính */}
          <div className="w-full lg:w-2/5">
            <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-lg p-5 shadow-sm border border-red-100">
              {/* Rating Score - Large and Prominent */}
              <div className="text-center mb-4">
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-xl text-gray-500 ml-1.5">/5</span>
                </div>

                {/* Star Rating */}
                <div className="flex justify-center mb-2">
                  <StarRating
                    rating={Math.round(averageRating)}
                    size="medium"
                    interactive={false}
                  />
                </div>

                {/* Total Reviews */}
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  <span className="text-sm font-semibold text-gray-700">
                    {totalReviews}
                  </span>
                  <span className="text-xs text-gray-600">
                    lượt đánh giá
                  </span>
                </div>

                {/* Action Button or Status Message */}
                {user && hasPurchased && !hasReviewed && !checkingPermission && (
                  <button
                    onClick={() => setShowReviewPopup(true)}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-[1.01] text-xs"
                  >
                    Viết đánh giá
                  </button>
                )}
                {user && !hasPurchased && !checkingPermission && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <p className="text-xs text-blue-700 text-center font-medium">
                      Mua sản phẩm để đánh giá
                    </p>
                  </div>
                )}
                {user && hasReviewed && !checkingPermission && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                    <p className="text-xs text-green-700 text-center font-medium">
                      ✓ Bạn đã đánh giá sản phẩm này
                    </p>
                  </div>
                )}
                {!user && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                    <p className="text-xs text-gray-600 text-center font-medium">
                      Đăng nhập để đánh giá
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rating Distribution Block - Luôn hiển thị, kể cả khi chưa có đánh giá */}
          <div className="w-full lg:w-3/5">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-2.5">
                Phân bố đánh giá
              </h3>
              <div className="space-y-2">
                {ratingDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-2">
                    <span className="w-9 text-xs font-semibold text-gray-700 flex items-center gap-1">
                      {item.stars}
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round(item.percentage * 100)}%`,
                          minWidth: item.percentage > 0 ? '2px' : '0px'
                        }}
                      ></div>
                    </div>
                    <span className="w-20 text-xs font-medium text-gray-600 text-right">
                      {item.count} đánh giá
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- Phần Lọc đánh giá và Danh sách đánh giá --- */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Lọc đánh giá theo
          </h2>

          {/* Các nút lọc */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => handleFilterChange("all")}
              className={`py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                selectedRatingFilter === null
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => handleFilterChange(rating)}
                className={`py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                  selectedRatingFilter === rating
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {rating} sao
              </button>
            ))}
          </div>

          {/* Danh sách đánh giá */}
          <div className="mt-6">
            <FeedbackList 
              productId={productId} 
              selectedRating={selectedRatingFilter}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </div>

      {/* ========================================
        PHẦN 2: REVIEW POPUP (Từ code gốc của bạn) 
        ========================================
      */}
      {showReviewPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Đánh giá & nhận xét
              </h2>
              <button
                onClick={() => setShowReviewPopup(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Product Info */}
            <div className="px-6 py-4 bg-gray-50 border-b">
              <div className="flex items-center gap-4">
                {productImage && (
                  <img
                    src={productImage}
                    alt={productName || "Sản phẩm"}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {productName || "Sản phẩm"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Chia sẻ trải nghiệm của bạn
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              {/* Overall Rating */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                  Đánh giá chung
                </h3>
                <div className="flex justify-center">
                  <StarRating
                    rating={overallRating}
                    onRate={setOverallRating}
                    size="large"
                    interactive={true}
                  />
                </div>
                {overallRating > 0 && (
                  <p className="text-center text-sm text-gray-600 mt-2">
                    {overallRating === 5 && "Tuyệt vời"}
                    {overallRating === 4 && "Tốt"}
                    {overallRating === 3 && "Bình thường"}
                    {overallRating === 2 && "Tệ"}
                    {overallRating === 1 && "Rất Tệ"}
                  </p>
                )}
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block font-semibold text-gray-900 mb-2">
                  Viết đánh giá của bạn
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => {
                    setReviewText(e.target.value);
                    setError("");
                  }}
                  placeholder="Xin mời chia sẻ một số cảm nhận về sản phẩm (nhập tối thiểu 15 kí tự)"
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                  maxLength={500}
                  disabled={submitting}
                />
                <p className="text-sm text-gray-500 mt-1 text-right">
                  {reviewText.length}/500 ký tự
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowReviewPopup(false)}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={!overallRating || reviewText.length < 15 || submitting || !hasPurchased || hasReviewed}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  overallRating && reviewText.length >= 15 && !submitting && hasPurchased && !hasReviewed
                    ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {submitting ? "Đang gửi..." : "GỬI ĐÁNH GIÁ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFeedback;
