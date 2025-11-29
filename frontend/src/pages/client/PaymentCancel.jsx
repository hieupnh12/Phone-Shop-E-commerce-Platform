import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, ShoppingCart, Loader2 } from 'lucide-react';
import { orderService } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function PaymentCancel() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState(null);
  
  const orderId = searchParams.get('orderId');
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
        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-8 py-6 text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">{t('payment.paymentFailed')}</h1>
          <p className="text-red-100">{t('payment.paymentFailed')}</p>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-gray-600">{t('payment.loadingOrderInfo')}</p>
            </div>
          ) : (
            <>
              {/* Order Info */}
              {(orderId || orderCode) && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <ShoppingCart className="w-6 h-6 text-red-600" />
                    <h2 className="text-xl font-semibold text-gray-900">{t('common.orderInfo')}</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {orderId && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">{t('common.orderCode')}:</span>
                        <span className="font-semibold text-gray-900">#{orderId}</span>
                      </div>
                    )}
                    
                    {orderCode && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">{t('common.paymentCodeLabel')}:</span>
                        <span className="font-semibold text-gray-900">#{orderCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cancel Message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm mb-2">
                  <strong>{t('payment.paymentCanceled')}</strong> {t('payment.orderSaved')}
                </p>
                <p className="text-red-700 text-sm">
                  {t('common.paymentIssue')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                {orderId && (
                  <button
                    onClick={() => navigate(`/payment?retryOrder=${orderId}`)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {t('payment.payAgain')}
                  </button>
                )}
                
                <button
                  onClick={() => navigate('/cart')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  {t('payment.backToCart')}
                </button>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-transparent hover:bg-gray-50 text-gray-600 font-medium py-2 px-6 rounded-lg transition-all"
                >
                  {t('cart.continueShopping')}
                </button>
              </div>

              {/* Support Info */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>
                  {t('common.anyQuestion')}{' '}
                  <a href="mailto:support@payos.vn" className="text-red-600 hover:text-red-700 underline">
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

