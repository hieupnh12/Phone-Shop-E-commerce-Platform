import { NavLink, useParams } from 'react-router-dom';

const subMenuConfig = {
    dashboard: [
        { id: 'overview', label: 'Tổng Quan', path: 'overview' },
        { id: 'analytics', label: 'Phân Tích', path: 'analytics' },
        { id: 'reports', label: 'Báo Cáo', path: 'reports' },
        { id: 'realtime', label: 'Thời Gian Thực', path: 'realtime' },
    ],
    users: [
        { id: 'all-users', label: 'Tất Cả', path: 'all-users' },
        { id: 'active', label: 'Đang Hoạt Động', path: 'active' },
        { id: 'inactive', label: 'Không Hoạt Động', path: 'inactive' },
        { id: 'new', label: 'Mới', path: 'new' },
    ],
    orders: [
        { id: 'all-orders', label: 'Tất Cả Đơn', path: 'all-orders' },
        { id: 'pending', label: 'Chờ Xử Lý', path: 'pending' },
        { id: 'completed', label: 'Hoàn Thành', path: 'completed' },
        { id: 'cancelled', label: 'Đã Hủy', path: 'cancelled' },
    ],
    revenue: [
        { id: 'daily', label: 'Theo Ngày', path: 'daily' },
        { id: 'monthly', label: 'Theo Tháng', path: 'monthly' },
        { id: 'yearly', label: 'Theo Năm', path: 'yearly' },
        { id: 'comparison', label: 'So Sánh', path: 'comparison' },
    ],
    products: [
        { id: 'inventory', label: 'Tồn Kho', path: 'inventory' },
        { id: 'bestseller', label: 'Bán Chạy', path: 'bestseller' },
        { id: 'low-stock', label: 'Sắp Hết', path: 'low-stock' },
        { id: 'out-stock', label: 'Hết Hàng', path: 'out-stock' },
    ],
    growth: [
        { id: 'customer', label: 'Khách Hàng', path: 'customer' },
        { id: 'sales', label: 'Doanh Số', path: 'sales' },
        { id: 'profit', label: 'Lợi Nhuận', path: 'profit' },
        { id: 'market', label: 'Thị Phần', path: 'market' },
    ],
};

const SubMenu = ({ parent }) => {
    const subMenuItems = subMenuConfig[parent] || [];
    return (
        <div className="bg-white rounded-lg shadow-md p-4 border border-spacing-5">
            <div className="flex gap-2 flex-wrap sm:flex-nowrap overflow-x-auto">
                {subMenuItems.map((child) => (
                    <NavLink
                        key={child.id}
                        to={`/ ${parent}/${child.path}`}
                        className={({ isActive }) =>
                            `px-5 py-2.5 rounded-md font-medium transition-all duration-200 ${
                                isActive
                                    ? 'bg-indigo-500 text-white shadow-md'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`
                        }
                    >
                        {child.label}
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default SubMenu;