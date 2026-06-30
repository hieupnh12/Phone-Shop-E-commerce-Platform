/**
 * Format số điện thoại từ định dạng quốc tế (84...) sang định dạng Việt Nam (0...)
 * @param {string} phone - Số điện thoại cần format
 * @returns {string} - Số điện thoại đã được format
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Loại bỏ khoảng trắng và ký tự đặc biệt
    const cleaned = phone.toString().replace(/\s+/g, '').replace(/[^\d]/g, '');
    
    // Nếu số điện thoại bắt đầu bằng 84, bỏ đi và thêm 0
    if (cleaned.startsWith('84')) {
        return '0' + cleaned.substring(2);
    }
    
    // Nếu đã có số 0 đầu thì giữ nguyên
    if (cleaned.startsWith('0')) {
        return cleaned;
    }
    
    // Nếu không có số 0 đầu thì thêm vào
    return '0' + cleaned;
};

