import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import Toast from "../../components/common/Toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.name || !formData.email || !formData.message) {
      setToast({
        type: "error",
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Gửi email thông qua backend hoặc service
      // Tạm thời log để test
      console.log("Form data:", formData);

      // TODO: Replace with actual backend endpoint
      // const response = await axiosClient.post('/contact/send', formData);

      setToast({
        type: "success",
        message: "Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ lại sớm",
      });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      setToast({
        type: "error",
        message: "Lỗi gửi tin nhắn. Vui lòng thử lại",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Liên Hệ Với Chúng Tôi
          </h1>
          <p className="text-xl text-blue-100">
            Chúng tôi sẵn sàng hỗ trợ bạn bất kỳ lúc nào
          </p>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto mt-5 px-4 sm:px-6 lg:px-8 py-16">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {/* Hotline Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <Phone className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hotline</h3>
            <a
              href="tel:0705432115"
              className="text-2xl font-semibold text-blue-600 hover:text-blue-700"
            >
              0705 432 115
            </a>
            <p className="text-gray-600 mt-2 text-sm">
              Liên hệ tổng đài hỗ trợ
            </p>
          </div>

          {/* Address Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <MapPin className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Địa Chỉ</h3>
            <p className="text-gray-700 font-semibold">FShop, FPT City</p>
            <p className="text-gray-600 text-sm mt-1">
              Phường Ngũ Hành Sơn, TP Đà Nẵng
            </p>
          </div>

          {/* Email Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <Mail className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
            <a
              href="mailto:support@example.com"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              support@example.com
            </a>
            <p className="text-gray-600 mt-2 text-sm">
              Gửi email cho chúng tôi
            </p>
          </div>

          {/* Business Hours Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <Clock className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Giờ Làm Việc</h3>
            <div className="text-sm space-y-2">
              <div>
                <p className="text-gray-700 font-semibold">T2 - T6</p>
                <p className="text-gray-600">08:00 - 17:30</p>
              </div>
              <div>
                <p className="text-gray-700 font-semibold">T7 - CN</p>
                <p className="text-gray-600">09:00 - 17:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Map and Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden h-fit">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3835.6752041535174!2d108.2572200732794!3d15.9783291418687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142110023f5878b%3A0x9e6c2df5f05f377!2sFShop!5e0!3m2!1svi!2s!4v1764490025998!5m2!1svi!2s"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="FShop Location"
            />
          </div>

          {/* Contact Form Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Gửi Hỗ Trợ
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và Tên *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên của bạn"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Nhập email của bạn"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số Điện Thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại (không bắt buộc)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chủ Đề *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Nhập chủ đề liên hệ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tin Nhắn *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Nhập nội dung tin nhắn của bạn"
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                {isLoading ? "Đang gửi..." : "Gửi Tin Nhắn"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Contact;