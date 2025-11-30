import React from "react";
import {
  X,
  Star,
  Camera,
  Upload,
  Trash2,
  Zap,
  Clock,
  User,
} from "lucide-react";

// Dữ liệu giả định cho phần hiển thị (theo hình ảnh)
const mockDisplayData = {
  productNameDisplay: "iPhone 16 Plus 128GB | Chính hãng VN/A",
  overallRating: 4.8,
  totalReviews: 31,
  ratingDistribution: [
    { stars: 5, count: 26, percentage: 26 / 31 },
    { stars: 4, count: 5, percentage: 5 / 31 },
    { stars: 3, count: 0, percentage: 0 / 31 },
    { stars: 2, count: 0, percentage: 0 / 31 },
    { stars: 1, count: 0, percentage: 0 / 31 },
  ],
  experienceRatingsDisplay: [
    { label: "Hiệu năng", rating: 5, count: 11 },
    { label: "Thời lượng pin", rating: 5, count: 11 },
    { label: "Chất lượng camera", rating: 5, count: 11 },
  ],
  filters: [
    "Tất cả",
    "Có hình ảnh",
    "Đã mua hàng",
    "5 sao",
    "4 sao",
    "3 sao",
    "2 sao",
    "1 sao",
  ],
  sampleReview: {
    user: "A Tuấn",
    rating: 5,
    text: "Tuyệt vời với 16pl 128gb màu trắng cửa hàng tại Thơm ĐNai có hàng k ạ.",
    date: "Đánh giá đã đăng vào 3 tháng trước",
  },
};

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

