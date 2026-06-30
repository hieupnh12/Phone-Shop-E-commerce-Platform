/**
 * Utility functions cho Admin Product Management
 */

/**
 * Format tiền tệ
 */
export const formatCurrency = (amount) => {
  if (!amount) return '0 VND';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format ngày tháng
 */
export const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN');
};

/**
 * Validate hình ảnh
 */
export const validateImage = (file) => {
  if (!file) return { valid: true };

  // Kiểm tra loại file
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Vui lòng chọn file hình ảnh' };
  }

  // Kiểm tra kích thước (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'Kích thước hình ảnh không vượt quá 5MB' };
  }

  return { valid: true };
};

/**
 * Tính stock quantity từ các phiên bản
 */
export const calculateTotalStock = (versions) => {
  if (!versions || !Array.isArray(versions)) return 0;
  return versions.reduce((total, version) => total + (version.stockQuantity || 0), 0);
};

/**
 * Parse error message từ API response
 */
export const parseErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    if (Array.isArray(errors)) {
      return errors[0]?.message || 'Có lỗi xảy ra';
    }
    return errors;
  }
  return error.message || 'Có lỗi xảy ra';
};
