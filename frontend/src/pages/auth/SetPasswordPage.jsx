import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertTriangle, CheckCircle, Save, Loader2 } from 'lucide-react';
import loginApi from "../../services/loginService";


const SetPasswordPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // State để lấy token từ URL
    const [token, setToken] = useState(null);
    // State form
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // State giao diện
    const [status, setStatus] = useState('loading'); // loading, form, success, error
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. LẤY TOKEN KHI COMPONENT LOAD
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlToken = params.get('token');

        if (!urlToken) {
            setStatus('error');
            setMessage('Liên kết đặt lại mật khẩu không hợp lệ.');
            return;
        }
        setToken(urlToken);
        setStatus('form');
    }, [location]);


    // 2. LOGIC XỬ LÝ SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (password.length < 6) {
            setMessage('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (password !== confirmPassword) {
            setMessage('Mật khẩu xác nhận không khớp.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                token: token,
                newPassword: password, // Backend sẽ mã hóa mật khẩu này
            };

            // 🚨 GỌI API ĐẶT LẠI MẬT KHẨU
            // Giả định loginApi.setPasswordFirst(payload) đã được định nghĩa
            await loginApi.setPasswordFirst(payload);

            setStatus('success');
            setMessage('Đặt mật khẩu thành công! Bạn có thể đăng nhập ngay.');

            // Tự động chuyển hướng về trang Admin Login sau 3 giây
            setTimeout(() => {
                navigate('/admin-login', { replace: true });
            }, 3000);

        } catch (err) {
            console.error("Lỗi đặt lại mật khẩu:", err);
            setStatus('error');
            setMessage(err.response?.data?.message || 'Liên kết đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 3. LOGIC RENDER THEO TRẠNG THÁI
    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="flex items-center text-blue-600">
                        <Loader2 className="w-6 h-6 animate-spin mr-3" />
                        Đang kiểm tra liên kết...
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center text-green-600">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Thành công!</h2>
                        <p className="text-lg mb-4">{message}</p>
                        <Link to="/admin-login" className="text-sm font-semibold text-blue-600 hover:underline">
                            → Chuyển đến trang Đăng nhập
                        </Link>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-center text-red-600">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Liên kết không hợp lệ</h2>
                        <p className="text-lg mb-4">{message}</p>
                        <Link to="/admin-login" className="text-sm font-semibold text-blue-600 hover:underline">
                            ← Quay lại trang Đăng nhập
                        </Link>
                    </div>
                );

            case 'form':
            default:
                return (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800 text-center">Đặt Mật khẩu Mới</h2>
                        <p className="text-gray-500 text-center">Nhập mật khẩu mới cho tài khoản Nhân viên của bạn.</p>

                        {message && (
                            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                <p className="text-sm">{message}</p>
                            </div>
                        )}

                        {/* Mật khẩu mới */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                                required
                            />
                        </div>

                        {/* Xác nhận mật khẩu */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Xác nhận mật khẩu mới"
                                required
                            />
                        </div>

                        {/* Button Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                            {isSubmitting ? 'Đang đặt...' : 'Đặt Mật khẩu'}
                        </button>
                    </form>
                );
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
                <div className="text-center mb-6">
                    <Lock className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <h1 className="text-3xl font-extrabold text-gray-900">Đặt Lại Mật Khẩu</h1>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default SetPasswordPage;