const ProductFeedback = () => {
  // --- STATE CỦA POPUP (Giữ nguyên từ code gốc của bạn) ---
  const [showReviewPopup, setShowReviewPopup] = React.useState(false);
  const [overallRating, setOverallRating] = React.useState(0);
  const [experienceRatings, setExperienceRatings] = React.useState({
    performance: 0,
    battery: 0,
    camera: 0,
  });
  const [reviewText, setReviewText] = React.useState("");
  const [uploadedImages, setUploadedImages] = React.useState([]);

  const product = {
    name: "Điện thoại iPhone 16 Pro Max 256GB",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200",
  };

  const overallRatingLabels = [
    { value: 1, label: "Rất Tệ" },
    { value: 2, label: "Tệ" },
    { value: 3, label: "Bình thường" },
    { value: 4, label: "Tốt" },
    { value: 5, label: "Tuyệt vời" },
  ];

  const experienceCategories = [
    { key: "performance", label: "Hiệu năng", description: "Siêu mạnh mẽ" },
    { key: "battery", label: "Thời lượng pin", description: "Cực khủng" },
    {
      key: "camera",
      label: "Chất lượng camera",
      description: "Chụp đẹp, chuyên nghiệp",
    },
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      file: file,
    }));
    setUploadedImages([...uploadedImages, ...newImages].slice(0, 8)); // Giới hạn 8 ảnh
  };

  const removeImage = (id) => {
    setUploadedImages(uploadedImages.filter((img) => img.id !== id));
  };

  const handleSubmit = () => {
    if (!overallRating || reviewText.length < 15) return;
    const reviewData = {
      overallRating,
      experienceRatings,
      reviewText,
      images: uploadedImages,
    };
    console.log("Submitting review:", reviewData);
    // Reset form
    setShowReviewPopup(false);
    setOverallRating(0);
    setExperienceRatings({ performance: 0, battery: 0, camera: 0 });
    setReviewText("");
    setUploadedImages([]);
  };
  // --- Hết STATE CỦA POPUP ---

  // --- LOGIC CỦA DISPLAY (Theo hình ảnh) ---
  const {
    productNameDisplay,
    overallRating: avgRatingDisplay,
    totalReviews,
    ratingDistribution,
    experienceRatingsDisplay,
    filters,
    sampleReview,
  } = mockDisplayData;

  const averageRating = avgRatingDisplay.toFixed(1);

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 font-sans">
      <div className="bg-white shadow-xl rounded-xl p-6 md:items-center">
        {/* Phần 1: Giao diện hiển thị đánh giá (giống hình ảnh) */}
        <h1 className="text-xl font-bold text-gray-800 mb-6 pb-2">
          Đánh giá {productNameDisplay}
        </h1>

        <div className="flex flex-wrap md:flex-nowrap justify-between items-start mb-8 gap-6">
          {/* Left + center block: Rating summary and distribution (stack on small, row on md) */}
          <div className="w-full md:w-2/3 flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Rating summary */}
            <div className="w-full md:w-1/3 bg-white text-center">
              <div className="flex items-center mb-3 justify-center">
                <span className="text-5xl font-bold text-gray-900 mr-2">
                  {averageRating}
                </span>
                <span className="text-xl text-gray-600">/5</span>
              </div>

              <div className="flex flex-col mb-4">
                <StarRating
                  rating={Math.floor(avgRatingDisplay)}
                  size="medium"
                  interactive={false}
                />

                <span className="text-base text-gray-600 mt-1">
                  {totalReviews} lượt đánh giá
                </span>
              </div>

              <button
                onClick={() => setShowReviewPopup(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-md"
              >
                Viết đánh giá
              </button>
            </div>

            {/* Rating distribution (aligned top, same width as summary) */}
            <div className="w-full md:w-2/3 align-center">
              <div className="space-y-2">
                {ratingDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center">
                    <span className="w-8 text-sm font-medium text-gray-700 mr-2">
                      {item.stars}⭐
                    </span>
                    <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-red-600 h-2.5 rounded-full"
                        style={{
                          width: `${Math.round(item.percentage * 100)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="w-20 text-sm text-gray-600 text-right">
                      {item.count} đánh giá
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right block: Experience ratings */}
          <div className="w-full md:w-1/2 md:pl-6 md:border-l border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Đánh giá theo trải nghiệm
            </h2>
            <div className="space-y-3">
              {experienceRatingsDisplay.map((exp) => (
                <div
                  key={exp.label}
                  className="flex justify-between items-center"
                >
                  <span className="text-base text-gray-700">{exp.label}</span>
                  <div className="flex items-center">
                    <StarRating
                      rating={exp.rating}
                      size="small"
                      interactive={false}
                    />
                    <span className="text-sm font-semibold text-gray-800 mx-2">
                      {exp.rating}/5
                    </span>
                    <span className="text-sm text-gray-500">
                      ({exp.count} đánh giá)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Phần Lọc đánh giá và Review đơn lẻ --- */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Lọc đánh giá theo
          </h2>

          {/* Các nút lọc */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.map((filter, index) => (
              <button
                key={filter}
                className={`py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                  index === 0 // Giả định "Tất cả" là nút đang được chọn
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Review đơn lẻ */}
          <div className="mt-6">
            <div className="flex items-start mb-3">
              <span className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full font-bold text-gray-700 mr-3 mt-1">
                {sampleReview.user[0]}
              </span>
              <div>
                <span className="font-semibold text-gray-800 block">
                  {sampleReview.user}
                </span>
                <div className="flex items-center mt-1">
                  <StarRating
                    rating={sampleReview.rating}
                    size="small"
                    interactive={false}
                  />
                  <span className="text-base font-semibold text-gray-800 ml-2">
                    Tuyệt vời
                  </span>
                </div>
                <p className="text-gray-700 my-2">{sampleReview.text}</p>
                <p className="text-xs text-gray-500">{sampleReview.date}</p>
              </div>
            </div>
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
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Chia sẻ trải nghiệm của bạn
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Overall Rating */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                  Đánh giá chung
                </h3>
                <div className="flex justify-between items-center mb-4">
                  {overallRatingLabels.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setOverallRating(item.value)}
                      className="flex flex-col items-center gap-2 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          overallRating >= item.value
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          overallRating >= item.value
                            ? "text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Ratings */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                  Theo trải nghiệm
                </h3>
                <div className="space-y-4">
                  {experienceCategories.map((category) => (
                    <div
                      key={category.key}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {category.label}
                          </p>
                          <p className="text-sm text-gray-600">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-center mt-3">
                        <StarRating
                          rating={experienceRatings[category.key]}
                          onRate={(rating) =>
                            setExperienceRatings({
                              ...experienceRatings,
                              [category.key]: rating,
                            })
                          }
                          size="medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block font-semibold text-gray-900 mb-2">
                  Viết đánh giá của bạn
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Xin mời chia sẻ một số cảm nhận về sản phẩm (nhập tối thiểu 15 kí tự)"
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 mt-1 text-right">
                  {reviewText.length}/500 ký tự
                </p>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block font-semibold text-gray-900 mb-3">
                  Thêm hình ảnh (tùy chọn)
                </label>

                <div className="grid grid-cols-4 gap-3">
                  {/* Uploaded Images */}
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt="Review"
                        className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Upload Button */}
                  {uploadedImages.length < 8 && (
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Camera className="w-8 h-8 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500 text-center px-2">
                        Thêm ảnh
                      </span>
                    </label>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  📷 Tối đa 8 ảnh, mỗi ảnh không quá 5MB
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
                disabled={!overallRating || reviewText.length < 15}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  overallRating && reviewText.length >= 15
                    ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                GỬI ĐÁNH GIÁ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFeedback;
