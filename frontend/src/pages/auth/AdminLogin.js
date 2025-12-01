import React, { useState, useContext, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AuthContext, getUserRole } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import constants from "../../constants/index.js";
import Toast from "../../components/common/Toast";
import api from "../../services/api";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [toast, setToast] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const { loading, loginEmployee } = useContext(AuthContext);
  const navigate = useNavigate();

  // Check if user is already logged in and redirect
  useEffect(() => {
    const token = Cookies.get(constants.ACCESS_TOKEN_KEY);
    if (token) {
      const role = getUserRole();
      // If has employee role, redirect to admin
      if (role && role.startsWith("ROLE_")) {
        navigate("/admin", { replace: true });
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate email
    if (!emailRegex.test(formData.email.trim())) {
      setToast({
        message: "Email không hợp lệ!",
        type: "warning",
      });
      return;
    }

    // Validate password
    if (!formData.password || formData.password.length < 6) {
      setToast({
        message: "Mật khẩu phải có ít nhất 6 ký tự!",
        type: "warning",
      });
      return;
    }
    try {
      const res = await loginEmployee(formData);
      console.log("Admin login success:", res);
      navigate("/admin");
    } catch (err) {
      console.log(err);

      setToast({
        message: `Đăng nhập không thành công. ${err?.response?.data.message} ${err?.message}`,
        type: "error",
      });
    }
  };

  const handleForgotPassword = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate email
    if (!forgotPasswordEmail.trim()) {
      setToast({
        message: "Vui lòng nhập email!",
        type: "warning",
      });
      return;
    }

    if (!emailRegex.test(forgotPasswordEmail.trim())) {
      setToast({
        message: "Email không hợp lệ!",
        type: "warning",
      });
      return;
    }

    setIsSendingReset(true);
    try {
      const response = await api.post("/employee/forgot", {
        email: forgotPasswordEmail.trim(),
      });

      setToast({
        message:
          response.data?.message ||
          "Email khôi phục đã được gửi! Vui lòng kiểm tra hộp thư của bạn.",
        type: "success",
      });
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    } catch (err) {
      console.error("Lỗi gửi email đặt lại mật khẩu:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.";
      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Background */}
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="/image/loginbg.jpg"
        alt="bg"
      />

      {/* Card */}
      <div className="relative bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-xl w-full max-w-md border border-white/60">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold mt-3">Admin Login</h2>
        </div>

        {/* Email */}
        <div className="space-y-2 mb-4">
          <label className="text-gray-700 text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg"
              placeholder="admin@gmail.com"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2 mb-6">
          <label className="text-gray-700 text-sm font-medium">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90"
        >
          {loading ? "Loading..." : "Đăng nhập Admin"}
        </button>

        {/* Link Đổi mật khẩu */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowForgotPassword(!showForgotPassword)}
            className="w-full flex items-center justify-between text-sm text-indigo-600 hover:text-indigo-700 transition-colors p-2 rounded-lg hover:bg-indigo-50"
          >
            <span className="flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              Đổi mật khẩu
            </span>
            {showForgotPassword ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {/* Dropdown form đổi mật khẩu */}
          {showForgotPassword && (
            <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3 animate-fade-in">
              <p className="text-xs text-gray-600 mb-2">
                Nhập email của nhân viên để nhận link đặt lại mật khẩu.
              </p>

              <div className="space-y-2">
                <label className="text-gray-700 text-xs font-medium">
                  Email nhân viên
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nhập email nhân viên"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleForgotPassword();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleForgotPassword}
                  disabled={isSendingReset}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingReset ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi email"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail("");
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
