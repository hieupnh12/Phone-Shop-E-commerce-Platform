import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import loginService from "../../services/loginService";
import Cookies from "js-cookie";
import constants from "../../constants";
import { useAuthFullOptions } from "../../contexts/AuthContext";

export default function RegistrationForm() {
    const location = useLocation();
    const navigate = useNavigate();

    const [tempToken, setTempToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const { handleCustomerLoginSuccess, setUser, user } = useAuthFullOptions();
    console.log("uss", user);
    
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


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.fullName || !formData.phone) {
            console.error('Lỗi: Vui lòng điền đầy đủ thông tin bắt buộc!');
            alert('Vui lòng điền đầy đủ Họ và tên, Số điện thoại!');
            return;
        }

        if (!tempToken) {
            navigate('/login', { replace: true });
            return;
        }

        try {
            const requestData = {
                fullName: formData.fullName,
                phoneNumber: formData.phone,
                birthDate: formData.birthDate || null,
            };

            const response = await loginService.postCompleteProfile(requestData, tempToken);
            setUser("dđ");

            const finalJwt = response.result.token;
            
           // localStorage.setItem('jwtToken', finalJwt)

            //  Cookies.set(constants.ACCESS_TOKEN_KEY, finalJwt);
            // console.log(finalJwt + "")
            handleCustomerLoginSuccess(finalJwt);
            navigate('/', { replace: true });

        } catch (error) {

            let errorMessage = 'Lỗi không xác định.';

            if (error.response && error.response.data) {
                errorMessage = error.response.data.message || error.response.data.error || 'Lỗi xử lý nghiệp vụ.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            console.error('Lỗi cập nhật hồ sơ:', error);
            alert('Cập nhật thất bại: Số điện thoại đã tồn tại');
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
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Nhập số điện thoại"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200"
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
        </div>
    );
}