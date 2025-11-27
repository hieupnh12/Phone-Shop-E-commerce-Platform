import { LogOut } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import Modal from "../common/Modal";

export default function Sidebar({
  sidebarOpen,
  menuItems,
  isDesktop,
  closeSidebar,
  logOut,
}) {
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  return (
    <>
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
                  onClick={() => !isDesktop && closeSidebar()}
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
              onClick={() => setConfirmLogoutOpen(true)}
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

      {/* 🔽  Modal confirm logout  */}
      <Modal
        isOpen={confirmLogoutOpen}
        onClose={() => setConfirmLogoutOpen(false)}
        title="Xác nhận đăng xuất"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setConfirmLogoutOpen(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>

            <button
              onClick={logOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Đăng xuất
            </button>
          </>
        }
      >
        <p className="text-gray-700">Bạn có chắc chắn muốn đăng xuất?</p>
      </Modal>
    </>
  );
}
