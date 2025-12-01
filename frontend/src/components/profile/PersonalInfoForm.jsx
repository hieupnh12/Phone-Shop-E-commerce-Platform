import React, { useState, useEffect } from 'react';
import { Edit, Plus, Save, X } from 'lucide-react';
import InputField  from "../common/InputField";
import AddressBook  from "./AddressBook";
import {  useOutletContext } from 'react-router-dom';
import { profileService} from "../../services/api";
import { useAuthFullOptions } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatPhoneNumber } from "../../utils/phoneUtils";




const PersonalInfoForm = () => {
    const { t } = useLanguage();
    const { getCurrentUser } = useAuthFullOptions();
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
                address: customerInfo.address || '',
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
                address: customerInfo.address || '',
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
            // Chỉ gửi email nếu có giá trị (không rỗng)
            ...(formData.email && formData.email.trim() !== '' && { email: formData.email.trim() }),
            // Chuyển đổi lại giới tính từ string sang boolean
            gender: formData.gender === 'male' ? true : (formData.gender === 'female' ? false : null),
            birthDate: formData.dateOfBirth, // Spring Boot sẽ xử lý chuỗi yyyy-MM-dd
            address: formData.address || '', // Gửi địa chỉ từ form
        };

        const customerId = formData.customerId;

        try {
            const response = await profileService.updateCustomer(customerId, requestBody);

            console.log("Saving data successful:", response);

            await getCurrentUser();

            setIsEditing(false);

        } catch (error) {
            console.error("Lỗi khi lưu thông tin:", error);
            setUpdateError(t('personalInfo.updateError'));
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
        if (gender === 'male' || gender === true) return t('personalInfo.gender.male');
        if (gender === 'female' || gender === false) return t('personalInfo.gender.female');
        return t('personalInfo.gender.other');
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSaveClick}>
                {/* Phần Thông tin cá nhân */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between border-b pb-4 mb-6">
                        <h3 className="text-xl font-bold text-gray-800">{t('personalInfo.title')}</h3>
                        {isEditing ? (
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    className="flex items-center text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Save size={18} className="mr-2" />
                                    {t('personalInfo.saveChanges')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelClick}
                                    className="flex items-center text-gray-600 border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <X size={18} className="mr-2" />
                                    {t('common.cancel')}
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleUpdateClick}
                                className="flex items-center text-red-500 hover:text-red-600 transition-colors"
                            >
                                <Edit size={18} className="mr-2" />
                                {t('common.update')}
                            </button>
                        )}
                    </div>

                    {/* ✅ Bố cục 2 cột cho View và Edit Mode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {isEditing ? (
                            <>
                                {/* 1. Họ và tên */}
                                <InputField
                                    label={t('personalInfo.fullName')}
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                />
                                {/* 2. Số điện thoại (disabled) */}
                                <InputField
                                    label={t('common.phone')}
                                    name="phone"
                                    value={formData.phone}
                                    disabled
                                    helperText={t('personalInfo.contactToChangePhone')}
                                />
                                {/* 3. Email */}
                                <InputField
                                    label={t('personalInfo.email')}
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder={t('personalInfo.emailPlaceholder')}
                                />
                                {/* 4. Ngày sinh */}
                                <InputField
                                    label={t('personalInfo.dateOfBirth')}
                                    name="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                />
                                {/* 5. Giới tính (Select - Chiếm 1 cột) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('personalInfo.gender.label')}</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                    >
                                        <option value="">{t('personalInfo.gender.select')}</option>
                                        <option value="male">{t('personalInfo.gender.male')}</option>
                                        <option value="female">{t('personalInfo.gender.female')}</option>
                                        <option value="other">{t('personalInfo.gender.other')}</option>
                                    </select>
                                </div>
                                {/* 6. Địa chỉ (Chiếm 1 cột) */}
                                <InputField
                                    label={t('profile.defaultAddress')}
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder={t('personalInfo.addressPlaceholder')}
                                />
                            </>
                        ) : (
                            <>
                                <InfoDisplayItem label={t('personalInfo.fullName')} value={formData.fullName} />
                                <InfoDisplayItem label={t('common.phone')} value={formatPhoneNumber(formData.phone)} />
                                <InfoDisplayItem label={t('personalInfo.email')} value={formData.email} />
                                <InfoDisplayItem
                                    label={t('personalInfo.dateOfBirth')}
                                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('vi-VN') : '-'}
                                />
                                <InfoDisplayItem label={t('personalInfo.gender.label')} value={displayGender(formData.gender)} />
                                <InfoDisplayItem label={t('profile.defaultAddress')} value={customerInfo.address || t('profile.noAddress')} />
                            </>
                        )}
                    </div>
                </div>
            </form>

            {/* Phần Sổ địa chỉ - Đặt ra ngoài form để tránh form nesting */}
            <AddressBook />
        </div>
    );
};

export default PersonalInfoForm;