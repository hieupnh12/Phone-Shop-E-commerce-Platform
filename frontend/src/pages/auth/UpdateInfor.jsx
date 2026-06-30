import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import loginService from "../../services/loginService";
import Cookies from "js-cookie";
import constants from "../../constants";
import { useAuthFullOptions } from "../../contexts/AuthContext";
import Toast from "../../components/common/Toast";

export default function RegistrationForm() {
    const location = useLocation();
    const navigate = useNavigate();

    const [tempToken, setTempToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const { handleCustomerLoginSuccess, setUser, user } = useAuthFullOptions();
    console.log("uss", user);
    
    // Ref cho input số điện thoại
    const phoneInputRef = useRef(null);
    
    // Ref để lưu timeout ID
    const timeoutRef = useRef(null);
    
    // State cho toast
    const [toast, setToast] = useState(null);
    
    // 1. Loại bỏ Email khỏi state
    const [formData, setFormData] = useState({
        fullName: '',
        birthDate: '',
        phone: '',
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('tempToken');

        if (token) {
            setTempToken(token);
        } else {
            navigate('/login', { replace: true });
        }
        setIsLoading(false);
    }, [location, navigate]);

    // Timeout 3 phút: tự động chuyển về login nếu không hoàn tất đăng ký
    useEffect(() => {
        // Chỉ chạy khi đã load xong và có tempToken
        if (isLoading || !tempToken) {
            return;
        }

        // Clear timeout cũ nếu có
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        const timeoutDuration = 3 * 60 * 1000; // 3 phút = 180000ms
        const startTime = Date.now();
        
        console.log('⏰ Bắt đầu đếm ngược 3 phút cho phiên đăng ký...', new Date().toLocaleTimeString());
        
        timeoutRef.current = setTimeout(() => {
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            console.log(`⏰ Đã hết ${elapsed} giây (3 phút), chuyển về trang login`);
            setToast({
                message: 'Phiên đăng ký đã hết hạn (3 phút). Vui lòng đăng nhập lại',
                type: 'error'
            });
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 2000);
        }, timeoutDuration);

        // Cleanup timeout khi component unmount hoặc dependencies thay đổi
        return () => {
            if (timeoutRef.current) {
                console.log('🧹 Clear timeout');
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [tempToken, isLoading, navigate]); // Depend vào cả isLoading để đảm bảo chỉ chạy khi đã load xong


    // Validate ngày sinh theo nghiệp vụ thực tế
    const validateBirthDate = (birthDate) => {
        if (!birthDate || birthDate.trim() === '') {
            return { valid: true, message: '' }; // Ngày sinh là optional
        }
        
        // Kiểm tra format yyyy-MM-dd
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(birthDate)) {
            return { valid: false, message: 'Ngày sinh phải có định dạng yyyy-MM-dd (ví dụ: 2000-01-15)' };
        }
        
        // Parse ngày sinh
        const birth = new Date(birthDate + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Kiểm tra ngày hợp lệ
        if (isNaN(birth.getTime())) {
            return { valid: false, message: 'Ngày sinh không hợp lệ' };
        }
        
        // Kiểm tra ngày sinh không được là tương lai
        if (birth > today) {
            return { valid: false, message: 'Ngày sinh không được là ngày trong tương lai' };
        }
        
        // Kiểm tra tuổi hợp lý (không quá 150 tuổi, không quá nhỏ - ví dụ: ít nhất 5 tuổi)
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        const dayDiff = today.getDate() - birth.getDate();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
        
        if (actualAge > 150) {
            return { valid: false, message: 'Ngày sinh không hợp lệ (quá cũ)' };
        }
        
        if (actualAge < 5) {
            return { valid: false, message: 'Ngày sinh không hợp lệ (quá nhỏ)' };
        }
        
        return { valid: true, message: '', normalized: birthDate };
    };

    // Validate số điện thoại theo pattern backend: ^(0)[0-9]{9}$
    // Phải bắt đầu bằng 0 và có đúng 10 chữ số
    const validatePhoneNumber = (phone) => {
        if (!phone || phone.trim() === '') {
            return { valid: false, message: 'Vui lòng nhập số điện thoại' };
        }
        
        // Loại bỏ khoảng trắng và ký tự đặc biệt
        const cleanedPhone = phone.replace(/\s+/g, '').replace(/[-\+()]/g, '');
        
        // Kiểm tra pattern: bắt đầu bằng 0 và có đúng 10 chữ số
        const phonePattern = /^(0)[0-9]{9}$/;
        
        if (!phonePattern.test(cleanedPhone)) {
            // Kiểm tra các trường hợp cụ thể để đưa ra message rõ ràng hơn
            if (cleanedPhone.length === 0) {
                return { valid: false, message: 'Vui lòng nhập số điện thoại' };
            }
            if (!cleanedPhone.startsWith('0')) {
                return { valid: false, message: 'Số điện thoại phải bắt đầu bằng 0' };
            }
            if (cleanedPhone.length !== 10) {
                return { valid: false, message: 'Số điện thoại phải có đúng 10 chữ số' };
            }
            if (!/^\d+$/.test(cleanedPhone)) {
                return { valid: false, message: 'Số điện thoại chỉ được chứa chữ số' };
            }
            return { valid: false, message: 'Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng (0xxxxxxxxx)' };
        }
        
        return { valid: true, message: '', normalized: cleanedPhone };
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        // Kiểm tra họ và tên
        if (!formData.fullName || formData.fullName.trim() === '') {
            setToast({
                message: 'Vui lòng nhập họ và tên',
                type: 'error'
            });
            return;
        }
        
        // Validate số điện thoại
        const phoneValidation = validatePhoneNumber(formData.phone);
        if (!phoneValidation.valid) {
            setToast({
                message: phoneValidation.message,
                type: 'error'
            });
            if (phoneInputRef.current) {
                phoneInputRef.current.focus();
                phoneInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Validate ngày sinh (nếu có)
        if (formData.birthDate) {
            const birthDateValidation = validateBirthDate(formData.birthDate);
            if (!birthDateValidation.valid) {
                setToast({
                    message: birthDateValidation.message,
                    type: 'error'
                });
                return;
            }
        }

        if (!tempToken) {
            setToast({
                message: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại',
                type: 'error'
            });
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 2000);
            return;
        }

        try {
            // Validate và normalize ngày sinh nếu có
            let normalizedBirthDate = null;
            if (formData.birthDate) {
                const birthDateValidation = validateBirthDate(formData.birthDate);
                if (birthDateValidation.valid && birthDateValidation.normalized) {
                    normalizedBirthDate = birthDateValidation.normalized;
                }
            }

            const requestData = {
                fullName: formData.fullName.trim(),
                phoneNumber: phoneValidation.normalized,
                birthDate: normalizedBirthDate,
            };

            const response = await loginService.postCompleteProfile(requestData, tempToken);
            setUser("dđ");

            const finalJwt = response.result.token;
            
            // Clear timeout khi submit thành công
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            
            handleCustomerLoginSuccess(finalJwt);
            
            // Clear tempToken để cleanup timeout
            setTempToken(null);
            
            setToast({
                message: 'Đăng ký thành công! Đang chuyển hướng...',
                type: 'success'
            });
            
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 1500);

        } catch (error) {
            let errorMessage = 'Cập nhật thất bại. Vui lòng thử lại sau.';

            if (error.response && error.response.data) {
                errorMessage = error.response.data.message || error.response.data.error || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }

            console.error('Lỗi cập nhật hồ sơ:', error);
            setToast({
                message: errorMessage,
                type: 'error'
            });
        }
    };

    const handleBack = () => {
        navigate('/login');
    };

    // --- RENDER ---
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-cyan-400">
                <svg className="animate-spin h-8 w-8 mr-3 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý phiên đăng nhập...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

                <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
                            Hoàn tất Hồ sơ
                        </h1>
                        <p className="text-slate-400 text-lg">Vui lòng cung cấp Số điện thoại để hoàn tất đăng ký.</p>
                        <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mt-3"></div>
                    </div>

                    <h2 className="text-xl font-semibold text-slate-200 mb-8">Thông tin cơ bản</h2>

                    <div>
                        {/* 3. BỐ CỤC 2 CỘT CÂN ĐỐI CHO 3 TRƯỜNG */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                            {/* Họ và tên (Cột 1, Hàng 1) */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-300">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Nhập họ và tên"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200"
                                />
                            </div>

                            {/* Ngày sinh (Cột 2, Hàng 1) */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-300">
                                    Ngày sinh (Tùy chọn)
                                </label>
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200"
                                />
                            </div>

                            {/* Số điện thoại (Cột 1, Hàng 2 - chiếm 2 cột) */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    ref={phoneInputRef}
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Nhập số điện thoại"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200"
                                    required
                                />
                            </div>

                            {/* 4. ĐÃ LOẠI BỎ TRƯỜNG EMAIL */}

                        </div>

                        {/* Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-6 py-3 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg font-semibold hover:bg-slate-700 hover:border-slate-500 transition duration-200 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Quay lại đăng nhập
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 transition duration-200"
                            >
                                Hoàn tất đăng ký
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}