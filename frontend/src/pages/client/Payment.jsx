import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, User, MapPin, Phone, Mail, StickyNote, Truck, QrCode, CheckCircle, Edit, Loader2, Plus } from 'lucide-react';
import { customerService } from '../../services/api';
import cartService from '../../services/cartService';
import { useLanguage } from '../../contexts/LanguageContext';

import AddressForm from '../../components/common/AddressForm';
import Toast from '../../components/common/Toast';
import { formatPhoneNumber } from '../../utils/phoneUtils';

// Format tiền VND
const vnd = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(Number.isFinite(n) ? n : 0);

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  // Lấy danh sách sản phẩm được chọn từ state navigation (nếu có)
  const selectedProductVersionIds = location.state?.selectedProductVersionIds || null;
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [payOSQRCode, setPayOSQRCode] = useState('');
  const [payOSLink, setPayOSLink] = useState('');
  const [loadingQR, setLoadingQR] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [cartItems, setCartItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [toast, setToast] = useState(null);

  // Load addresses from address book
  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await customerService.getAddresses();
      const addressList = response?.result || response || [];
      setAddresses(addressList);
      
      // Nếu có địa chỉ và chưa chọn, chọn địa chỉ đầu tiên (hoặc địa chỉ mặc định)
      if (addressList.length > 0 && !selectedAddressId) {
        const defaultAddress = addressList[0];
        setSelectedAddressId(defaultAddress.addressBookId);
        setCustomerInfo(prev => ({
          ...prev,
          address: defaultAddress.address || prev.address
        }));
      }
    } catch (error) {
      console.error(t('payment.loadError'), error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Load cart data and customer info
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load cart
        const cartData = await cartService.getCart();
        if (cartData?.success && cartData.cartItems) {
          // Nếu có danh sách sản phẩm được chọn, chỉ lấy các sản phẩm đó
          if (selectedProductVersionIds && selectedProductVersionIds.length > 0) {
            const filteredItems = cartData.cartItems.filter((item) =>
              selectedProductVersionIds.includes(item.productVersionId)
            );
            setCartItems(filteredItems);
          } else {
            // Nếu không có danh sách chọn, lấy tất cả (backward compatibility)
            setCartItems(cartData.cartItems);
          }
        } else {
          setError(t('payment.failedToUpdate'));
        }

        // Load customer info from API
        try {
          const customerData = await customerService.getMyCustomerInfo();
          console.log('Customer data received:', customerData);
          
          // API trả về { code, message, result: CustomerResponse }
          const customer = customerData?.result || customerData;
          
          if (customer && (customer.fullName || customer.phoneNumber || customer.email || customer.address)) {
            setCustomerInfo({
              name: customer.fullName || 'Khách hàng',
              phone: customer.phoneNumber || '',
              email: customer.email || '',
              address: customer.address || ''
            });
            console.log('Customer info set successfully:', {
              name: customer.fullName || 'Khách hàng',
              phone: customer.phoneNumber || '',
              email: customer.email || '',
              address: customer.address || ''
            });
          } else {
            console.warn('No customer data in response or all fields are empty:', customer);
            setCustomerInfo({
              name: 'Khách hàng',
              phone: '',
              email: '',
              address: ''
            });
          }
        } catch (e) {
          // Nếu không lấy được customer info, dùng default
          console.error('Could not load customer info:', e);
          setCustomerInfo({
            name: 'Khách hàng',
            phone: '',
            email: '',
            address: ''
          });
        }

        // Load addresses from address book
        await loadAddresses();
      } catch (e) {
        setError(e.message || t('payment.networkError'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedProductVersionIds]); // Re-load khi danh sách sản phẩm được chọn thay đổi

  // Handle address selection
  const handleAddressChange = (addressBookId) => {
    const selectedAddress = addresses.find(addr => addr.addressBookId === addressBookId);
    if (selectedAddress) {
      setSelectedAddressId(addressBookId);
      setCustomerInfo(prev => ({
        ...prev,
        address: selectedAddress.address
      }));
    }
  };

  // Handle save new address
  const handleSaveAddress = async (formData, isEditMode) => {
    try {
      setLoadingAddresses(true);
      // Trong Payment chỉ cho phép thêm mới, không edit
      const result = await customerService.addAddress(formData);
      // Sau khi thêm, reload và chọn địa chỉ vừa thêm
      await loadAddresses();
      if (result?.addressBookId) {
        setSelectedAddressId(result.addressBookId);
        setCustomerInfo(prev => ({
          ...prev,
          address: result.address || prev.address
        }));
      } else if (result && result.addressBookId) {
        // Nếu result là object trực tiếp
        setSelectedAddressId(result.addressBookId);
        setCustomerInfo(prev => ({
          ...prev,
          address: result.address || prev.address
        }));
      }
      setShowAddressForm(false);
      setToast({
        message: 'Thêm địa chỉ thành công!',
        type: 'success'
      });
    } catch (error) {
      console.error("Lỗi khi lưu địa chỉ:", error);
      setToast({
        message: "Lỗi: Không thể lưu địa chỉ. " + (error.response?.data?.message || error.message || "Vui lòng thử lại."),
        type: 'error'
      });
    } finally {
      setLoadingAddresses(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
  const FREE_SHIP_LIMIT = 1000;   // giống ShoppingCart.jsx
  const shippingFee = subtotal >= FREE_SHIP_LIMIT ? 0 : 30000;
  const total = subtotal + shippingFee;

  const handlePaymentChange = async (method) => {
    setPaymentMethod(method);

    // Nếu chọn bank, tạo payment link preview để lấy QR code
    if (method === 'bank' && cartItems.length > 0) {
      setLoadingQR(true);
      try {
        const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
        const FREE_SHIP_LIMIT = 1000;   // giống ShoppingCart.jsx
        const shippingFee = subtotal >= FREE_SHIP_LIMIT ? 0 : 30000;
        const total = subtotal + shippingFee;

        const orderData = {
          total: total,
          subtotal: subtotal,
          shippingFee: shippingFee,
          paymentMethod: 'bank',
          note: note || 'Giao hàng trong giờ hành chính. Gọi trước khi giao.'
        };

        console.log('Calling previewPayment with:', orderData);
        const response = await cartService.previewPayment(orderData);
        console.log('Preview payment response:', response);

        if (response?.success) {
          if (response?.qrCode) {
            console.log('QR Code received:', response.qrCode.substring(0, 50) + '...');
            setPayOSQRCode(response.qrCode);
            setPayOSLink(response.paymentLink);
          } else if (response?.paymentLink) {
            // Nếu không có QR code nhưng có payment link, vẫn lưu link
            console.log('Payment link received (no QR):', response.paymentLink);
            setPayOSLink(response.paymentLink);
            setPayOSQRCode('');
          } else {
            console.warn('No QR code or payment link in response');
          }
        } else {
          console.error('Preview payment failed:', response?.message);
        }
      } catch (e) {
        console.error('Error creating payment preview:', e);
      } finally {
        setLoadingQR(false);
      }
    } else {
      // Reset khi chọn COD
      setPayOSQRCode('');
      setPayOSLink('');
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      setError(t('payment.emptyCart'));
      return;
    }

    // Kiểm tra địa chỉ
    if (!selectedAddressId || addresses.length === 0) {
      setToast({
        message: t('payment.addAddressBeforeOrder'),
        type: 'warning'
      });
      return;
    }

    try {
      setPlacingOrder(true);
      setError('');

      // Gọi API checkout để tạo order
      const orderData = {
        total: total,
        subtotal: subtotal,
        shippingFee: shippingFee,
        paymentMethod: paymentMethod,
        note: note || t('payment.defaultDelivery'),
        address: customerInfo.address || '',
        // Truyền danh sách productVersionId được chọn (nếu có)
        selectedProductVersionIds: selectedProductVersionIds || cartItems.map(item => item.productVersionId)
      };

      const response = await cartService.createOrder(orderData);

      if (response?.success) {
        // Nếu có paymentLink (PayOS), redirect đến trang thanh toán
        if (response.requiresPayment && response.paymentLink) {
          window.location.href = response.paymentLink;
        } else {
          // Navigate to orders page cho COD hoặc nếu PayOS link không có
          navigate('/user/profile/order');
        }
      } else {
        setError(response?.message || t('payment.failedToUpdate'));
      }
    } catch (e) {
      // Xử lý lỗi từ API response
      const errorMessage = e.response?.data?.message || e.message || t('payment.orderError');
      setError(errorMessage);
      
      // Nếu có danh sách sản phẩm hết hàng, hiển thị chi tiết
      if (e.response?.data?.outOfStockItems && Array.isArray(e.response.data.outOfStockItems)) {
        const detailedMessage = e.response.data.outOfStockItems.join('\n');
        setError(detailedMessage);
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleEditOrder = () => {
    navigate('/user/cart');
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="pt-20 sm:pt-24 py-5 px-5">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-rose-600 text-white px-8 py-5 flex items-center gap-3">
          <CreditCard className="w-6 h-6" />
          <h1 className="text-xl font-semibold">{t('payment.paymentInfo')}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Thông tin khách hàng */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <User className="w-5 h-5" />
                {t('payment.customerInfo')}
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2.5 text-sm">
                  <span className="text-gray-600 flex-1">{t('personalInfo.fullName')}</span>
                  <span className="text-right font-medium text-gray-900">{customerInfo.name || t('payment.notUpdated')}</span>
                </div>

                <div className="flex justify-between items-center py-2.5 text-sm">
                  <span className="text-gray-600 flex-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t('common.phone')}
                  </span>
                  <span className="text-right font-medium text-gray-900">{formatPhoneNumber(customerInfo.phone) || t('payment.notUpdated')}</span>
                </div>

                <div className="flex justify-between items-center py-2.5 text-sm">
                  <span className="text-gray-600 flex-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('personalInfo.email')}
                  </span>
                  <span className="text-right font-medium text-gray-900">{customerInfo.email || t('payment.notUpdated')}</span>
                </div>

                <div className="py-2.5 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">{t('payment.deliveryAddress')}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <select
                      value={selectedAddressId || ''}
                      onChange={(e) => handleAddressChange(Number(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                      disabled={loadingAddresses || addresses.length === 0}
                    >
                      {addresses.length === 0 ? (
                        <option value="">{t('payment.noAddress')}</option>
                      ) : (
                        <>
                          <option value="">{t('payment.selectAddress')}</option>
                          {addresses.map((addr) => (
                            <option key={addr.addressBookId} value={addr.addressBookId}>
                              {addr.address}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg flex items-center gap-1 text-sm transition-colors"
                    >
                      <Plus size={16} />
                      {t('common.add')}
                    </button>
                  </div>
                  {selectedAddressId && (
                    <p className="mt-2 text-xs text-gray-500">
                      {addresses.find(addr => addr.addressBookId === selectedAddressId)?.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <StickyNote className="w-5 h-5" />
                {t('payment.orderNote')}
              </h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('payment.defaultDelivery')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                rows="3"
              />
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <CreditCard className="w-5 h-5" />
                {t('payment.paymentMethod')}
              </h3>

              <div className="space-y-3">
                <label
                  className={`flex items-center p-3.5 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod'
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
                    <div className="font-medium text-gray-900">{t('payment.cod')}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t('payment.codDescription')}</div>
                  </div>
                </label>

                <label
                  className={`flex items-center p-3.5 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'bank'
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
                    <div className="font-medium text-gray-900">{t('payment.bankTransfer')}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t('payment.scanQRToPay')}</div>
                  </div>
                </label>
              </div>

              {/* QR Code */}
              {paymentMethod === 'bank' && (
                <div className="mt-4 text-center">
                  {loadingQR ? (
                    <div className="py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-rose-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">{t('payment.generatingQR')}</p>
                    </div>
                  ) : payOSQRCode ? (
                    <>
                      <div className="inline-block p-2 border border-gray-200 rounded-lg bg-white">
                        <img
                          src={payOSQRCode}
                          alt={t('payment.payOSQRCode')}
                          className="w-[200px] h-[200px] rounded"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{t('payment.scanQRInstruction')}</p>
                      {payOSLink && (
                        <a
                          href={payOSLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-rose-600 hover:text-rose-700 underline"
                        >
                          {t('payment.openPaymentLink')}
                        </a>
                      )}
                    </>
                  ) : (
                    <div className="py-4">
                      <p className="text-xs text-gray-500">{t('payment.orderNote')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Đơn hàng */}
          <div className="space-y-5">
            {loading ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-rose-600 mx-auto mb-4" />
                <p className="text-gray-600">{t('payment.loadingOrderInfo')}</p>
              </div>
            ) : (
              <>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  {cartItems.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <p>{t('payment.emptyCart')}</p>
                      <button
                        onClick={() => navigate('/user/cart')}
                        className="mt-4 text-rose-600 hover:text-rose-700 font-medium"
                      >
                        {t('payment.backToCart')}
                      </button>
                    </div>
                  ) : (
                    <>
                      {cartItems.map((item, index) => (
                        <div key={item.productVersionId || index} className="p-5 border-b border-gray-200 last:border-b-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{item.productName || t('common.products')}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                {t('payment.quantity')}: {item.quantity || 1}
                              </div>
                            </div>
                            <div className="font-semibold text-rose-600 ml-4">
                              {vnd((item.price || 0) * (item.quantity || 1))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="text-gray-900">{t('payment.subtotal')}</div>
                        <div className="font-semibold text-gray-900">{vnd(subtotal)}</div>
                      </div>
                    </div>

                    <div className="p-5 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="text-gray-900">{t('payment.shippingFee')}</div>
                        <div className="font-semibold text-rose-600">
                          {shippingFee === 0 ? t('payment.free') : vnd(shippingFee)}
                        </div>
                      </div>
                    </div>

                    <div className="bg-rose-50 p-5">
                      <div className="flex justify-between items-center text-lg font-semibold text-rose-600">
                        <div>{t('payment.total')}</div>
                        <div>{vnd(total)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    <div className="font-semibold mb-2">⚠️ {t('payment.cannotPlaceOrder')}:</div>
                    <div className="whitespace-pre-line">{error}</div>
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || placingOrder || cartItems.length === 0}
                  className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 hover:transform hover:-translate-y-0.5"
                >
                  {placingOrder ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('payment.processing')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      {t('payment.placeOrder')}
                    </>
                  )}
                </button>

                <button
                  onClick={handleEditOrder}
                  className="w-full bg-transparent hover:bg-rose-50 text-rose-600 border-2 border-rose-600 font-semibold py-3.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  {t('payment.editOrder')}
                </button>

                <p className="text-xs text-gray-500 italic">
                  * {t('payment.checkInfoBeforeOrder')}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <AddressForm
          addressToEdit={null}
          onClose={() => setShowAddressForm(false)}
          onSave={handleSaveAddress}
        />
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
}
