import React, { useState, useEffect } from 'react';
import {useParams, Link, useOutletContext, useLocation} from 'react-router-dom';
import { CheckCircle, Clock, Loader2, ChevronRight,  Package, Truck, Home, Phone, ShoppingCart, Info, Edit3, Heart } from 'lucide-react';
import {useAuthFullOptions} from "../../contexts/AuthContext";
import { profileService } from "../../services/api";
import { useLanguage } from "../../contexts/LanguageContext";



const OrderDetailPage = () => {
    const { t } = useLanguage();
    const { orderId } = useParams();
    const location = useLocation();
    const [orderData, setOrderData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getCurrentUser } = useAuthFullOptions();
    const { customerInfo } = useOutletContext();


    useEffect(() => {
        const fetchDetail = async () => {
            if (!orderId) return;

            try {
                setIsLoading(true);
                const apiResult = await profileService.getOrderDetail(orderId); // orderId là string hoặc Integer (Backend dùng Integer)

                const normalizedData = normalizeOrderDetail(
                    apiResult,
                    orderId,
                    customerInfo,
                    location.state?.totalAmount,
                    {
                        createDatetime: location.state?.createDatetime,
                        endDateTime: location.state?.endDateTime,
                        status: location.state?.status
                    }
                );

                setOrderData(normalizedData);
                setError(null);
            } catch (err) {
                console.error("Lỗi khi tải chi tiết đơn hàng:", err);
                setError("Không thể tải chi tiết đơn hàng này.");
                setOrderData(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [orderId, customerInfo]);

    const normalizeOrderDetail = (apiProducts, id, customerData, passedTotalAmount, orderDates) => {
        const products = apiProducts.map(p => ({
            id: p.productId,
            name: p.productName,
            image: p.picture,
            price: p.unitPriceAfter,
            quantity: 1,
            warrantyEnd: '23/03/2026',
            canRepurchase: true,
        }));

        const subtotal = products.reduce((sum, p) => sum + p.price, 0);
        const FREE_SHIP_LIMIT = 1000;
        const SHIPPING_FEE = 30000;
        const shippingFee = subtotal >= FREE_SHIP_LIMIT ? 0 : SHIPPING_FEE;
        const totalAmount = passedTotalAmount ?? subtotal + shippingFee;
        const defaultCustomer = {
            name: customerData?.fullName || 'Khách hàng',
            phone: customerData?.phoneNumber || 'Đang cập nhật',
            address: customerData?.address || 'Chưa có địa chỉ',
            note: '-',
        };

        // Tạo timeline dựa trên dữ liệu thực từ API
        const createDate = orderDates?.createDatetime ? new Date(orderDates.createDatetime) : new Date();
        const endDate = orderDates?.endDateTime ? new Date(orderDates.endDateTime) : null;
        const orderStatus = orderDates?.status || 'pending';

        // Format ngày giờ
        const formatDateTime = (date) => {
            if (!date) return { date: '', time: '' };
            const dateStr = date.toLocaleDateString('vi-VN');
            const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            return { date: dateStr, time: timeStr };
        };

        const createDateTime = formatDateTime(createDate);
        const endDateTime = endDate ? formatDateTime(endDate) : null;

        // Tạo timeline dựa trên status
        const timeline = [];
        
        // Bước 1: Đặt hàng thành công (luôn có)
        timeline.push({
            status: t('profile.orderSuccess'),
            date: createDateTime.date,
            time: createDateTime.time,
            completed: true
        });

        // Bước 2: Đang xử lý (nếu status là pending hoặc đã qua pending)
        if (orderStatus === 'pending' || orderStatus === 'shipping' || orderStatus === 'delivered') {
            timeline.push({
                status: t('profile.processing'),
                date: createDateTime.date,
                time: createDateTime.time,
                completed: orderStatus !== 'pending'
            });
        }

        // Bước 3: Đang vận chuyển (nếu status là shipping hoặc delivered)
        if (orderStatus === 'shipping' || orderStatus === 'delivered') {
            timeline.push({
                status: t('profile.shipping'),
                date: createDateTime.date,
                time: createDateTime.time,
                completed: orderStatus === 'delivered'
            });
        }

        // Bước 4: Đã giao hàng (nếu status là delivered và có endDateTime)
        if (orderStatus === 'delivered' && endDateTime) {
            timeline.push({
                status: t('profile.delivered'),
                date: endDateTime.date,
                time: endDateTime.time,
                completed: true
            });
        }

        // Nếu bị hủy
        if (orderStatus === 'cancelled') {
            timeline.push({
                status: t('profile.cancelled'),
                date: endDateTime?.date || createDateTime.date,
                time: endDateTime?.time || createDateTime.time,
                completed: true
            });
        }

        // Map status để hiển thị
        const statusMap = {
            'pending': t('profile.processing'),
            'shipping': t('profile.shipping'),
            'delivered': t('profile.delivered'),
            'cancelled': t('profile.cancelled'),
            'returned': t('profile.returned')
        };

        return {
            id: id,
            orderCode: `#${id}`,
            date: createDateTime.date,
            status: statusMap[orderStatus] || 'Đang xử lý',
            products: products,
            summary: {
                subtotal: subtotal,
                discount: 0,
                shippingFee: shippingFee,
                totalPaid: totalAmount,
                totalAmountPaid: totalAmount,
                vatIncluded: true,
            },
            customer: defaultCustomer,
            supportInfo: {
                storeAddress: '244 Nam Kì khởi Nghĩa , P. Hoà Quí, Q. Ngữ Hành Sơn, Đà Nẵng', storePhone: '0909696999',
            },
            timeline: timeline,
        };
    };

    const formatCurrency = (amount) => {
        return amount?.toLocaleString('vi-VN') + 'đ';
    };

    if (isLoading) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg min-h-[500px] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-red-500" />
                <p className="ml-3 text-lg text-gray-600">Đang tải chi tiết đơn hàng {orderId}...</p>
            </div>
        );
    }

    if (error || !orderData) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg min-h-[500px] flex items-center justify-center">
                <p className="text-xl text-red-500">Lỗi: {error || `Không tìm thấy đơn hàng ${orderId}.`}</p>
            </div>
        );
    }
    // --- Components Con cho Bố cục ---

    const InfoRow = ({ label, value, currency = false, highlight = false, note = '' }) => (
        <div className="flex justify-between items-center py-2 text-sm border-b border-gray-100 last:border-b-0">
            <span className="text-gray-600">{label}</span>
            <span className={`font-medium ${highlight ? 'text-red-500 font-bold text-base' : 'text-gray-800'}`}>
                {currency ? formatCurrency(value) : value}
                {note && <span className="text-xs text-gray-500 ml-1">({note})</span>}
            </span>
        </div>
    );

    const CustomerInfoCard = () => (
        <div className="p-3 bg-white rounded-xl border border-gray-100 h-full">
            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Thông tin khách hàng</h4>
            <div className="space-y-3">
                <InfoRow label="Họ và tên" value={orderData.customer.name} />
                <InfoRow label={t('common.phone')} value={orderData.customer.phone} />
                <InfoRow label={t('common.address')} value={orderData.customer.address} />
                <InfoRow label="Email" value={customerInfo?.email || 'N/A'} />
                <InfoRow label="Ghi chú" value={orderData.customer.note} />
            </div>
        </div>
    );

    const PaymentInfoCard = () => (
        <div className="p-5 bg-white rounded-xl border border-gray-100 h-full">
            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Thông tin thanh toán</h4>
            <div className="space-y-2">
                <InfoRow label={t('common.products')} value={orderData.products.length} note={t('common.quantityNote')} />
                <InfoRow label="Tổng tiền hàng" value={orderData.summary.subtotal} currency />
                <InfoRow label="Giảm giá" value={-orderData.summary.discount} currency highlight />
                <InfoRow
                    label="Phí vận chuyển"
                    value={orderData.summary.shippingFee === 0 ? 'Miễn phí' : orderData.summary.shippingFee}
                    currency={orderData.summary.shippingFee > 0}
                />

            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <InfoRow
                    label="Tổng số tiền"
                    value={orderData.summary.totalAmountPaid}
                    currency
                    highlight
                    note={orderData.summary.vatIncluded ? 'Đã bao gồm VAT' : ''}
                />
                <InfoRow
                    label="Đã thanh toán trước"
                    value={orderData.summary.totalAmountPaid}
                    currency
                    highlight
                />
            </div>
            <p className="mt-3 text-xs text-gray-500">Phương thức: {orderData.paymentMethod}</p>
        </div>
    );

    const OrderTimeline = () => {
        const steps = orderData.timeline;
        const totalSteps = steps.length;

        if (totalSteps === 0) return null;

        return (
            <div className="my-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
                <h4 className="font-bold text-gray-800 mb-4">Tiến trình đơn hàng</h4>
                <div className="flex justify-between items-center relative w-full min-w-[600px] pb-6 pt-3">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center flex-1 relative z-10">
                            {/* Icon/Dot */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500
                                ${step.completed ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}
                            >
                                {step.completed ? <CheckCircle size={16} /> : <Clock size={16} />}
                            </div>

                            {/* Line nối */}
                            {index < totalSteps - 1 && (
                                <div className={`absolute h-1 top-4 left-1/2 w-full transition-colors duration-500
                                    ${steps[index + 1]?.completed ? 'bg-red-600' : 'bg-gray-200'} z-0`}
                                     style={{ width: 'calc(100% - 2rem)', transform: 'translateX(1rem)' }}>
                                </div>
                            )}

                            {/* Text */}
                            <div className="mt-3 text-center max-w-[120px]">
                                <p className={`text-sm font-medium ${step.completed ? 'text-red-700' : 'text-gray-500'}`}>
                                    {step.status}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{step.date}</p>
                                <p className="text-xs text-gray-400">{step.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };


    return (
        <div className="space-y-6">

            {/* Thanh điều hướng Breadcrumb */}
            <nav className="text-sm text-gray-500 flex items-center space-x-2">
                <Link to="/user/profile/order" className="hover:text-red-500">Lịch sử mua hàng</Link>
                <ChevronRight size={16} />
                <span className="font-semibold text-gray-800">Chi tiết đơn hàng</span>
            </nav>

            {/* Khối Tổng quan và Sản phẩm */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Tổng quan</h3>
                    <span className="text-red-500 text-sm hover:underline cursor-pointer">Xem hóa đơn VAT</span>
                </div>

                {/* Thông tin Mã đơn hàng và Ngày đặt */}
                <div className="flex items-center justify-between text-sm text-gray-600 border-b pb-4 mb-4">
                    <p>Đơn hàng: <span className="font-semibold text-gray-800">{orderData.orderCode}</span></p>
                    <p>Ngày đặt hàng: {orderData.date}</p>
                    <span className="text-green-600 font-medium">{orderData.status}</span>
                </div>

                {/* Danh sách Sản phẩm */}
                <div className="space-y-4">
                    {orderData.products.map(product => (
                        <div key={product.id} className="flex items-start border-b pb-4 last:border-b-0">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded mr-4 flex-shrink-0"
                            />
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-800 mb-1">{product.name}</p>
                                <p className="text-sm text-gray-600">{formatCurrency(product.price)}</p>
                                <p className="text-xs text-gray-500">Thời hạn bảo hành đến: {product.warrantyEnd}</p>
                                <Link to={`/user/warranty/${product.id}`} className="text-xs text-blue-500 hover:text-blue-700 font-medium mt-1 inline-block">Xem</Link>
                            </div>
                            <div className="flex flex-col items-end flex-shrink-0 ml-4 space-y-2">
                                <p className="text-sm text-gray-600">Số lượng: {product.quantity}</p>
                                {product.canRepurchase && (
                                    <button className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                                        Mua lại
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Thanh tiến trình đơn hàng */}
            <OrderTimeline />

            {/* Thông tin Khách hàng & Thanh toán & Hỗ trợ (2 Cột) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Cột 1: Thông tin khách hàng */}
                <div className="lg:col-span-1">
                    <CustomerInfoCard />
                </div>

                {/* Cột 2: Thông tin thanh toán */}
                <div className="lg:col-span-1">
                    <PaymentInfoCard />
                </div>

                {/* Cột 3: Thông tin Hỗ trợ */}
                <div className="lg:col-span-1">
                    <div className="p-5 bg-white rounded-xl border border-gray-100 h-full">
                        <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Thông tin hỗ trợ</h4>
                        <div className="space-y-3">
                            <div className="flex items-start text-sm">
                                <Home size={18} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">Địa chỉ cửa hàng:</p>
                                    <p className="text-gray-700">{orderData.supportInfo.storeAddress}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-sm">
                                <Phone size={18} className="text-red-500 mr-3" />
                                <p>SĐT hỗ trợ: {orderData.supportInfo.storePhone}</p>
                                <button className="ml-auto text-xs text-white bg-red-500 px-3 py-1 rounded-full hover:bg-red-600 transition-colors">
                                    Liên hệ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Có thể thêm khu vực Đánh giá sản phẩm tại đây nếu đơn hàng đã hoàn tất */}
        </div>
    );
};

export default OrderDetailPage;