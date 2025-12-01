import React, { useState } from 'react';
import { X, AlertCircle, Shield, RefreshCw } from 'lucide-react';
import { warrantyRequestService } from '../../services/api';
import Toast from './Toast';

const WarrantyRequestModal = ({ isOpen, onClose, orderId, productVersionId, productName }) => {
    const [formData, setFormData] = useState({
        type: 'WARRANTY', // WARRANTY or EXCHANGE
        reason: '',
        appointmentDate: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.reason.trim()) {
            setToast({
                type: 'error',
                message: 'Vui lòng nhập lý do yêu cầu bảo hành/đổi trả'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const requestData = {
                orderId: orderId,
                productVersionId: productVersionId,
                type: formData.type,
                reason: formData.reason,
                appointmentDate: formData.appointmentDate || null
            };

            await warrantyRequestService.createRequest(requestData);
            
            setToast({
                type: 'success',
                message: 'Yêu cầu bảo hành/đổi trả đã được gửi thành công!'
            });

            // Reset form
            setFormData({
                type: 'WARRANTY',
                reason: '',
                appointmentDate: ''
            });

            // Close modal after 1.5 seconds
            setTimeout(() => {
                onClose(true); // Pass true to indicate success
            }, 1500);
        } catch (error) {
            console.error('Error creating warranty request:', error);
            const errorMessage = error.response?.data?.message 
                || error.message 
                || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.';
            setToast({
                type: 'error',
                message: errorMessage
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Yêu cầu bảo hành/đổi trả</h2>
                            <p className="text-sm text-gray-500 mt-1">{productName}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onClose(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Request Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại yêu cầu <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                formData.type === 'WARRANTY' 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="WARRANTY"
                                    checked={formData.type === 'WARRANTY'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className="flex items-center gap-3">
                                    <Shield className={`w-5 h-5 ${
                                        formData.type === 'WARRANTY' ? 'text-blue-600' : 'text-gray-400'
                                    }`} />
                                    <div>
                                        <div className="font-medium text-gray-900">Bảo hành</div>
                                        <div className="text-xs text-gray-500">Sửa chữa sản phẩm</div>
                                    </div>
                                </div>
                            </label>

                            <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                formData.type === 'EXCHANGE' 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="EXCHANGE"
                                    checked={formData.type === 'EXCHANGE'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className="flex items-center gap-3">
                                    <RefreshCw className={`w-5 h-5 ${
                                        formData.type === 'EXCHANGE' ? 'text-blue-600' : 'text-gray-400'
                                    }`} />
                                    <div>
                                        <div className="font-medium text-gray-900">Đổi trả</div>
                                        <div className="text-xs text-gray-500">Đổi sản phẩm mới</div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lý do yêu cầu <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Vui lòng mô tả chi tiết vấn đề của sản phẩm..."
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Mô tả càng chi tiết sẽ giúp chúng tôi xử lý yêu cầu của bạn nhanh hơn
                        </p>
                    </div>

                    {/* Appointment Date (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày hẹn (Tùy chọn)
                        </label>
                        <input
                            type="datetime-local"
                            name="appointmentDate"
                            value={formData.appointmentDate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Chọn ngày và giờ bạn muốn đến cửa hàng (nếu có)
                        </p>
                    </div>

                    {/* Info Alert */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Lưu ý:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                <li>Yêu cầu của bạn sẽ được xem xét trong vòng 24-48 giờ</li>
                                <li>Nhân viên sẽ liên hệ với bạn để xác nhận và hướng dẫn các bước tiếp theo</li>
                                <li>Vui lòng giữ nguyên sản phẩm và hộp đựng gốc (nếu có)</li>
                            </ul>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => onClose(false)}
                            className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Đang gửi...
                                </>
                            ) : (
                                'Gửi yêu cầu'
                            )}
                        </button>
                    </div>
                </form>

                {/* Toast */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default WarrantyRequestModal;

