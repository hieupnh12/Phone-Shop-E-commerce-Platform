import React, { useState } from 'react';
import { Search, Calendar, ChevronRight } from 'lucide-react'; // Dùng lucide-react cho icons

const orderTabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'confirmed', label: 'Đã xác nhận' },
    { id: 'shipping', label: 'Đang vận chuyển' },
    { id: 'delivered', label: 'Đã giao hàng' },
    { id: 'cancelled', label: 'Đã hủy' },
];

const mockOrders = [
    {
        id: '#02434S2503001300',
        date: '24/03/2025',
        status: 'delivered',
        products: [
            {
                image: 'https://via.placeholder.com/60/ccc?text=Product1',
                name: 'TÚI CHỐNG SỐC TOMTOC BRIEFCASE MACBOOK PRO 14 GRAY (XÁM)',
                price: 1050000,
                quantity: 1,
            },
            {
                image: 'https://via.placeholder.com/60/ccc?text=Product2',
                name: 'Cùng 1 sản phẩm khác',
                price: 235000,
                quantity: 1,
            },
        ],
        totalAmount: 1285000,
    },
    {
        id: '#02434S2503001293',
        date: '24/03/2025',
        status: 'delivered',
        products: [
            {
                image: 'https://via.placeholder.com/60/ccc?text=MacbookAir',
                name: 'APPLE MACBOOK AIR M1 256GB 2020 XÁM CHÍNH HÃNG (MGN63)',
                price: 15892000,
                quantity: 1,
            },
        ],
        totalAmount: 15892000,
    },
    {
        id: '#02434S2503001290',
        date: '24/03/2025',
        status: 'cancelled',
        products: [
            {
                image: 'https://via.placeholder.com/60/ccc?text=MacbookAir',
                name: 'APPLE MACBOOK AIR M1 256GB 2020 XÁM CHÍNH HÃNG (MGN63)',
                price: 22990000,
                quantity: 1,
            },
        ],
        totalAmount: 22990000,
    },
];

const OrderHistoryPage = () => {


    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('01/12/2020');
    const [endDate, setEndDate] = useState('22/11/2025');

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN') + 'đ';
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'delivered':
                return <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-medium">Đã nhận hàng</span>;
            case 'cancelled':
                return <span className="text-red-600 bg-red-100 px-3 py-1 rounded-full text-xs font-medium">Đã hủy</span>;
            default:
                return <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">Đang xử lý</span>;
        }
    };

    const filteredOrders = mockOrders.filter(order => {
        if (activeTab === 'all') return true;
        if (activeTab === 'delivered' && order.status === 'delivered') return true;
        if (activeTab === 'cancelled' && order.status === 'cancelled') return true;
        return false;
    }).filter(order => {
        if (searchTerm === '') return true;
        return order.products.some(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || order.id.toLowerCase().includes(searchTerm.toLowerCase());
    });


    return (
        <div className="bg-white p-6 shadow-lg rounded-xl">
            {/* Header của phần Đơn hàng của tôi (Mẫu 2) */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Đơn hàng của tôi</h2>
                <div className="relative w-full md:w-auto md:min-w-[300px]">
                    <input
                        type="text"
                        placeholder="Tìm theo tên đơn, mã đơn hoặc tên sản phẩm"
                        className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Các tab lọc trạng thái (Mẫu 1 & 2) */}
            <div className="flex items-center space-x-6 overflow-x-auto pb-4 mb-6 border-b border-gray-200 hide-scrollbar">
                {orderTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            whitespace-nowrap pb-3 text-lg font-medium relative transition-colors duration-200
                            ${activeTab === tab.id
                            ? 'text-red-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-red-600'
                            : 'text-gray-600 hover:text-red-500'
                        }
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Bộ lọc thời gian (Mẫu 1) */}
            <div className="flex items-center space-x-4 mb-6">
                <span className="text-gray-700 font-medium">Lịch sử mua hàng</span>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-50">
                    <span className="text-gray-700 text-sm">{startDate}</span>
                    <ChevronRight size={16} className="text-gray-400 mx-2 rotate-90" />
                    <span className="text-gray-700 text-sm">{endDate}</span>
                    <Calendar size={18} className="text-gray-400 ml-3" />
                </div>
            </div>

            {/* Hiển thị danh sách đơn hàng hoặc Empty State */}
            {filteredOrders.length > 0 ? (
                <div className="space-y-6">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="flex items-center justify-between mb-3 border-b pb-3">
                                <div className="flex items-center text-sm">
                                    <span className="font-semibold text-gray-800">Đơn hàng: {order.id}</span>
                                    <span className="text-gray-500 mx-3">•</span>
                                    <span className="text-gray-500">Ngày đặt hàng: {order.date}</span>
                                </div>
                                {getStatusDisplay(order.status)}
                            </div>

                            {order.products.map((product, index) => (
                                <div key={index} className="flex items-center py-2">
                                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded mr-4" />
                                    <div className="flex-grow">
                                        <p className="font-medium text-gray-800 text-base">{product.name}</p>
                                        <p className="text-gray-600 text-sm">{formatCurrency(product.price)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-red-500 font-bold text-lg">{formatCurrency(order.totalAmount)}</p>
                                        <a href={`/profile/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 text-sm flex items-center mt-1">
                                            Xem chi tiết
                                            <ChevronRight size={14} className="ml-1" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                    <img
                        src="https://via.placeholder.com/200/F5F5F5/B0B0B0?text=No+Orders"
                        alt="Bạn chưa có đơn hàng nào"
                        className="w-48 h-48 mb-6 object-contain"
                    />
                    <p className="text-lg mb-3">Bạn chưa có đơn hàng nào</p>
                    <p className="text-sm mb-6">Cùng khám phá hàng ngàn sản phẩm tại FPT Shop nhé!</p>
                    <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors">
                        Khám phá ngay
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;