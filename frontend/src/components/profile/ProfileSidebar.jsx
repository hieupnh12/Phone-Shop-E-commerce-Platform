import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Shield, MessageSquare, LogOut } from 'lucide-react';
import { useAuthFullOptions } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";

const ProfileSidebar = () => {
    const { t } = useLanguage();
    const navItems = [
        { name: t('profile.myOrders'), icon: ShoppingBag, path: '/profile/order' },
        { name: t('profile.accountInfo'), icon: User, path: '/profile/info' },
        { name: t('profile.warranty'), icon: Shield, path: '/profile/warranty' },
        { name: t('profile.support'), icon: MessageSquare, path: '/profile/support' },
    ];

    const { logoutCustomer } = useAuthFullOptions();
    const navigate = useNavigate();
    const handleLogout = () => {
        logoutCustomer();

        navigate("/login", { replace: true });
    };
    return (
        <div className="w-full p-3 bg-white shadow-lg rounded-xl sticky top-4">
            <nav className="space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center p-3 rounded-lg transition-colors duration-200
                             ${isActive
                                ? 'bg-red-500 text-white font-medium shadow-md'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                            }`
                        }
                    >
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                    className="flex items-center w-full p-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors duration-200"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default ProfileSidebar;