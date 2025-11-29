import React, { useState, useEffect, useMemo } from "react";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import cartService from "../../services/cartService";
import { useAuthFullOptions } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import LanguageSwitcher from "../common/LanguageSwitcher";

const HeaderV2 = ({ onToggleSidebar, isSidebarOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const { user, logout } = useAuthFullOptions();
  const { t } = useLanguage();


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadCartCount = async () => {
    try {
      const data = await cartService.getCart();
      if (data?.success) {
        setCartCount((data.cartItems || []).length);
      } else {
        setCartCount(0);
      }
    } catch (e) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    loadCartCount();
    const onCartUpdated = () => loadCartCount();
    window.addEventListener("cartUpdated", onCartUpdated);
    return () => window.removeEventListener("cartUpdated", onCartUpdated);
  }, []);

  const navItems = useMemo(() => [
    {
      id: 1,
      name: t('navigation.home'),
      link: '/',
    },
    { id: 2, name: t('navigation.products'), link: '/user/products' },
    { id: 3, name: t('navigation.feedbacks'), link: '/user/feedbacks' },
    { id: 4, name: t('navigation.pricing'), link: '/user/pricing' },
    { id: 5, name: t('navigation.contact'), link: '/user/contact' },
  ], [t]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-slate-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 transition-all duration-300 hover:scale-105"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              )}
            </button>

            <div
              className="flex items-center gap-1 group cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img
                src="/image/flogo.png"
                alt="FShop Logo"
className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              />

              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Shop
              </span>
            </div>
          </div>

          {/* CENTER: NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.link}
                className="relative px-3 lg:px-4 py-2 text-sm lg:text-base text-white hover:text-blue-400 transition-all duration-300 group font-medium"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* RIGHT: ACTION ICONS */}
          <div className="flex items-center gap-2 sm:gap-3">

            <LanguageSwitcher />

            {!user ? (
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-2 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-all"
              >
                {t('auth.login')}
              </button>
            ) : (
              <div
                className="relative"
              >
                <button
                  onClick={() => setShowUserMenu((s) => !s)}
                  className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 transition-all duration-300 hover:scale-105"
                  aria-haspopup="true"
                  aria-expanded={showUserMenu}
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
                  <span className="hidden sm:inline text-white font-medium text-sm">
                    {user?.name ? user.name.split(" ")[0] : t('auth.account')}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg text-sm text-gray-800 z-50">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/user/profile/info");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {t('auth.profile')}
                    </button>
                    <button
                      onClick={() => {
                        /* placeholder: navigate to transactions later */ setShowUserMenu(
                          false
                        );
                        navigate("/user/profile/order");
                      }}
className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {t('auth.transactions')}
                    </button>
                    <div className="border-t border-gray-100" />
                    <button
                      onClick={() => {
                        logout();
                        navigate("/login");
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      {t('auth.logout')}
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => navigate("/user/cart")}
              className="relative p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 transition-all duration-300 hover:scale-105 group"
              aria-label="View cart"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full text-white text-xs flex items-center justify-center font-semibold">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderV2;