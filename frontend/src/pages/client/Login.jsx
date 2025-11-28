import React, { useState } from 'react';
import { Mail, Lock, Phone, Chrome, MessageCircle, ArrowRight, Sparkles, Shield, Zap, Users } from 'lucide-react';

const Login = () => {
  const [loginMethod, setLoginMethod] = useState('phone');
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      alert(isLogin ? 'Đăng nhập thành công!' : 'Đăng ký thành công!');
    }, 1500);
  };

  const handleSocialLogin = (provider) => {
    alert(`Đăng nhập bằng ${provider}`);
  };

  const features = [
    { icon: Shield, title: 'Bảo mật tuyệt đối', desc: 'Dữ liệu được mã hóa end-to-end' },
    { icon: Zap, title: 'Nhanh chóng', desc: 'Truy cập ngay lập tức' },
    { icon: Users, title: 'Cộng đồng 10M+', desc: 'Hàng triệu người dùng tin tưởng' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-100/30 rounded-full blur-3xl top-0 left-1/4 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-100/30 rounded-full blur-3xl bottom-0 right-1/4 animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="relative w-full max-w-6xl">
        <div className="backdrop-blur-2xl bg-white/80 border border-white/60 rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Left/Right Panel - Conditional Order */}
            <div
              className={`w-full lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 flex flex-col justify-center relative overflow-hidden transition-all duration-700 ${
                isLogin ? 'lg:order-1' : 'lg:order-2'
              }`}
            >
              {/* Animated background patterns */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute w-64 h-64 border-4 border-white rounded-full top-10 -right-20 animate-spin" style={{animationDuration: '20s'}}></div>
                <div className="absolute w-48 h-48 border-4 border-white rounded-full bottom-20 -left-10 animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
              </div>

              <div className="relative z-10 space-y-8">
                {/* Logo */}
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">LiquidApp</span>
                </div>

                {/* Main Content - Changes based on Login/Signup */}
                <div className="space-y-6 animate-fade-in" key={isLogin ? 'login' : 'signup'}>
                  <h1 className="text-5xl font-bold text-white leading-tight">
                    {isLogin ? 'Chào mừng trở lại!' : 'Bắt đầu hành trình'}
                  </h1>
                  <p className="text-xl text-white/90 leading-relaxed">
                    {isLogin 
                      ? 'Đăng nhập để khám phá thế giới công nghệ với trải nghiệm tuyệt vời nhất'
                      : 'Tham gia cộng đồng hơn 10 triệu người dùng đang tin tưởng sử dụng'}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{feature.title}</h3>
                        <p className="text-white/80 text-sm">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">10M+</div>
                    <div className="text-white/80 text-sm">Người dùng</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">99.9%</div>
                    <div className="text-white/80 text-sm">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">24/7</div>
                    <div className="text-white/80 text-sm">Hỗ trợ</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Panel - Conditional Order */}
            <div
              className={`w-full lg:w-1/2 p-8 lg:p-12 flex items-center transition-all duration-700 ${
                isLogin ? 'lg:order-2' : 'lg:order-1'
              }`}
            >
              <div className="w-full max-w-md mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                  </h2>
                  {/* <p className="text-gray-600">
                    {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
                    <button
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setOtpSent(false);
                        setError('');
                      }}
                      className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                    >
                      {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                    </button>
                  </p>                       */}
                </div>

                {/* Login Method Tabs */}
                <div className="flex gap-2 bg-gray-100 rounded-2xl p-1">
                  {/* <button
                    onClick={() => setLoginMethod('email')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                      loginMethod === 'email'
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button> */}
                  <button
                    onClick={() => {
                      setLoginMethod('phone');
                      setOtpSent(false);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                      loginMethod === 'phone'
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    SĐT
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {/* Form */}
                <div className="space-y-4">
                  {/* {loginMethod === 'email' ? (
                    <>
                      {!isLogin && (
                        <div className="space-y-2">
                          <label className="text-gray-700 text-sm font-medium">Họ tên</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nguyễn Văn A"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            required={!isLogin}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm font-medium">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm font-medium">Mật khẩu</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                      </div>
                    </>
                  ) :  */}
                  (
                    <>
                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm font-medium">Số điện thoại</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="0912345678"
                              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                              required
                              disabled={otpSent}
                            />
                          </div>
                          {!otpSent && (
                            <button
                              type="button"
                              onClick={handleSendOTP}
                              disabled={loading}
                              className="px-6 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-all whitespace-nowrap"
                            >
                              Gửi OTP
                            </button>
                          )}
                        </div>
                      </div>

                      {otpSent && (
                        <div className="space-y-2 animate-fade-in">
                          <label className="text-gray-700 text-sm font-medium">Mã OTP</label>
                          <input
                            type="text"
                            name="otp"
                            value={formData.otp}
                            onChange={handleChange}
                            placeholder="000000"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-center text-2xl tracking-widest"
                            maxLength="6"
                            required
                          />
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            className="text-indigo-600 text-sm hover:text-indigo-700 transition-all"
                          >
                            Gửi lại mã OTP
                          </button>
                        </div>
                      )}
                    </>
                  )
                  {/* } */}

                  {/* {isLogin && loginMethod === 'email' && (
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center text-gray-600 cursor-pointer hover:text-gray-900 transition-all">
                        <input type="checkbox" className="mr-2 rounded" />
                        Ghi nhớ đăng nhập
                      </label>
                      <a href="#" className="text-indigo-600 hover:text-indigo-700 transition-all">
                        Quên mật khẩu?
                      </a>
                    </div>
                  )} */}

                  <button
                    onClick={handleSubmit}
                    disabled={loading || (loginMethod === 'phone' && !otpSent)}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Hoặc tiếp tục với</span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSocialLogin('Google')}
                    className="flex items-center justify-center gap-2 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-100 transition-all group"
                  >
                    <Chrome className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Google
                  </button>
                  <button
                    onClick={() => handleSocialLogin('Zalo')}
                    className="flex items-center justify-center gap-2 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-100 transition-all group"
                  >
                    <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Zalo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;