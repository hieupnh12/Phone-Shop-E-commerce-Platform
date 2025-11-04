import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
} from "lucide-react";

const MainMenu = () => {
  const location = useLocation();
  const prefix = location.pathname.includes("/admin")
    ? "/admin/statistic"
    : "/login";

  const menuConfig = {
    dashboard: {
      label: "Dashboard",
      icon: BarChart3,
      path: `${prefix}/dashboard`,
    },
    users: { label: "Người Dùng", icon: Users, path: `${prefix}/users` },
    orders: { label: "Đơn Hàng", icon: ShoppingCart, path: `${prefix}/orders` },
    revenue: {
      label: "Doanh Thu",
      icon: DollarSign,
      path: `${prefix}/revenue`,
    },
    products: { label: "Sản Phẩm", icon: Package, path: `${prefix}/products` },
    growth: {
      label: "Tăng Trưởng",
      icon: TrendingUp,
      path: `${prefix}/growth`,
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-2">
      <div className="flex gap-2 flex-wrap justify-between sm:flex-nowrap overflow-x-auto">
        {Object.entries(menuConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <NavLink
              key={key}
              to={config.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {config.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default MainMenu;
