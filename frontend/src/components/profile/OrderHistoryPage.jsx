// file OrderHistoryPage
import React, { useEffect, useState, useMemo } from 'react';
import { Search, Calendar, ChevronRight } from 'lucide-react';
import {profileService} from "../../services/api"
import { Link, useOutletContext } from 'react-router-dom';
import { useLanguage } from "../../contexts/LanguageContext";
import Toast from "../common/Toast";
import Pagination from "../common/Pagination";

const MOCK_CUSTOMER_ID = 11;

const OrderHistoryPage = () => {
    const { t } = useLanguage();
    const { customerInfo } = useOutletContext();
    const customerId = customerInfo?.customerId;

    const orderTabs = [
        { id: 'all', label: t('common.all') },
        { id: 'pending', label: t('profile.processing') },
        { id: 'shipping', label: t('profile.shipping') },
        { id: 'delivered', label: t('profile.delivered') },
        { id: 'cancelled', label: t('profile.cancelled') },
        { id: 'returned', label: t('profile.returned') },
    ];


    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Số đơn hàng mỗi trang

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!customerId) return; // Không fetch nếu chưa có customerId
            try {
                setLoading(true);
                const data = await profileService.getOrdersByCustomer(customerId);

                const groupedOrders = groupAndNormalizeOrders(data.result || data); // Giả định API trả về .result

                setOrders(groupedOrders);
                setError(null);
            } catch (err) {
                console.error("Lỗi khi tải đơn hàng:", err);
                const errorMsg = "Không thể tải lịch sử đơn hàng.";
                setError(errorMsg);
                setOrders([]);
                setToast({
                    type: 'error',
                    message: errorMsg
                });
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [customerId]);

    const groupAndNormalizeOrders = (apiData) => {
        const orderMap = {};

        apiData.forEach(item => {
            const { orderId, createDatetime, totalAmount, status, endDateTime, orderDetail } = item;

            const product = {
                image: orderDetail?.picture,
                name: orderDetail?.productName,
                price: orderDetail?.unitPriceAfter || 0,
                quantity: orderDetail?.remainingProducts || 0,
            };

            if (!orderMap[orderId]) {
                orderMap[orderId] = {
                    id: `#${orderId}`,
                    orderId: orderId,
                    date: new Date(createDatetime).toLocaleDateString('vi-VN'),
                    status: status || 'PENDING', // Giữ nguyên status từ API (uppercase)
                    totalAmount: totalAmount,
                    createDatetime: new Date(createDatetime), // Lưu trữ Date object để sắp xếp
                    endDateTime: endDateTime ? new Date(endDateTime) : null,
                    products: [product],
                };
            } else {
                orderMap[orderId].products.push(product);
            }
        });

        const finalOrders = Object.values(orderMap);

        finalOrders.sort((a, b) => b.createDatetime.getTime() - a.createDatetime.getTime());

        return finalOrders;
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN') + 'đ';
    };

    const getStatusDisplay = (status) => {
        // Normalize status to uppercase để so sánh với enum OrderStatus
        const normalizedStatus = (status || '').toUpperCase();
        
        // Map các giá trị có thể có
        const statusMap = {
            'PENDING': { label: 'Đang xử lý', className: 'text-yellow-600 bg-yellow-100' },
            'PAID': { label: 'Đã thanh toán', className: 'text-blue-600 bg-blue-100' },
            'SHIPPED': { label: 'Đang vận chuyển', className: 'text-blue-600 bg-blue-100' },
            'SHIPPING': { label: 'Đang vận chuyển', className: 'text-blue-600 bg-blue-100' },
            'DELIVERED': { label: 'Đã giao hàng', className: 'text-green-600 bg-green-100' },
            'CANCELED': { label: 'Đã hủy', className: 'text-red-600 bg-red-100' },
            'CANCELLED': { label: 'Đã hủy', className: 'text-red-600 bg-red-100' },
            'RETURNED': { label: 'Hoàn trả', className: 'text-gray-600 bg-gray-100' },
        };
        
        const statusInfo = statusMap[normalizedStatus] || { label: 'Đang xử lý', className: 'text-yellow-600 bg-yellow-100' };
        
        return (
            <span className={`${statusInfo.className} px-3 py-1 rounded-full text-xs font-medium`}>
                {statusInfo.label}
            </span>
        );
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // 2. Lọc theo Tab (So sánh với status lowercase)
            if (activeTab !== 'all') {
                const orderStatusLower = (order.status || '').toLowerCase();
                // Map tab id với status
                // Lưu ý: PAID (đã thanh toán) sẽ hiển thị trong tab "pending" (đang xử lý) vì chưa được giao hàng
                const tabStatusMap = {
                    'pending': ['pending', 'paid'], // PAID cũng nằm trong "Đang xử lý"
                    'shipping': ['shipped', 'shipping'],
                    'delivered': ['delivered'],
                    'cancelled': ['canceled', 'cancelled'],
                    'returned': ['returned']
                };
                
                const allowedStatuses = tabStatusMap[activeTab] || [];
                if (!allowedStatuses.some(s => orderStatusLower === s)) {
                    return false;
                }
            }

            // 3. Lọc theo SearchTerm
            if (searchTerm === '') return true;
            return order.products.some(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            ) || order.id.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [orders, activeTab, searchTerm]);

    // Tính toán phân trang
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    // Reset về trang 1 khi thay đổi tab hoặc search
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);
    if (loading) {
        return <div className="bg-white p-6 shadow-lg rounded-xl min-h-[500px] flex justify-center items-center">Đang tải đơn hàng...</div>;
    }

    if (error) {
        return <div className="bg-white p-6 shadow-lg rounded-xl min-h-[500px] text-red-500 flex justify-center items-center">Lỗi: {error}</div>;
    }
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
            <div className="flex items-center flex-wrap gap-x-6 gap-y-2 pb-4 mb-6 border-b border-gray-200">
                {orderTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            whitespace-nowrap pb-3 text-base font-medium relative transition-colors duration-200
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
            {/*<div className="flex items-center space-x-4 mb-6">*/}
            {/* <span className="text-gray-700 font-medium">Lịch sử mua hàng</span>*/}
            {/* <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-50">*/}
            {/* <span className="text-gray-700 text-sm">{startDate}</span>*/}
            {/* <ChevronRight size={16} className="text-gray-400 mx-2 rotate-90" />*/}
            {/* <span className="text-gray-700 text-sm">{endDate}</span>*/}
            {/* <Calendar size={18} className="text-gray-400 ml-3" />*/}
            {/* </div>*/}
            {/*</div>*/}

            {/* Thông tin số lượng đơn hàng */}
            {filteredOrders.length > 0 && (
                <div className="mb-4 text-sm text-gray-600">
                    tổng số {filteredOrders.length} đơn hàng
                </div>
            )}

            {/* Hiển thị danh sách đơn hàng hoặc Empty State */}
            {filteredOrders.length > 0 ? (
                <>
                    <div className="space-y-6 mb-6">
                        {paginatedOrders.map((order) => (
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
                                    <img src={product.image} alt={product.name}
                                         className="w-20 h-20 object-cover rounded mr-4"/>
                                    <div className="flex-grow">
                                        <p className="font-medium text-gray-800 text-base">{product.name}</p>
                                        <p className="text-gray-600 text-sm">{formatCurrency(product.price)}</p>
                                        { product.quantity > 0 &&
                                            (<div className="font-medium text-gray-700 text-base">
                                                Cùng {product.quantity} sản phẩm khác
                                            </div>)
                                        }
                                    </div>


                                    <div className="text-right">
                                        <p className="text-red-500 font-bold text-lg">{formatCurrency(order.totalAmount)}</p>

                                        <Link
                                            to={`/user/profile/order/order-detail/${order.orderId}`}
                                            state={{
                                                totalAmount: order.totalAmount,
                                                createDatetime: order.createDatetime,
                                                endDateTime: order.endDateTime,
                                                status: order.status
                                            }}
                                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center mt-1"
                                        >
                                            Xem chi tiết
                                            <ChevronRight size={14} className="ml-1"/>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                        ))}
                    </div>

                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                maxVisiblePages={5}
                                size="md"
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 bg-gray-100">
                    <img
                        src="/image/nofound.png"
                        alt="Bạn chưa có đơn hàng nào"
                        className="w-auto h-auto scale-200 object-contain"
                    />
                    <p className="text-lg mb-3">{t('orderHistory.noOrders')}</p>
                    <p className="text-sm mb-6">{t('orderHistory.exploreProducts')}</p>
                    <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors">
                        Khám phá ngay
                    </button>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default OrderHistoryPage;