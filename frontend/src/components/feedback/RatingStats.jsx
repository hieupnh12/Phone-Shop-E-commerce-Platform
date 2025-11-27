import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import feedbackService from '../../services/feedbackService';

const RatingStats = ({ productId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await feedbackService.getRatingStats(productId);
        setStats(data);
      } catch (error) {
        console.error('Error loading rating stats:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  if (loading) {
    return <div className="text-center py-4">Đang tải thống kê...</div>;
  }

  if (!stats) {
    return null;
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const ratingBars = [
    { stars: 5, count: stats.five_star_count },
    { stars: 4, count: stats.four_star_count },
    { stars: 3, count: stats.three_star_count },
    { stars: 2, count: stats.two_star_count },
    { stars: 1, count: stats.one_star_count },
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">
            {stats.average_rating.toFixed(1)}
          </div>
          <div className="flex gap-1 mt-2 justify-center">
            {renderStars(stats.average_rating)}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ({stats.total_reviews} đánh giá)
          </p>
        </div>

        <div className="flex-1 space-y-3">
          {ratingBars.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-3">
              <div className="w-12 text-sm font-medium">
                {bar.stars} <Star className="w-3 h-3 inline fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{
                    width: stats.total_reviews > 0
                      ? `${(bar.count / stats.total_reviews) * 100}%`
                      : '0%'
                  }}
                />
              </div>
              <div className="w-10 text-right text-sm text-gray-600">
                {bar.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingStats;
