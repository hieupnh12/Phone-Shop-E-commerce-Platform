import React, { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle, XCircle, RefreshCw, AlertCircle, Package } from 'lucide-react';
import { warrantyRequestService } from '../../services/api';
import Toast from '../common/Toast';

const WarrantyPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await warrantyRequestService.getMyRequests();
            console.log('My warranty requests:', response);
            
            if (Array.isArray(response)) {
                setRequests(response);
            } else if (response?.result && Array.isArray(response.result)) {
                setRequests(response.result);
            } else {
                setRequests([]);
            }
        } catch (err) {
            console.error('Error fetching warranty requests:', err);
            setError('Không thể tải danh sách yêu cầu bảo hành');
            setToast({
                type: 'error',
                message: 'Không thể tải danh sách yêu cầu bảo hành'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': { 
                label: 'Đang chờ xử lý', 
                color: 'bg-yellow-100 text-yellow-800',
                icon: Clock
            },
            'ACCEPTED': { 
                label: 'Đã chấp nhận', 
                color: 'bg-blue-100 text-blue-800',
                icon: CheckCircle
            },
            'REJECTED': { 
                label: 'Đã từ chối', 
                color: 'bg-red-100 text-red-800',
                icon: XCircle
            },
            'IN_PROGRESS': { 
                label: 'Đang xử lý', 
                color: 'bg-purple-100 text-purple-800',
                icon: RefreshCw
            },
            'COMPLETED': { 
                label: 'Đã hoàn thành', 
                color: 'bg-green-100 text-green-800',
                icon: CheckCircle
            }
        };
        const statusInfo = statusMap[status] || { 
            label: status, 
            color: 'bg-gray-100 text-gray-800',
            icon: AlertCircle
        };
        const Icon = statusInfo.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                <Icon size={14} />
                {statusInfo.label}
            </span>
        );
    };

    const getTypeBadge = (type) => {
        return type === 'WARRANTY' ? (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Bảo hành
            </span>
        ) : (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Đổi trả
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredRequests = statusFilter === 'all' 
        ? requests 
        : requests.filter(req => req.status === statusFilter);

    if (loading) {
        return (
            <div className="bg-white p-6 shadow-lg rounded-xl">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 shadow-lg rounded-xl">
                <div className="flex items-center mb-6">
                    <Shield size={24} className="text-red-500 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800">Yêu cầu bảo hành/đổi trả của tôi</h2>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Tất cả</option>
                        <option value="PENDING">Đang chờ</option>
                        <option value="ACCEPTED">Đã chấp nhận</option>
                        <option value="IN_PROGRESS">Đang xử lý</option>
                        <option value="COMPLETED">Đã hoàn thành</option>
                        <option value="REJECTED">Đã từ chối</option>
                    </select>
                    <button
                        onClick={fetchMyRequests}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw size={16} />
                        Làm mới
                    </button>
                </div>

                {/* Requests List */}
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">
                            {requests.length === 0 
                                ? 'Bạn chưa có yêu cầu bảo hành nào' 
                                : 'Không có yêu cầu nào với trạng thái đã chọn'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredRequests.map((request) => (
                            <div key={request.requestId} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-semibold text-gray-900">Yêu cầu #{request.requestId}</span>
                                            {getTypeBadge(request.type)}
                                            {getStatusBadge(request.status)}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Đơn hàng: <span className="font-medium">#{request.orderId}</span>
                                        </p>
                                        {request.productName && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                Sản phẩm: <span className="font-medium">{request.productName}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                        <p>Ngày tạo:</p>
                                        <p className="font-medium">{formatDate(request.createdAt)}</p>
                                    </div>
                                </div>

                                {request.reason && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium text-gray-700 mb-1">Lý do:</p>
                                        <p className="text-sm text-gray-600">{request.reason}</p>
                                    </div>
                                )}

                                {request.adminNote && (
                                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm font-medium text-blue-800 mb-1">Ghi chú từ nhân viên:</p>
                                        <p className="text-sm text-blue-700">{request.adminNote}</p>
                                    </div>
                                )}

                                {request.appointmentDate && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock size={16} />
                                        <span>Ngày hẹn: <span className="font-medium">{formatDate(request.appointmentDate)}</span></span>
                                    </div>
                                )}

                                {request.employeeName && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                                        Được xử lý bởi: <span className="font-medium">{request.employeeName}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Warranty Policy Info */}
            <div className="bg-white p-6 shadow-lg rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Chính sách bảo hành</h3>
                <div className="space-y-4">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3">Thông tin chung</h4>
                        <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                            <p><strong>Thời gian bảo hành:</strong> Bảo hành sản phẩm trong vòng 1 năm kể từ khi mua hàng.</p>
                            <p><strong>Điều kiện bảo hành:</strong> Trong thời gian bảo hành, sản phẩm sẽ được sửa chữa hoặc thay thế miễn phí nếu có lỗi do nhà sản xuất.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast */}
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

export default WarrantyPage;

