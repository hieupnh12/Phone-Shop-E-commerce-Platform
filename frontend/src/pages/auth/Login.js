import React, { useContext, useState } from "react";
import {
  Mail,
  Lock,
  Phone,
  User,
  Eye,
  EyeOff,
  Chrome,
  Smartphone,
  ShieldCheck,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import Toast from "../../components/common/Toast";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState("phone");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { loading, loginEmployee, sendOtp, verifyOtp } = useContext(AuthContext);
  const { t } = useLanguage();

  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOTP = async () => {
    try {
      const phoneRegex = /^0\d{9}$/;

      if (!phoneRegex.test(formData?.phone)) {
        setToast({
          message: `Số điện thoại không hợp lệ. Vui lòng nhập 10 số và bắt đầu bằng 0.`,
          type: "warning",
        });
        return;
      }

      const response = await sendOtp(formData?.phone);
      console.log("gọi otp", response);

      if (response?.code === 1000) {
        setOtpSent(true);
      }
    } catch (error) {
      console.log("lỗi dn sdt", error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (loginMethod === "phone") {
        const otpRegex = /^\d{6}$/;

        // Validate OTP
        if (!otpRegex.test(formData?.otp)) {
          setToast({ message: `Mã OTP phải gồm 6 chữ số.`, type: "warning" });
          return;
        }
        const account = {
          rawPhone: formData?.phone,
          otpCode: formData?.otp,
        };
        const response = await verifyOtp(account);
        console.log("Login success customer", response);
        navigate("/");
      } else if (loginMethod === "email") {
        const account = {
          email: "nguyennhattrinhbs@gmail.com",
          password: "13022004",
        };
        const res = await loginEmployee(account);
        console.log("Login success admin", res);
        navigate("/admin");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href =
      "http://localhost:8080/phoneShop/oauth2/authorization/google";
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
       {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/*Video*/}
      <div className="absolute inset-0 z-0">
        {/* <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
  <source src="/video/17series.mp4" type="video/mp4" />
</video> */}

        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="/image/loginbg.jpg"
          alt="Background"
        />

        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
              backgroundSize: "50px 50px",
              animation: "grid-move 20s linear infinite",
            }}
          ></div>
        </div>

        {/* Floating particles - Reduced */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${
                  3 + Math.random() * 3
                }s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: 0.2,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Animated Gradient Orbs - Simplified */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl top-1/4 -left-20 animate-float-slow"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl bottom-1/4 -right-20 animate-float-slow"></div>
      </div>

     

      {/* Main Container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-[6fr_4fr] gap-8 lg:gap-16 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <span className="text-4xl font-bold text-white">FShop</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white leading-tight">
                {t('auth.welcome')}
                <br />
                <span className="text-indigo-400">{t('auth.welcomeDesc')}</span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                {t('auth.startJourney')}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                {
                  icon: ShieldCheck,
                  title: t('auth.warrantyTitle'),
                  desc: t('auth.warrantyDesc'),
                },
                {
                  icon: Zap,
                  title: t('auth.deliveryTitle'),
                  desc: t('auth.deliveryDesc'),
                },
                {
                  icon: TrendingUp,
                  title: t('auth.priceTitle'),
                  desc: t('auth.priceDesc'),
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="text-3xl font-bold text-indigo-400">10+</div>
                <div className="text-gray-400 text-sm">{t('auth.customers')}</div>
              </div>
              <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="text-3xl font-bold text-purple-400">9+</div>
                <div className="text-gray-400 text-sm">{t('auth.products')}</div>
              </div>
              <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="text-3xl font-bold text-pink-400">1.5★</div>
                <div className="text-gray-400 text-sm">{t('auth.ratings')}</div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full">
            <div className="relative">
              {/* Subtle Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>

              {/* Form Card */}
              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/50">
                {/* Decorative Elements - Subtle */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-transparent rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-tr-full"></div>

                {/* Form Header */}
                <div className="relative text-center mb-6 space-y-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-3 shadow-lg">
                    <Smartphone className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {isLogin ? t('auth.login') : t('auth.signupNow')}
                  </h2>
                </div>

                {/* Language Switcher */}
                <div className="absolute top-6 right-6">
                  <LanguageSwitcher />
                </div>

                {/* Login Method Tabs */}
                <div className="flex gap-2 bg-gray-100 rounded-xl p-1 mb-6">
                  <button
                    onClick={() => {
                      setLoginMethod("phone");
                      setOtpSent(false);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                      loginMethod === "phone"
                        ? "bg-white text-indigo-600 shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Phone className="w-5 h-5" />
                    {t('auth.phone')}
                  </button>
                </div>

                <div className="space-y-4">
                  {loginMethod === "email" ? (
                    <>
                      {/* Name Field (Sign Up Only) */}
                      {!isLogin && (
                        <div className="space-y-2">
                          <label className="text-gray-700 text-sm font-medium flex items-center gap-1">
                            Họ và tên <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="Nguyễn Văn A"
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                            />
                          </div>
                        </div>
                      )}

                      {/* Email Field */}
                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm font-medium flex items-center gap-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm font-medium flex items-center gap-1">
                          Mật khẩu <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Phone Field */}
                      <div className="space-y-2">
                        <label className="text-gray-700 text-sm font-medium flex items-center gap-1">
                          {t('common.phone')} <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="0912345678"
                              disabled={otpSent}
                              maxLength={10}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all disabled:opacity-60"
                            />
                          </div>
                          {!otpSent && (
                            <button
                              type="button"
                              onClick={handleSendOTP}
                              disabled={loading}
                              className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md disabled:opacity-50"
                            >
                              {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                t('auth.sendOTP')
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* OTP Field */}
                      {otpSent && (
                        <div className="space-y-2">
                          <label className="text-gray-700 text-sm font-medium flex items-center gap-1">
                            Mã OTP <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="otp"
                            value={formData.otp}
                            onChange={handleChange}
                            placeholder="000000"
                            maxLength="6"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-center text-2xl tracking-widest font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                          />
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            className="text-indigo-600 text-sm font-medium hover:text-purple-600"
                          >
                            {t('auth.resendOTP')}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Remember Me & Forgot Password */}
                  {isLogin && loginMethod === "email" && (
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center text-gray-600 cursor-pointer hover:text-gray-900">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="mr-2 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-medium">{t('auth.rememberLogin')}</span>
                      </label>
                      <button className="text-indigo-600 hover:text-purple-600 font-medium">
                        {t('auth.forgotPassword')}
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading || (loginMethod === "phone" && !otpSent)}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {isLogin ? t('auth.login') : t('auth.signupNow')}
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500 font-medium">
                      {t('auth.orContinueWith')}
                    </span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => handleSocialLogin("Google")}
                    className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                  >
                    <Chrome className="w-5 h-5 text-red-500" />
                    {t('auth.google')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Branding */}
          <div className="lg:hidden text-center space-y-3 order-first">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">FShop</span>
            </div>
            <p className="text-gray-300 text-sm max-w-md mx-auto px-4">
              Thiên đường công nghệ - Điện thoại cao cấp giá tốt nhất
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }

        @keyframes grid-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }

        @keyframes float-slow {
          0%, 100% { 
            transform: translate(0, 0); 
            opacity: 0.1;
          }
          50% { 
            transform: translate(30px, -30px); 
            opacity: 0.15;
          }
        }

        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }

        /* Smooth focus effects */
        input:focus {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6366f1, #a855f7);
          border-radius: 4px;
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .min-h-screen {
            min-height: 100vh;
            padding-top: 2rem;
            padding-bottom: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
