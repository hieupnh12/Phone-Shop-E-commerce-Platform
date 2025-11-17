import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  Settings,
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
    orders: { label: "Đơn Hàng", icon: ShoppingCart, path: `${prefix}/orders` },
    revenue: {
      label: "Doanh Thu",
      icon: DollarSign,
      path: `${prefix}/revenue`,
    },
    products: { label: "Sản Phẩm", icon: Package, path: `${prefix}/products` },
    growth: {
      label: "Setting",
      icon: Settings,
      path: `${prefix}/setting`,
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-1 mb-8">
      <div className="flex items-center overflow-x-auto p-2 flex-wrap">
        {Object.entries(menuConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <NavLink
              key={key}
              to={config.path}
              className={({ isActive }) =>
                `flex-1 min-w-fit px-6 py-4 flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-300 whitespace-nowrap mr-2 sm:flex-wrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-white-100 text-gray-700 hover:bg-gray-200"
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
