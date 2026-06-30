import React, { useState, useEffect } from 'react';
import { Calendar, Package, CheckCircle, Truck, XCircle, Clock, Eye } from 'lucide-react';
import { orderService } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function OrderHistory() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Status tabs mapping
  const statusTabs = [
    { value: 'all', label: t('orders.title') },
    { value: 'PENDING', label: t('orders.pending') },
    { value: 'PAID', label: t('orders.paid') },
    { value: 'SHIPPED', label: t('orders.shipping') },
    { value: 'DELIVERED', label: t('orders.delivered') },
    { value: 'CANCELED', label: t('orders.canceled') },
  ];

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Use getMyOrders to get orders for current logged-in customer
        const response = await orderService.getMyOrders();
        if (response?.result) {
          setOrders(response.result);
          setFilteredOrders(response.result);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        // If getMyOrders fails, try getOrders as fallback
        try {
          const fallbackResponse = await orderService.getOrders();
          if (fallbackResponse?.result) {
            setOrders(fallbackResponse.result);
            setFilteredOrders(fallbackResponse.result);
          }
        } catch (fallbackError) {
          console.error('Error fetching orders (fallback):', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on tab and date range
  useEffect(() => {
    let filtered = [...orders];

    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(order => order.status === activeTab);
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createDatetime);
        return orderDate >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createDatetime);
        return orderDate <= end;
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createDatetime);
      const dateB = new Date(b.createDatetime);
      return dateB - dateA;
    });

    setFilteredOrders(filtered);
  }, [orders, activeTab, startDate, endDate]);

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      'PENDING': t('orders.pending'),
      'PAID': t('orders.paid'),
      'SHIPPED': t('orders.processing'),
      'DELIVERED': t('orders.delivered'),
      'CANCELED': t('orders.canceled'),
      'RETURNED': t('orders.returned'),
    };
    return statusMap[status] || status;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colorMap = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PAID': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELED': 'bg-red-100 text-red-800',
      'RETURNED': 'bg-gray-100 text-gray-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Get product image (placeholder if not available)
  const getProductImage = (orderDetail) => {
    // You can add logic to get product image from productVersion
    // For now, using placeholder
    return orderDetail?.productVersion?.picture || 'https://via.placeholder.com/80';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">.</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4 p-2">
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.value
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-rose-600" />
            <span className="font-medium text-gray-700">{t('orders.orderHistory')}</span>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
            <span className="text-gray-500">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {t('orders.clearFilters')}
              </button>
            )}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">{t('orders.noOrders')}</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.orderId} className="bg-white rounded-lg shadow-sm p-6">
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-500">{t('orders.orderCode')}</p>
                      <p className="font-semibold text-gray-900">#{order.orderId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('common.orderDateFilter')}</p>
                      <p className="font-medium text-gray-700">{formatDate(order.createDatetime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <button className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium text-sm">
                      <Eye className="w-4 h-4" />
                      {t('orders.viewDetails')}
                    </button>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  {order.orderDetails && order.orderDetails.length > 0 ? (
                    order.orderDetails.map((detail, index) => (
                      <div key={detail.orderDetailId || index} className="flex gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={getProductImage(detail)}
                            alt={detail.productName || t('common.products')}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80';
                            }}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {detail.productName || t('orders.product')}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {detail.productVersionId && `Mã: ${detail.productVersionId}`}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              Giá: <span className="font-medium">{formatCurrency(detail.unitPriceAfter)}₫</span>
                            </span>
                            <span className="text-gray-600">
                              Số lượng: <span className="font-medium">{detail.quantity}</span>
                            </span>
                            {detail.subtotal && (
                              <span className="text-gray-600">
                                Thành tiền: <span className="font-medium text-rose-600">{formatCurrency(detail.subtotal)}₫</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">{t('orders.noProductDetails')}</div>
                  )}

                  {/* Additional products indicator */}
                  {order.orderDetails && order.orderDetails.length > 1 && (
                    <p className="text-sm text-gray-500 italic">
                      Cùng {order.orderDetails.length - 1} sản phẩm khác
                    </p>
                  )}
                </div>

                {/* Order Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {order.isPaid ? (
                      <span className="text-green-600 font-medium">Đã xuất VAT</span>
                    ) : (
                      <span className="text-gray-500">Chưa xuất VAT</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Tổng thanh toán</p>
                    <p className="text-xl font-bold text-rose-600">
                      {formatCurrency(order.totalAmount)}₫
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

