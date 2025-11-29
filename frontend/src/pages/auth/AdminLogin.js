import React, { useState, useContext } from "react";
import { Mail, Lock, Eye, EyeOff, Smartphone } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/common/Toast";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [toast, setToast] = useState(null);
  const { loading, loginEmployee } = useContext(AuthContext);
  const navigate = useNavigate();

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
      </div>
    </div>
  );
};

export default AdminLogin;
