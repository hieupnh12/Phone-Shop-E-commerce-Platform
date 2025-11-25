import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import InputField from '../common/InputField';

const initialFormState = {
    name: '',
    phone: '',
    city: '',
    district: '',
    ward: '',
    street: '',
    isDefault: false,
};

const AddressForm = ({ addressToEdit, onClose, onSave }) => {
    const [formData, setFormData] = useState(addressToEdit || initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setFormData(addressToEdit || initialFormState);
    }, [addressToEdit]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await onSave(formData, !!addressToEdit);
            onClose();
        } catch (err) {
            console.error("Lỗi khi lưu địa chỉ:", err);
            setError("Lỗi: Không thể lưu địa chỉ. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const isEditMode = !!addressToEdit;

    return (
        // Modal Wrapper
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

                    {/* Hàng 1: Tên và SĐT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Tên người nhận"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="Số điện thoại"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            type="tel"
                            required
                        />
                    </div>

                    {/* Hàng 2: Tỉnh/Thành phố & Quận/Huyện */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Tỉnh/Thành phố"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="Quận/Huyện"
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Hàng 3: Phường/Xã & Địa chỉ chi tiết */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Phường/Xã"
                            name="ward"
                            value={formData.ward}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="Địa chỉ chi tiết (Số nhà, đường)"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Checkbox Mặc định */}
                    <div className="flex items-center pt-2">
                        <input
                            id="isDefault"
                            name="isDefault"
                            type="checkbox"
                            checked={formData.isDefault}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                            Đặt làm địa chỉ mặc định
                        </label>
                    </div>

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
                            {isLoading ? 'Đang lưu...' : (isEditMode ? 'Lưu Thay Đổi' : 'Thêm Địa Chỉ')}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default AddressForm;