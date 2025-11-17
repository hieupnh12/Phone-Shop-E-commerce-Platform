import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, User, MapPin, Phone, Mail, StickyNote, Truck, QrCode, CheckCircle, Edit } from 'lucide-react';

export default function Payment() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [customerInfo] = useState({
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    email: 'nguyenvana@gmail.com',
    address: '123 Đường Láng, Hà Nội'
  });

  const [orderItems] = useState([
    {
      name: 'K5 / Set Wing Gundam Zero EW +',
      variant: 'Mô hình Robot - 2.5.1.1',
      price: 1990000
    }
  ]);

  const shippingFee = 0;
  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + shippingFee;

  const handlePaymentChange = (method) => {
    setPaymentMethod(method);
  };

  const handlePlaceOrder = () => {
    // Xử lý đặt hàng
    console.log('Đặt hàng với phương thức:', paymentMethod);
    // Navigate to success page or handle order
  };

  const handleEditOrder = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-5 px-5">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-rose-600 text-white px-8 py-5 flex items-center gap-3">
          <CreditCard className="w-6 h-6" />
          <h1 className="text-xl font-semibold">Thông tin thanh toán</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Thông tin khách hàng */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <User className="w-5 h-5" />
                Thông tin khách hàng
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2.5 text-sm">
                  <span className="text-gray-600 flex-1">Họ và tên</span>
                  <span className="text-right font-medium text-gray-900">{customerInfo.name}</span>
                </div>
                
                <div className="flex justify-between items-center py-2.5 text-sm">
                  <span className="text-gray-600 flex-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Số điện thoại
                  </span>
                  <span className="text-right font-medium text-gray-900">{customerInfo.phone}</span>
                </div>
                
                <div className="flex justify-between items-center py-2.5 text-sm">
                  <span className="text-gray-600 flex-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </span>
                  <span className="text-right font-medium text-gray-900">{customerInfo.email}</span>
                </div>
                
                <div className="flex justify-between items-center py-2.5 text-sm">
                  <span className="text-gray-600 flex-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Địa chỉ giao hàng
                  </span>
                  <span className="text-right font-medium text-gray-900">{customerInfo.address}</span>
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <StickyNote className="w-5 h-5" />
                Ghi chú đơn hàng
              </h3>
              <p className="text-gray-600 text-sm">
                Giao hàng trong giờ hành chính. Gọi trước khi giao.
              </p>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <CreditCard className="w-5 h-5" />
                Phương thức thanh toán
              </h3>
              
              <div className="space-y-3">
                <label 
                  className={`flex items-center p-3.5 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'cod' 
                      ? 'border-rose-600 bg-rose-50' 
                      : 'border-gray-200 bg-white hover:border-rose-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => handlePaymentChange('cod')}
                    className="mr-3 accent-rose-600"
                  />
                  <Truck className="w-5 h-5 text-rose-600 mr-3" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-xs text-gray-500 mt-0.5">Nhận hàng rồi thanh toán</div>
                  </div>
                </label>

                <label 
                  className={`flex items-center p-3.5 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'bank' 
                      ? 'border-rose-600 bg-rose-50' 
                      : 'border-gray-200 bg-white hover:border-rose-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={() => handlePaymentChange('bank')}
                    className="mr-3 accent-rose-600"
                  />
                  <QrCode className="w-5 h-5 text-rose-600 mr-3" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Chuyển khoản ngân hàng</div>
                    <div className="text-xs text-gray-500 mt-0.5">Quét QR để thanh toán</div>
                  </div>
                </label>
              </div>

              {/* QR Code */}
              {paymentMethod === 'bank' && (
                <div className="mt-4 text-center">
                  <div className="inline-block p-2 border border-gray-200 rounded-lg bg-white">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=PaymentInfo`} 
                      alt="QR Code"
                      className="w-[120px] h-[120px] rounded"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Quét mã QR bằng ứng dụng ngân hàng</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Đơn hàng */}
          <div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {orderItems.map((item, index) => (
                <div key={index} className="p-5 border-b border-gray-200 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{item.variant}</div>
                    </div>
                    <div className="font-semibold text-rose-600 ml-4">
                      {item.price.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-5 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-gray-900">Phí vận chuyển</div>
                  <div className="font-semibold text-rose-600">
                    {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}đ`}
                  </div>
                </div>
              </div>

              <div className="bg-rose-50 p-5">
                <div className="flex justify-between items-center text-lg font-semibold text-rose-600">
                  <div>Tổng cộng</div>
                  <div>{total.toLocaleString('vi-VN')}đ</div>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrder}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3.5 px-6 rounded-lg mt-5 transition-all flex items-center justify-center gap-2 hover:transform hover:-translate-y-0.5"
            >
              <CheckCircle className="w-5 h-5" />
              Đặt hàng
            </button>

            <button 
              onClick={handleEditOrder}
              className="w-full bg-transparent hover:bg-rose-50 text-rose-600 border-2 border-rose-600 font-semibold py-3.5 px-6 rounded-lg mt-3 transition-all flex items-center justify-center gap-2"
            >
              <Edit className="w-5 h-5" />
              Chỉnh sửa đơn hàng
            </button>

            <p className="text-xs text-gray-500 italic mt-4">
              * Quý khách vui lòng kiểm tra kỹ thông tin trước khi đặt hàng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
