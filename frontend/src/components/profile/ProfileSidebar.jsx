// src/components/ProfileSidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingBag, User, Shield, MessageSquare, LogOut } from 'lucide-react';

const navItems = [
    { name: 'Đơn hàng của tôi', icon: ShoppingBag, path: '/profile/order' },
    { name: 'Thông tin tài khoản', icon: User, path: '/profile/info' },
    { name: 'Thông tin bảo hành', icon: Shield, path: '/profile/warranty' },
    { name: 'Góp ý - Hỗ trợ', icon: MessageSquare, path: '/profile/support' },
];

const ProfileSidebar = () => {
    return (
        <div className="w-full p-4 bg-white shadow-lg rounded-xl sticky top-4">
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
                    onClick={() => console.log('Handle Logout')}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default ProfileSidebar;