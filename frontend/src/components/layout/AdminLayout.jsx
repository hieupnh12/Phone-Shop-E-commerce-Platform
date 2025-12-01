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
  UserPlus,
  UserCheck,
  Shield,
  ShoppingCart,
  UserMinus,
  Users2,
  RefreshCw,
} from "lucide-react";
import { useAuthFullOptions } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { usePermission, PERMISSIONS } from "../../hooks/usePermission";

export default function AdminLayout() {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { user, logout } = useAuthFullOptions();
  const { hasPermission } = usePermission();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handLogout = async () => {
    const response = await logout();
    if (response) {
      navigate("/admin-login", { replace: true });
    }
  }
  useEffect(() => {
    if (windowWidth >= 1024) {
      // lg breakpoint
      setSidebarOpen(false);
    } else {
      setSidebarOpen(false);
    }
  }, [windowWidth]);
  const isDesktop = windowWidth >= 1024;

  const { hasAnyPermission } = usePermission();

  // Menu items với permission requirements
  // permission có thể là: null (luôn hiển thị), string (một permission), hoặc array (nhiều permissions - chỉ cần một)
  const allMenuItems = [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      path: "/admin/dashboard",
      permission: null, // Dashboard luôn hiển thị cho employee
    },
    { 
      id: "products", 
      icon: Grid, 
      label: t('admin.products'), 
      path: "/admin/products",
      permission: PERMISSIONS.PRODUCT_VIEW_ALL,
    },
    {
      id: "statistic",
      icon: ChartNoAxesCombined,
      label: "Thống kê",
      path: "/admin/statistic",
      permission: PERMISSIONS.REPORT_VIEW_SALES, // Hoặc có thể dùng permission khác
    },
    { 
      id: "orders", 
      icon: ShoppingCart, 
      label: t('admin.orders'), 
      path: "/admin/orders",
      // Hiển thị nếu có bất kỳ một trong các permissions: ORDER_VIEW_ALL, ORDER_VIEW_DETAIL, hoặc ORDER_CREATE_ALL
      permission: [PERMISSIONS.ORDER_VIEW_ALL, PERMISSIONS.ORDER_VIEW_DETAIL, PERMISSIONS.ORDER_CREATE_ALL],
    },
    { 
      id: "warranty-requests", 
      icon: RefreshCw, 
      label: "Yêu cầu bảo hành", 
      path: "/admin/warranty-requests",
      // Hiển thị nếu có quyền xem tất cả HOẶC quyền cập nhật (để xem yêu cầu của mình)
      permission: [PERMISSIONS.WARRANTY_VIEW_ALL, PERMISSIONS.WARRANTY_UPDATE_BASIC],
    },
    { 
      id: "roles", 
      icon: Shield, 
      label: "Phân quyền", 
      path: "/admin/roles",
      permission: PERMISSIONS.STAFF_MANAGE_ROLES,
    },
    { 
      id: "customers", 
      icon: Users2, 
      label: "Khách hàng", 
      path: "/admin/customers",
      permission: PERMISSIONS.CUSTOMER_VIEW_ALL,
    },
    { 
      id: "employee", 
      icon: UserMinus, 
      label: "Nhân Viên", 
      path: "/admin/employee",
      permission: PERMISSIONS.STAFF_VIEW_ALL,
    },
  ];

  // Filter menu items dựa trên permission
  const menuItems = allMenuItems.filter(item => {
    if (!item.permission) {
      // Không có permission requirement -> luôn hiển thị
      return true;
    }
    if (Array.isArray(item.permission)) {
      // Nhiều permissions -> chỉ cần có một trong số đó
      return hasAnyPermission(item.permission);
    }
    // Một permission -> check permission đó
    return hasPermission(item.permission);
  });

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
      <nav className="bg-white shadow-md h-16 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-30">
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
          <h1 className={`text-xl font-bold text-sky-600 underline ${!isDesktop? "hidden":""}`}>Admin Dashboard</h1>
        </div>
        
        <div className="sm:flex-1 sm:max-w-md sm:mx-4 lg:mx-8">
          {/* <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div> */}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button> */}

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
