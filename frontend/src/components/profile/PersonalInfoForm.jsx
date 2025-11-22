import React, { useState } from 'react';
import { Edit, Plus, Save, X } from 'lucide-react';
// Đảm bảo đường dẫn này chính xác so với vị trí của InputField
import InputField  from "../common/InputField";



const PersonalInfoForm = () => {

    const initialInfo = {
        fullName: 'Nguyễn Nhất Sinh',
        phone: '0982481094',
        gender: 'male',
        email: 'sinh.nguyen@example.com',
        dateOfBirth: '2004-02-13',
    };

    const [customerInfo, setCustomerInfo] = useState(initialInfo);
    const [formData, setFormData] = useState(initialInfo)
    const [isEditing, setIsEditing] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setFormData(customerInfo);
        setIsEditing(false);
    };

    const handleSaveClick = (e) => {
        e.preventDefault();
        // Giả lập logic gọi API và cập nhật trạng thái
        console.log("Saving data:", formData);
        setCustomerInfo(formData);
        setIsEditing(false);
    };

    const handleAddAddressClick = () => {
        // Thực tế sẽ điều hướng hoặc mở modal
        console.log("Thêm địa chỉ được click");
    }

    // Component hiển thị thông tin ở View Mode
    const InfoDisplayItem = ({ label, value }) => (
        // Đảm bảo không có mb-4 ở đây vì khoảng cách sẽ do gap-y-4 của Grid lo
        <div className="flex flex-col">
            <span className="text-gray-500 text-sm">{label}:</span>
            <span className="font-medium text-gray-800 mt-1">
                {value ? value : '-'}
            </span>
        </div>
    );

    return (
        <form onSubmit={handleSaveClick} className="space-y-6">

            {/* Phần Thông tin cá nhân */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between border-b pb-4 mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h3>
                    {isEditing ? (
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="flex items-center text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                            >
                                <Save size={18} className="mr-2" />
                                Lưu thay đổi
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelClick}
                                className="flex items-center text-gray-600 border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
                            >
                                <X size={18} className="mr-2" />
                                Hủy
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleUpdateClick}
                            className="flex items-center text-red-500 hover:text-red-600 transition-colors"
                        >
                            <Edit size={18} className="mr-2" />
                            Cập nhật
                        </button>
                    )}
                </div>

                {/* ✅ Bố cục 2 cột cho View và Edit Mode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {isEditing ? (
                        <>
                            {/* 1. Họ và tên */}
                            <InputField
                                label="Họ và tên"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                            />
                            {/* 2. Số điện thoại (disabled) */}
                            <InputField
                                label="Số điện thoại"
                                name="phone"
                                value={formData.phone}
                                disabled
                                helperText="Liên hệ CSKH để đổi số điện thoại"
                            />
                            {/* 3. Email */}
                            <InputField
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                placeholder="Nhập địa chỉ email"
                            />
                            {/* 4. Ngày sinh */}
                            <InputField
                                label="Ngày sinh"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                            />
                            {/* 5. Giới tính (Select - Chiếm 1 cột) */}
                            {/* 🚨 Lưu ý: Giữ lại div wrapper cho Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Giới tính</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                >
                                    <option value="">Chọn giới tính</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                            {/* Phần còn lại của bố cục 2 cột (ví dụ: một ô trống) */}
                            <div className="hidden md:block"></div>
                        </>
                    ) : (
                        // View Mode
                        <>
                            <InfoDisplayItem label="Họ và tên" value={customerInfo.fullName} />
                            <InfoDisplayItem label="Số điện thoại" value={customerInfo.phone} />
                            <InfoDisplayItem label="Email" value={customerInfo.email} />
                            <InfoDisplayItem label="Ngày sinh" value={customerInfo.dateOfBirth} />
                            <InfoDisplayItem label="Giới tính" value={customerInfo.gender} />
                            <InfoDisplayItem label="Địa chỉ mặc định" value="Chưa có" />
                        </>
                    )}
                </div>
            </div>


            {/* Phần Sổ địa chỉ */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between border-b pb-4 mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Sổ địa chỉ</h3>
                    <button
                        type="button" // Luôn là type button trong form khi không submit
                        onClick={handleAddAddressClick}
                        className="flex items-center text-red-500 hover:text-red-600 transition-colors"
                    >
                        <Plus size={18} className="mr-2" />
                        Thêm địa chỉ
                    </button>
                </div>

                {/* Trạng thái chưa có địa chỉ */}
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                    <img
                        src="https://via.placeholder.com/150/FFDDC1/FF6B6B?text=No+Address"
                        alt="No Address"
                        className="w-40 h-40 mb-4 object-contain"
                    />
                    <p>Bạn chưa có địa chỉ nào được tạo</p>
                </div>
            </div>
        </form>
    );
};

export default PersonalInfoForm;