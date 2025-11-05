import { LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar({
  sidebarOpen,
  menuItems,
  isDesktop,
  closeSidebar,
}) {

  return (
    <aside
      className={`
            bg-white shadow-sm transition-all duration-300 fixed top-16 bottom-0 z-20 overflow-hidden
            ${
              isDesktop
                ? sidebarOpen
                  ? "w-64 left-0"
                  : "w-20 left-0"
                : sidebarOpen
                ? "w-64 left-0"
                : "-left-64"
            }
            lg:${sidebarOpen ? "w-64" : "w-20"}
          `}
    >
      
      <div className="p-4 h-full flex flex-col">
        {/* {!isDesktop && sidebarOpen && (
          <div className="flex item-center justify-center sm:flex-1 sm:max-w-md sm:mx-4 lg:mx-8">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
          </div>
        )} */}

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={() => !isDesktop && closeSidebar()} // Đóng sidebar sau khi click trên mobile
              >
                <Icon size={18} className="flex-shrink-0" />
                <span
                  className={`font-medium whitespace-nowrap transition-opacity duration-300 ${
                    isDesktop && !sidebarOpen
                      ? "opacity-0 w-0 overflow-hidden"
                      : "opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            onClick={() => !isDesktop && closeSidebar()}
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span
              className={`font-medium whitespace-nowrap transition-opacity duration-300 ${
                isDesktop && !sidebarOpen
                  ? "opacity-0 w-0 overflow-hidden"
                  : "opacity-100"
              }`}
            >
              Đăng xuất
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
