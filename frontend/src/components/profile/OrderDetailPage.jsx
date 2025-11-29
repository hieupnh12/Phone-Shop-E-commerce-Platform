import React, { useState, useEffect } from 'react';
import {useParams, Link, useOutletContext, useLocation, useNavigate} from 'react-router-dom';
import { CheckCircle, Clock, Loader2, ChevronRight,  Package, Truck, Home, Phone, ShoppingCart, Info, Edit3, Heart, XCircle } from 'lucide-react';
import {useAuthFullOptions} from "../../contexts/AuthContext";
import { profileService, orderService } from "../../services/api";
import api from "../../services/api";
import { useLanguage } from "../../contexts/LanguageContext";
import Toast from "../common/Toast";



const OrderDetailPage = () => {
    const { t } = useLanguage();
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [toast, setToast] = useState(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const { getCurrentUser } = useAuthFullOptions();
    const { customerInfo } = useOutletContext();


    useEffect(() => {
        const fetchDetail = async () => {
            if (!orderId) return;

            try {
                setIsLoading(true);
                // Lấy order details, order info và payment transactions song song
                const [apiResult, orderInfo, paymentTransactions] = await Promise.all([
                    profileService.getOrderDetail(orderId),
                    orderService.getOrder(orderId).catch(() => null),
                    api.get(`/payment/transaction/order/${orderId}`)
                        .then(res => res.data?.result || [])
                        .catch(() => [])
                ]);

                // Lấy payment method từ transaction đầu tiên (mới nhất)
                // Kiểm tra transactionCode để xác định chính xác: PAYOS- là PayOS, CODE- là COD
                let paymentMethod = 'cod'; // Mặc định là COD
                if (paymentTransactions && paymentTransactions.length > 0) {
                    const transaction = paymentTransactions[0];
                    const transactionCode = transaction?.transactionCode || '';
                    const paymentMethodType = transaction?.paymentMethod?.paymentMethodType || '';
                    
                    console.log('Payment Transaction Debug:', {
                        transactionCode,
                        paymentMethodType,
                        transaction
                    });
                    
                    // Nếu transactionCode bắt đầu bằng "PAYOS-" thì là PayOS
                    if (transactionCode.startsWith('PAYOS-')) {
                        paymentMethod = 'bank'; // PayOS
                    } else if (transactionCode.startsWith('CODE-')) {
                        // CODE- là COD
                        paymentMethod = 'cod';
                    } else {
                        // Fallback: kiểm tra paymentMethodType
                        // Nếu là 'bank' thì là PayOS, còn lại là COD
                        paymentMethod = (paymentMethodType === 'bank') ? 'bank' : 'cod';
                    }
                } else {
                    // Nếu không có transaction, thử lấy từ location.state
                    paymentMethod = location.state?.paymentMethod || 'cod';
                }
                
                console.log('Final payment method:', paymentMethod);

                const normalizedData = normalizeOrderDetail(
                    apiResult,
                    orderId,
                    customerInfo,
                    orderInfo?.result?.totalAmount || location.state?.totalAmount,
                    {
                        createDatetime: orderInfo?.result?.createDatetime || location.state?.createDatetime,
                        endDateTime: orderInfo?.result?.endDatetime || location.state?.endDateTime,
                        status: orderInfo?.result?.status || location.state?.status,
                        isPaid: orderInfo?.result?.isPaid,
                        paymentMethod: paymentMethod
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

    // Hàm mở dialog xác nhận hủy đơn hàng
    const handleCancelOrderClick = () => {
        setShowCancelConfirm(true);
    };

    // Hàm hủy đơn hàng
    const handleCancelOrder = async () => {
        if (!orderId) return;
        
        setShowCancelConfirm(false);

        try {
            setIsCancelling(true);
            setError(null);
            
            // Xác định status dựa trên payment method và isPaid
            // Lấy payment method và isPaid từ API
            let paymentMethod = 'cod'; // Mặc định là COD
            let isPaid = false;
            
            try {
                // Lấy payment transactions và order info song song
                const [paymentTransactions, orderInfo] = await Promise.all([
                    api.get(`/payment/transaction/order/${orderId}`)
                        .then(res => res.data?.result || [])
                        .catch(() => []),
                    orderService.getOrder(orderId).catch(() => null)
                ]);
                
                // Xác định payment method từ transaction
                if (paymentTransactions && paymentTransactions.length > 0) {
                    const transaction = paymentTransactions[0];
                    const transactionCode = transaction?.transactionCode || '';
                    const paymentMethodType = transaction?.paymentMethod?.paymentMethodType || '';
                    
                    if (transactionCode.startsWith('PAYOS-')) {
                        paymentMethod = 'bank';
                    } else if (transactionCode.startsWith('CODE-')) {
                        paymentMethod = 'cod';
                    } else {
                        paymentMethod = (paymentMethodType === 'bank') ? 'bank' : 'cod';
                    }
                }
                
                // Lấy isPaid từ order info
                isPaid = orderInfo?.result?.isPaid || false;
            } catch (err) {
                console.error("Error fetching payment info:", err);
            }
            
            // Xác định status: COD → CANCELED, PayOS (đã thanh toán) → RETURNED
            let newStatus = 'CANCELED'; // Mặc định là CANCELED cho COD
            if (paymentMethod === 'bank' && isPaid) {
                newStatus = 'RETURNED'; // PayOS đã thanh toán → hoàn trả
            }
            
            // Gọi API để hủy đơn hàng
            const response = await orderService.updateOrderStatus(orderId, newStatus);
            
            if (response?.result) {
                // Cập nhật lại dữ liệu đơn hàng
                const fetchDetail = async () => {
                    try {
                        const [apiResult, orderInfo, paymentTransactions] = await Promise.all([
                            profileService.getOrderDetail(orderId),
                            orderService.getOrder(orderId).catch(() => null),
                            api.get(`/payment/transaction/order/${orderId}`)
                                .then(res => res.data?.result || [])
                                .catch(() => [])
                        ]);

                        let paymentMethod = 'cod';
                        if (paymentTransactions && paymentTransactions.length > 0) {
                            const transaction = paymentTransactions[0];
                            const transactionCode = transaction?.transactionCode || '';
                            const paymentMethodType = transaction?.paymentMethod?.paymentMethodType || '';
                            
                            if (transactionCode.startsWith('PAYOS-')) {
                                paymentMethod = 'bank';
                            } else if (transactionCode.startsWith('CODE-')) {
                                paymentMethod = 'cod';
                            } else {
                                paymentMethod = (paymentMethodType === 'bank') ? 'bank' : 'cod';
                            }
                        } else {
                            paymentMethod = location.state?.paymentMethod || 'cod';
                        }

                        const normalizedData = normalizeOrderDetail(
                            apiResult,
                            orderId,
                            customerInfo,
                            orderInfo?.result?.totalAmount || location.state?.totalAmount,
                            {
                                createDatetime: orderInfo?.result?.createDatetime || location.state?.createDatetime,
                                endDateTime: orderInfo?.result?.endDatetime || location.state?.endDateTime,
                                status: orderInfo?.result?.status || location.state?.status,
                                isPaid: orderInfo?.result?.isPaid,
                                paymentMethod: paymentMethod
                            }
                        );

                        setOrderData(normalizedData);
                    } catch (err) {
                        console.error("Lỗi khi tải lại chi tiết đơn hàng:", err);
                    }
                };
                
                await fetchDetail();
                const statusMessage = newStatus === 'RETURNED' 
                    ? 'Đơn hàng đã được hoàn trả thành công!' 
                    : 'Đơn hàng đã được hủy thành công!';
                setToast({
                    type: 'success',
                    message: statusMessage
                });
            } else {
                setToast({
                    type: 'error',
                    message: response?.message || 'Không thể hủy đơn hàng'
                });
            }
        } catch (err) {
            console.error("Lỗi khi hủy đơn hàng:", err);
            setToast({
                type: 'error',
                message: err.response?.data?.message || err.message || 'Không thể hủy đơn hàng'
            });
        } finally {
            setIsCancelling(false);
        }
    };

    // Kiểm tra xem đơn hàng có thể hủy không
    const canCancelOrder = () => {
        if (!orderData) return false;
        // Không thể hủy nếu đã bị hủy, đã giao hàng, hoặc đã nhận hàng
        const status = orderData.status?.toLowerCase() || '';
        const nonCancellableStatuses = ['cancelled', 'đã hủy', 'shipped', 'đang vận chuyển', 'delivered', 'đã giao hàng', 'returned', 'đã trả'];
        
        // Nếu đã ở trạng thái không thể hủy
        if (nonCancellableStatuses.some(s => status.includes(s.toLowerCase()))) {
            return false;
        }
        
        // Có thể hủy nếu đơn hàng ở trạng thái: pending, paid (nhưng chưa shipped)
        const cancellableStatuses = ['pending', 'đang xử lý', 'paid', 'đã thanh toán'];
        return cancellableStatuses.some(s => status.includes(s.toLowerCase()));
    };

    const normalizeOrderDetail = (apiProducts, id, customerData, passedTotalAmount, orderInfo) => {
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
        const createDate = orderInfo?.createDatetime ? new Date(orderInfo.createDatetime) : new Date();
        const endDate = orderInfo?.endDateTime ? new Date(orderInfo.endDateTime) : null;
        const orderStatus = orderInfo?.status || 'pending';
        const isPaid = orderInfo?.isPaid || false;
        const paymentMethod = orderInfo?.paymentMethod || 'cod'; // 'cod' hoặc 'bank' (PayOS)

        // Format ngày giờ
        const formatDateTime = (date) => {
            if (!date) return { date: '', time: '' };
            const dateStr = date.toLocaleDateString('vi-VN');
            const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            return { date: dateStr, time: timeStr };
        };

        const createDateTime = formatDateTime(createDate);
        const endDateTime = endDate ? formatDateTime(endDate) : null;

        // Tạo timeline dựa trên status (giống code mẫu)
        const timeline = [];
        
        // Normalize status: backend trả về uppercase (PENDING, PAID, SHIPPED, DELIVERED, CANCELED, RETURNED, COMPLETED)
        const statusNormalized = (orderStatus || '').toUpperCase();
        const statusLower = statusNormalized.toLowerCase();
        
        // Bước 1: Đặt hàng thành công (luôn có)
        timeline.push({
            status: t('profile.orderSuccess') || 'Đặt hàng thành công',
            date: createDateTime.date,
            time: createDateTime.time,
            completed: true
        });

        // Bước 2: Đang xử lý (nếu status là PENDING hoặc đã qua PENDING)
        if (statusNormalized === 'PENDING' || statusNormalized === 'PAID' || statusNormalized === 'SHIPPED' || 
            statusNormalized === 'DELIVERED' || statusNormalized === 'RETURNED' || statusNormalized === 'COMPLETED') {
            timeline.push({
                status: t('profile.processing') || 'Đang xử lý',
                date: createDateTime.date,
                time: createDateTime.time,
                completed: statusNormalized !== 'PENDING'
            });
        }

        // Bước 3: Đang vận chuyển (nếu status là SHIPPED hoặc DELIVERED)
        if (statusNormalized === 'SHIPPED' || statusNormalized === 'DELIVERED' || 
            statusNormalized === 'RETURNED' || statusNormalized === 'COMPLETED') {
            timeline.push({
                status: t('profile.shipping') || 'Đang vận chuyển',
                date: createDateTime.date,
                time: createDateTime.time,
                completed: statusNormalized === 'DELIVERED' || statusNormalized === 'RETURNED' || statusNormalized === 'COMPLETED'
            });
        }

        // Bước 4: Đã giao hàng (nếu status là DELIVERED và có endDateTime)
        if (statusNormalized === 'DELIVERED' && endDateTime) {
            timeline.push({
                status: t('profile.delivered') || 'Đã giao hàng',
                date: endDateTime.date,
                time: endDateTime.time,
                completed: true
            });
        }

        // Nếu bị hủy
        if (statusNormalized === 'CANCELED' || statusNormalized === 'CANCELLED') {
            timeline.push({
                status: t('profile.cancelled') || 'Đơn hàng đã hủy',
                date: endDateTime?.date || createDateTime.date,
                time: endDateTime?.time || createDateTime.time,
                completed: true
            });
        }

        // Nếu đã hoàn trả
        if (statusNormalized === 'RETURNED') {
            timeline.push({
                status: t('profile.returned') || 'Hoàn trả',
                date: endDateTime?.date || createDateTime.date,
                time: endDateTime?.time || createDateTime.time,
                completed: true
            });
        }

        // Nếu đã hoàn thành (COMPLETED)
        if (statusNormalized === 'COMPLETED') {
            timeline.push({
                status: 'Đã hoàn thành',
                date: endDateTime?.date || createDateTime.date,
                time: endDateTime?.time || createDateTime.time,
                completed: true
            });
        }

        // Map status để hiển thị
        const statusMap = {
            'pending': t('profile.processing') || 'Đang xử lý',
            'paid': t('profile.paid') || 'Đã thanh toán',
            'shipped': t('profile.shipping') || 'Đang vận chuyển',
            'delivered': t('profile.delivered') || 'Đã giao hàng',
            'canceled': t('profile.cancelled') || 'Đã hủy',
            'cancelled': t('profile.cancelled') || 'Đã hủy',
            'returned': t('profile.returned') || 'Hoàn trả',
            'completed': 'Đã hoàn thành'
        };

        // Tính "Đã thanh toán trước": COD = 0, PayOS = totalAmount nếu đã thanh toán
        const paidBefore = paymentMethod === 'cod' ? 0 : (isPaid ? totalAmount : 0);

        return {
            id: id,
            orderCode: `#${id}`,
            date: createDateTime.date,
            status: statusMap[(orderStatus || '').toLowerCase()] || statusMap['pending'] || 'Đang xử lý',
            products: products,
            summary: {
                subtotal: subtotal,
                discount: 0,
                shippingFee: shippingFee,
                totalPaid: totalAmount,
                totalAmountPaid: totalAmount,
                paidBefore: paidBefore, // Số tiền đã thanh toán trước
                vatIncluded: true,
            },
            customer: defaultCustomer,
            paymentMethod: paymentMethod === 'cod' ? 'COD (Thanh toán khi nhận hàng)' : 'PayOS (Chuyển khoản)',
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
                    value={orderData.summary.paidBefore}
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
                    <div className="flex items-center gap-3">
                        {canCancelOrder() && (
                            <button
                                onClick={handleCancelOrderClick}
                                disabled={isCancelling}
                                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                            >
                                {isCancelling ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Đang hủy...
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={16} />
                                        Hủy đơn hàng
                                    </>
                                )}
                            </button>
                        )}
                        <span className="text-red-500 text-sm hover:underline cursor-pointer">Xem hóa đơn VAT</span>
                    </div>
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

            {/* Confirmation Dialog */}
            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Xác nhận hủy đơn hàng</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={isCancelling}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                            >
                                {isCancelling ? 'Đang xử lý...' : 'Xác nhận hủy'}
                            </button>
                        </div>
                    </div>
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

export default OrderDetailPage;