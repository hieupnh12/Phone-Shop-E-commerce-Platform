import api from './api';

const feedbackService = {
  // Create feedback
  createFeedback: async (feedbackData) => {
    const response = await api.post('/api/feedbacks', feedbackData);
    return response.data;
  },

  // Get feedbacks by product with optional rating filter
  getFeedbacksByProduct: async (productId, page = 0, size = 10, rating = null) => {
    const params = { page, size };
    if (rating) {
      params.rating = rating;
    }
    const response = await api.get(`/api/feedbacks/product/${productId}`, {
      params
    });
    return response.data;
  },

  // Get my feedbacks
  getMyFeedbacks: async (page = 0, size = 10) => {
    const response = await api.get('/api/feedbacks/my-feedbacks', {
      params: { page, size }
    });
    return response.data;
  },

  // Get feedback by ID
  getFeedbackById: async (feedbackId) => {
    const response = await api.get(`/api/feedbacks/${feedbackId}`);
    return response.data;
  },

  // Update feedback
  updateFeedback: async (feedbackId, feedbackData) => {
    const response = await api.put(`/api/feedbacks/${feedbackId}`, feedbackData);
    return response.data;
  },

  // Delete feedback
  deleteFeedback: async (feedbackId) => {
    const response = await api.delete(`/api/feedbacks/${feedbackId}`);
    return response.data;
  },

  // Get rating statistics
  getRatingStats: async (productId) => {
    const response = await api.get(`/api/feedbacks/stats/product/${productId}`);
    return response.data;
  },

  // Get average rating
  getAverageRating: async (productId) => {
    const response = await api.get(`/api/feedbacks/rating/product/${productId}`);
    return response.data;
  }
};

export default feedbackService;
