import React, { useState, useContext } from "react";
import { Phone, Smartphone } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ClientLogin = () => {
  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);

  const { loading, sendOtp, verifyOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOTP = async () => {
    try {
      const res = await sendOtp(formData.phone);
      if (res?.code === 1000) setOtpSent(true);
    } catch (err) {
      console.log("Send OTP failed:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      const acc = { rawPhone: formData.phone, otpCode: formData.otp };
      const res = await verifyOtp(acc);
      console.log("Client login success:", res);
      navigate("/");
    } catch (err) {
      console.log("Client login failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="/image/loginbg.jpg"
        alt="bg"
      />

      <div className="relative bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-xl w-full max-w-md border border-white/60">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold mt-3">Đăng nhập khách hàng</h2>
        </div>

        {/* Phone */}
        <div className="space-y-2 mb-4">
          <label className="text-gray-700 text-sm font-medium">Số điện thoại</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              name="phone"
              onChange={handleChange}
              disabled={otpSent}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg"
              placeholder="0912345678"
            />
          </div>

          {!otpSent && (
            <button
              onClick={handleSendOTP}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              {loading ? "Đang gửi..." : "Gửi OTP"}
            </button>
          )}
        </div>

        {/* OTP */}
        {otpSent && (
          <>
            <div className="space-y-2 mb-6">
              <label className="text-gray-700 text-sm font-medium">Mã OTP</label>
              <input
                type="text"
                name="otp"
                maxLength={6}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-center text-xl tracking-widest"
                placeholder="123456"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
            >
              Xác nhận đăng nhập
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientLogin;
