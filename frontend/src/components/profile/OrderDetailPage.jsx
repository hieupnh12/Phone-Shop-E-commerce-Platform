// file orderDetailPage
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Clock, Loader2, ChevronRight,  Package, Truck, Home, Phone, ShoppingCart, Info, Edit3, Heart } from 'lucide-react';
import {profileService} from "../../services/api";



const OrderDetailPage = () => {
    const { orderId } = useParams();
    const [orderData, setOrderData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!orderId) return;

            try {
                setIsLoading(true);
                const apiResult = await profileService.getOrderDetail(orderId); // orderId là string hoặc Integer (Backend dùng Integer)

                const normalizedData = normalizeOrderDetail(apiResult, orderId);

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
    }, [orderId]);

    const normalizeOrderDetail = (apiProducts, id) => {
        // Vì API chi tiết đơn hàng của bạn chỉ trả về danh sách sản phẩm,
        // Ta cần phải giả định/lấy các thông tin khác (thông tin khách hàng, tổng tiền) từ các API khác
        // hoặc từ data gốc nếu có. Ở đây, tôi sẽ dùng mock data cho các phần còn lại.

        const products = apiProducts.map(p => ({
            id: p.productId,
            name: p.productName,
            image: p.picture,
            price: p.unitPriceBefore,
            quantity: 1, // Giả định quantity là 1 cho mỗi item (hoặc cần API chi tiết hơn)
            warrantyEnd: '23/03/2026', // Mock
            canRepurchase: true, // Mock
        }));

        const totalAmount = products.reduce((sum, p) => sum + p.price, 0);

        return {
            id: id,
            orderCode: `#${id}`,
            date: new Date().toLocaleDateString('vi-VN'), // Mock ngày hiện tại
            status: 'Đã nhận hàng', // Mock
            // ... các thông tin Mock khác (customer, summary, timeline, supportInfo)
            // ... cần được fetch từ các API khác nếu có
            products: products,
            summary: {
                subtotal: totalAmount,
                discount: 0,
                shippingFee: 0,
                totalPaid: totalAmount,
                totalAmountPaid: totalAmount,
                vatIncluded: true,
            },
            customer: {
                name: 'Nguyễn Nhất Sinh', phone: '0982481094', address: '244 Phạm Văn Đồng, Hà Nội', note: '-',
            },
            supportInfo: {
                storeAddress: '244 Phạm Văn Đồng, P. Cổ Nhuế, Q. Bắc Từ Liêm, Hà Nội', storePhone: '02471007244',
            },
            timeline: [
                { status: 'Đặt hàng thành công', date: '24/03/2025', time: '19:02', completed: true },
                { status: 'Đã giao hàng', date: '24/03/2025', time: '19:02', completed: true },
            ],
        };
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN') + 'đ';
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
        <div className="p-5 bg-white rounded-xl border border-gray-100 h-full">
            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Thông tin khách hàng</h4>
            <div className="space-y-3">
                <InfoRow label="Họ và tên" value={orderData.customer.name} />
                <InfoRow label="Số điện thoại" value={orderData.customer.phone} />
                <InfoRow label="Địa chỉ" value={orderData.customer.address} />
                <InfoRow label="Ghi chú" value={orderData.customer.note} />
            </div>
        </div>
    );

    const PaymentInfoCard = () => (
        <div className="p-5 bg-white rounded-xl border border-gray-100 h-full">
            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Thông tin thanh toán</h4>
            <div className="space-y-2">
                <InfoRow label="Sản phẩm" value={orderData.products.length} note="số lượng" />
                <InfoRow label="Tổng tiền hàng" value={orderData.summary.subtotal} currency />
                <InfoRow label="Giảm giá" value={-orderData.summary.discount} currency highlight />
                <InfoRow label="Phí vận chuyển" value={orderData.summary.shippingFee} currency={orderData.summary.shippingFee > 0} value={orderData.summary.shippingFee === 0 ? 'Miễn phí' : orderData.summary.shippingFee} />
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <InfoRow
                    label="Tổng số tiền"
                    value={orderData.summary.totalPaid}
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
        // Tối đa 5 bước
        const steps = orderData.timeline;
        const totalSteps = steps.length;

        return (
            <div className="my-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
                <div className="flex justify-between items-center relative w-full min-w-[600px] pb-6 pt-3">

                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center w-1/4 relative z-10">
                            {/* Icon/Dot */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 
                                ${step.completed ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}
                            >
                                {step.completed ? <CheckCircle size={16} /> : <Clock size={16} />}
                            </div>

                            {/* Line nối */}
                            {index < totalSteps - 1 && (
                                <div className={`absolute h-1 top-4 left-1/2 w-full transition-colors duration-500 
                                    ${steps[index + 1]?.completed ? 'bg-blue-600' : 'bg-gray-200'} z-0`}
                                     style={{ width: `calc(100% + ${100 / totalSteps}%)`, transform: 'translateX(-50%)' }}>
                                </div>
                            )}

                            {/* Text */}
                            <p className={`mt-3 text-sm font-medium text-center ${step.completed ? 'text-blue-700' : 'text-gray-500'}`}>
                                {step.status}
                            </p>
                            <p className="text-xs text-gray-400">{step.date}</p>
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
                <Link to="/profile/order" className="hover:text-red-500">Lịch sử mua hàng</Link>
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
                                <Link to={`/warranty/${product.id}`} className="text-xs text-blue-500 hover:text-blue-700 font-medium mt-1 inline-block">Xem</Link>
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