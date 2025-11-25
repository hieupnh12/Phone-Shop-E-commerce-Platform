import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import {
  Home,
  Users,
  MessageSquare,
  Grid,
  ArrowLeftFromLine,
  Bell,
  Search,
  User,
  Menu,
  ChartNoAxesCombined,
} from "lucide-react";
import { useAuthFullOptions } from "../../contexts/AuthContext";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { user, logout } = useAuthFullOptions();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handLogout = async () => {
    const response = await logout();
    if (response) {
      navigate("/login", { replace: true });
    }
  }
  useEffect(() => {
    if (windowWidth >= 1024) {
      // lg breakpoint
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [windowWidth]);
  const isDesktop = windowWidth >= 1024;

  const menuItems = [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    { id: "users", icon: Users, label: "Người dùng", path: "/admin/users" },
    {
      id: "messages",
      icon: MessageSquare,
      label: "Tin nhắn",
      path: "/admin/messages",
    },
    { id: "products", icon: Grid, label: "Sản phẩm", path: "/admin/products" },
    {
      id: "statistic",
      icon: ChartNoAxesCombined,
      label: "Thống kê",
      path: "/admin/statistic",
    },
    { id: "profile", icon: User, label: "Hồ sơ", path: "/admin/profile" },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
console.log(user);

  // Click outside để đóng sidebar trên mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && !isDesktop && e.target.closest("aside") === null) {
        closeSidebar();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen, isDesktop]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm h-16 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 mr-4 transition-transform"
            style={{
              transform: sidebarOpen ? "rotate(0deg)" : "rotate(180deg)",
            }}
          >
            {isDesktop ? (
              <ArrowLeftFromLine size={24} className="text-gray-700" />
            ) : (
              <Menu  size={24} className="text-gray-700" />
            )}
          </button>
          <h1 className={`text-xl font-bold text-gray-800 ${!isDesktop? "hidden":""}`}>Admin Dashboard</h1>
        </div>
        
        <div className="sm:flex-1 sm:max-w-md sm:mx-4 lg:mx-8">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              A
            </div>
            <span className="text-sm font-medium hidden sm:block">{user?.fullName}</span>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 pt-16">
        <Sidebar sidebarOpen={sidebarOpen} menuItems={menuItems} isDesktop={isDesktop} closeSidebar={closeSidebar} logOut={handLogout}/>

        {/* Main Content */}
        <main
          className={`
            flex-1 p-2 sm:p-4 transition-all duration-300
            ${isDesktop ? (sidebarOpen ? "lg:ml-64" : "lg:ml-20") : ""}
          `}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
