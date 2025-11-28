import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Package, Loader2 } from 'lucide-react';
import { orderService } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState(null);
  
  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status');
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    // Load order info if orderId is available
    if (orderId) {
      loadOrderInfo();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const loadOrderInfo = async () => {
    try {
      const response = await orderService.getOrder(parseInt(orderId));
      if (response?.result) {
        setOrderInfo(response.result);
      }
    } catch (error) {
      console.error('Error loading order info:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-6 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">{t('payment.paymentSuccess')}</h1>
          <p className="text-green-100">{t('common.thankYou')}</p>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">{t('payment.loadingOrderInfo')}</p>
            </div>
          ) : (
            <>
              {/* Order Info */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{t('payment.orderInfo')}</h2>
                </div>
                
                <div className="space-y-3">
                  {orderId && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">{t('orders.orderCode')}:</span>
                      <span className="font-semibold text-gray-900">#{orderId}</span>
                    </div>
                  )}
                  
                  {orderCode && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">{t('common.paymentCodeLabel')}:</span>
                      <span className="font-semibold text-gray-900">#{orderCode}</span>
                    </div>
                  )}
                  
                  {status && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">{t('common.statusLabel')}:</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        {status === 'PAID' ? t('orders.paid') : status}
                      </span>
                    </div>
                  )}

                  {orderInfo && (
                    <>
                      {orderInfo.totalAmount && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600">{t('common.totalMoneyLabel')}:</span>
                          <span className="font-semibold text-green-600 text-lg">
                            {new Intl.NumberFormat('vi-VN', { 
                              style: 'currency', 
                              currency: 'VND',
                              maximumFractionDigits: 0 
                            }).format(orderInfo.totalAmount)}
                          </span>
                        </div>
                      )}
                      
                      {orderInfo.createDatetime && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">{t('common.orderDateLabel')}:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(orderInfo.createDatetime).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm">
                  <strong>{t('payment.successOrder')}</strong>
                </p>
                <p className="text-green-700 text-sm mt-2">
                  {t('payment.confirmEmail')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/profile/order')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  {t('payment.viewMyOrder')}
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  {t('cart.continueShopping')}
                </button>
              </div>

              {/* Support Info */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>
                  {t('common.anyQuestion')}{' '}
                  <a href="mailto:support@payos.vn" className="text-green-600 hover:text-green-700 underline">
                    support@payos.vn
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

