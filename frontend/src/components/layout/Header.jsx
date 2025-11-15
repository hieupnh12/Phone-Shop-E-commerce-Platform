import React, { useState, useEffect } from 'react';
import { Search, User, ShoppingCart, Menu, X } from 'lucide-react';

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = ["Home", "Products", "Solutions", "Pricing", "Contact"];

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-sm bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* LEFT: LOGO + TOGGLE */}
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

            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white rounded-md" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                FShop
              </span>
            </div>
          </div>

          {/* CENTER: NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="relative px-3 lg:px-4 py-2 text-sm lg:text-base text-slate-300 hover:text-cyan-400 transition-all duration-300 group"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* RIGHT: ACTION ICONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="p-2 sm:p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 transition-all duration-300 hover:scale-105 group">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </button>

            <button className="p-2 sm:p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 transition-all duration-300 hover:scale-105 group">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </button>

            <button className="relative p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 transition-all duration-300 hover:scale-105 group">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full text-white text-xs flex items-center justify-center font-semibold">
                3
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
