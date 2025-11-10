import React, { useState } from "react";
import {
  User,
  LayoutDashboard,
  Package,
  Box,
  Settings,
  LogOut,
} from "lucide-react";

const ClientSidebar = ({ isOpen, onClose }) => {
  const [activeRoute, setActiveRoute] = useState("/");

  const menuItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/orders", icon: Package, label: "Orders" },
    { to: "/products", icon: Box, label: "Products" },
    { to: "/settings", icon: Settings, label: "Settings" },
    { to: "/logout", icon: LogOut, label: "Logout" },
  ];

  const handleNavClick = (to) => {
    setActiveRoute(to);
    onClose();
  };

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300
        ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-slate-900/95 border-r border-slate-800/50 backdrop-blur-xl z-50
          transform transition-transform duration-500 ease-out shadow-2xl shadow-cyan-500/5
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full p-6">
          {/* USER INFO */}
          <div className="mb-8 pt-16 sm:pt-12">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">John Doe</h3>
                  <p className="text-slate-400 text-sm">Premium Member</p>
                </div>
              </div>
            </div>
          </div>

          {/* MENU */}
          <nav className="flex-1 space-y-2">
            {menuItems.map(({ to, icon: Icon, label }) => {
              const isActive = activeRoute === to;
              return (
                <a
                  key={label}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(to);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 shadow-lg shadow-cyan-500/10"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-cyan-400"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                      isActive ? "text-cyan-400" : ""
                    }`}
                  />
                  <span className="font-medium">{label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* FOOTER - UPGRADE CARD */}
          <div className="pt-6 border-t border-slate-800/50">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20">
              <p className="text-sm text-slate-300 mb-2 font-semibold">
                Upgrade to Pro
              </p>
              <p className="text-xs text-slate-400 mb-3">
                Unlock premium features and benefits
              </p>
              <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ClientSidebar;
