import React, { useState, useEffect } from 'react';
import { Edit, Plus, Save, X } from 'lucide-react';
import InputField  from "../common/InputField";
import AddressBook  from "./AddressBook";
import {  useOutletContext } from 'react-router-dom';
import { profileService} from "../../services/api";
import { useAuth } from '../../contexts/AuthContext';




const PersonalInfoForm = () => {
    const { getCurrentUser } = useAuth();
    const { customerInfo } = useOutletContext();

    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [updateError, setUpdateError] = useState(null);



    useEffect(() => {
        if (customerInfo) {

            let genderString = '';
            if (customerInfo.gender === true) genderString = 'male';
            else if (customerInfo.gender === false) genderString = 'female';

            setFormData({
                customerId: customerInfo.customerId,
                fullName: customerInfo.fullName || '',
                phone: customerInfo.phoneNumber || '',
                gender: genderString,
                email: customerInfo.email || '',
                dateOfBirth: customerInfo.birthDate?.split('T')[0] || '',
            });
        }
    }, [customerInfo]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        if (customerInfo) {
            setFormData({
                customerId: customerInfo.customerId,
                fullName: customerInfo.fullName || '',
                phone: customerInfo.phoneNumber || '',
                gender: customerInfo.gender || '',
                email: customerInfo.email || '',
                dateOfBirth: customerInfo.birthDate?.split('T')[0] || '',
            });
        }
        setIsEditing(false);
    };

    const handleSaveClick = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setUpdateError(null);

        // Tạo request body khớp với CustomerUpdateRequest (Spring Boot)
        const requestBody = {
            fullName: formData.fullName,
            email: formData.email,
            // Chuyển đổi lại giới tính từ string sang boolean
            gender: formData.gender === 'male' ? true : (formData.gender === 'female' ? false : null),
            birthDate: formData.dateOfBirth, // Spring Boot sẽ xử lý chuỗi yyyy-MM-dd
            address: customerInfo.address, // Giữ nguyên address hiện tại (nếu API update không yêu cầu nó)
        };

        const customerId = formData.customerId;

        try {
            const response = await profileService.updateCustomer(customerId, requestBody);

            console.log("Saving data successful:", response);

            await getCurrentUser();

            setIsEditing(false);

        } catch (error) {
            console.error("Lỗi khi lưu thông tin:", error);
            setUpdateError("Lỗi: Không thể cập nhật thông tin. Vui lòng thử lại.");
        } finally {
            setIsSaving(false);
        }
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
    const displayGender = (gender) => {
        if (gender === 'male' || gender === true) return 'Nam';
        if (gender === 'female' || gender === false) return 'Nữ';
        return 'Khác';
    }

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
                        <>
                            <InfoDisplayItem label="Họ và tên" value={formData.fullName} />
                            <InfoDisplayItem label="Số điện thoại" value={formData.phone} />
                            <InfoDisplayItem label="Email" value={formData.email} />
                            <InfoDisplayItem
                                label="Ngày sinh"
                                value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('vi-VN') : '-'}
                            />
                            <InfoDisplayItem label="Giới tính" value={displayGender(formData.gender)} />
                            <InfoDisplayItem label="Địa chỉ mặc định" value={customerInfo.address || "Chưa có"} />
                        </>
                    )}
                </div>
            </div>


            {/* Phần Sổ địa chỉ */}
            <AddressBook />
        </form>
    );
};

export default PersonalInfoForm;