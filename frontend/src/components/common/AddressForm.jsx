import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import InputField from '../common/InputField';
import { customerService } from '../../services/api';

const AddressForm = ({ addressToEdit, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        city: '',
        ward: '',
        street: '',
    });
    const [customerInfo, setCustomerInfo] = useState({
        fullName: '',
        phoneNumber: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCustomer, setIsLoadingCustomer] = useState(true);
    const [error, setError] = useState(null);

    // Load customer info để lấy tên và số điện thoại
    useEffect(() => {
        const loadCustomerInfo = async () => {
            try {
                setIsLoadingCustomer(true);
                const response = await customerService.getMyCustomerInfo();
                const customer = response?.result || response;
                setCustomerInfo({
                    fullName: customer.fullName || '',
                    phoneNumber: customer.phoneNumber || ''
                });
            } catch (err) {
                console.error("Lỗi khi tải thông tin khách hàng:", err);
            } finally {
                setIsLoadingCustomer(false);
            }
        };
        loadCustomerInfo();
    }, []);

    useEffect(() => {
        if (addressToEdit) {
            // Parse address từ string: "street, ward, city"
            const addressParts = addressToEdit.address ? addressToEdit.address.split(',').map(s => s.trim()) : [];
            setFormData({
                city: addressParts.length >= 3 ? addressParts[addressParts.length - 1] : '',
                ward: addressParts.length >= 2 ? addressParts[addressParts.length - 2] : '',
                street: addressParts.length >= 1 ? addressParts.slice(0, -2).join(', ') : '',
            });
        } else {
            setFormData({
                city: '',
                ward: '',
                street: '',
            });
        }
    }, [addressToEdit]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Tạo địa chỉ đầy đủ: "street, ward, city"
            const fullAddress = `${formData.street}, ${formData.ward}, ${formData.city}`.trim();
            
            if (!formData.street || !formData.ward || !formData.city) {
                setError("Vui lòng điền đầy đủ thông tin địa chỉ");
                setIsLoading(false);
                return;
            }

            console.log("Submitting form with address:", fullAddress);
            await onSave({ address: fullAddress }, !!addressToEdit);
            console.log("Save successful, closing form");
            onClose();
        } catch (err) {
            console.error("Lỗi khi lưu địa chỉ:", err);
            console.error("Error response:", err.response);
            setError("Lỗi: Không thể lưu địa chỉ. " + (err.response?.data?.message || err.message || "Vui lòng thử lại."));
            setIsLoading(false);
        }
    };

    const isEditMode = !!addressToEdit;

    if (isLoadingCustomer) {
        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                    <p className="text-center text-gray-500">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative animate-fade-in">
                {/* Header Modal */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <MapPin size={22} className="text-red-500 mr-2" />
                        {isEditMode ? 'Chỉnh sửa Địa chỉ' : 'Thêm Địa chỉ Mới'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Form Nội dung */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Tên người nhận và SĐT - Disabled */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Tên người nhận"
                            name="fullName"
                            value={customerInfo.fullName}
                            disabled
                            helperText="Lấy từ thông tin cá nhân"
                        />
                        <InputField
                            label="Số điện thoại"
                            name="phoneNumber"
                            value={customerInfo.phoneNumber}
                            disabled
                            helperText="Lấy từ thông tin cá nhân"
                        />
                    </div>

                    {/* Tỉnh/Thành phố */}
                    <InputField
                        label="Tỉnh/Thành phố"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder="Ví dụ: Đà Nẵng"
                    />

                    {/* Phường/Xã */}
                    <InputField
                        label="Phường/Xã"
                        name="ward"
                        value={formData.ward}
                        onChange={handleInputChange}
                        required
                        placeholder="Ví dụ: Phường Hoà Quý"
                    />

                    {/* Địa chỉ chi tiết */}
                    <InputField
                        label="Địa chỉ chi tiết (Số nhà, đường)"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        required
                        placeholder="Ví dụ: 27 Tran Dai Nghia"
                    />

                    {/* Footer Modal */}
                    <div className="pt-4 flex justify-end space-x-3">
                        {error && <p className="text-sm text-red-500 mr-auto flex items-center">{error}</p>}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            disabled={isLoading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm Địa Chỉ')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddressForm;
