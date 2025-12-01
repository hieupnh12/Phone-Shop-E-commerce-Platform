import React, { useState, useEffect } from 'react';
import { Shield, Search, Filter, CheckCircle, XCircle, Clock, RefreshCw, Eye, Edit } from 'lucide-react';
import { warrantyRequestService } from '../../../services/api';
import Toast from '../../../components/common/Toast';
import Pagination from '../../../components/common/Pagination';

const WarrantyRequestManagementPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(20);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateForm, setUpdateForm] = useState({
        status: '',
        adminNote: '',
        appointmentDate: ''
    });

    useEffect(() => {
        fetchRequests();
    }, [currentPage, statusFilter]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await warrantyRequestService.getAllRequests(
                currentPage,
                pageSize,
                'requestId,desc',
                statusFilter || null
            );
            
            console.log('Warranty requests response:', response);
            console.log('Response type:', typeof response);
            console.log('Response keys:', response ? Object.keys(response) : 'null');
            
            // Backend trả về ApiResponse<Page<ReturnWarrantyRequestResponse>>
            // Structure: { code, message, result: { content: [], totalElements, totalPages, ... } }
            // Service đã extract result, nên response là Page object
            if (response) {
                // Nếu response là Page object (có content property)
                if (response.content && Array.isArray(response.content)) {
                    setRequests(response.content);
                    setTotalPages(response.totalPages || 0);
                    setTotalElements(response.totalElements || 0);
                } 
                // Nếu response là array trực tiếp
                else if (Array.isArray(response)) {
                    setRequests(response);
                    setTotalPages(1);
                    setTotalElements(response.length);
                }
                // Nếu response có result property (nested structure)
                else if (response.result) {
                    const pageData = response.result;
                    if (pageData.content && Array.isArray(pageData.content)) {
                        setRequests(pageData.content);
                        setTotalPages(pageData.totalPages || 0);
                        setTotalElements(pageData.totalElements || 0);
                    } else if (Array.isArray(pageData)) {
                        setRequests(pageData);
                        setTotalPages(1);
                        setTotalElements(pageData.length);
                    }
                }
                // Nếu không có dữ liệu
                else {
                    console.warn('Unexpected response structure:', response);
                    setRequests([]);
                    setTotalPages(0);
                    setTotalElements(0);
                }
            } else {
                setRequests([]);
                setTotalPages(0);
                setTotalElements(0);
            }
        } catch (err) {
            console.error('Error fetching warranty requests:', err);
            console.error('Error details:', err.response?.data || err.message);
            setError('Không thể tải danh sách yêu cầu bảo hành');
            setToast({
                type: 'error',
                message: err.response?.data?.message || err.message || 'Không thể tải danh sách yêu cầu bảo hành'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(0);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredRequests = requests.filter(request => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            request.requestId?.toString().includes(searchLower) ||
            request.orderId?.toString().includes(searchLower) ||
            request.customerName?.toLowerCase().includes(searchLower) ||
            request.productName?.toLowerCase().includes(searchLower) ||
            request.productVersionId?.toLowerCase().includes(searchLower)
        );
    });

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': { label: 'Đang chờ', color: 'bg-yellow-100 text-yellow-800' },
            'ACCEPTED': { label: 'Đã chấp nhận', color: 'bg-blue-100 text-blue-800' },
            'REJECTED': { label: 'Đã từ chối', color: 'bg-red-100 text-red-800' },
            'IN_PROGRESS': { label: 'Đang xử lý', color: 'bg-purple-100 text-purple-800' },
            'COMPLETED': { label: 'Đã hoàn thành', color: 'bg-green-100 text-green-800' }
        };
        const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
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

    const handleOpenUpdateModal = (request) => {
        setSelectedRequest(request);
        setUpdateForm({
            status: request.status || '',
            adminNote: request.adminNote || '',
            appointmentDate: request.appointmentDate ? new Date(request.appointmentDate).toISOString().slice(0, 16) : ''
        });
        setShowUpdateModal(true);
    };

    const handleUpdateRequest = async () => {
        if (!selectedRequest) return;

        try {
            const updateData = {
                status: updateForm.status,
                adminNote: updateForm.adminNote || null,
                appointmentDate: updateForm.appointmentDate ? new Date(updateForm.appointmentDate).toISOString() : null
            };

            await warrantyRequestService.updateRequestStatus(selectedRequest.requestId, updateData);
            
            setToast({
                type: 'success',
                message: 'Cập nhật trạng thái yêu cầu thành công!'
            });
            
            setShowUpdateModal(false);
            setSelectedRequest(null);
            fetchRequests();
        } catch (err) {
            console.error('Error updating request:', err);
            setToast({
                type: 'error',
                message: err.response?.data?.message || 'Không thể cập nhật yêu cầu'
            });
        }
    };

    if (loading && requests.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý yêu cầu bảo hành/đổi trả</h1>
                </div>
                <p className="text-gray-600">Tổng số yêu cầu: {totalElements}</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã, tên khách hàng, sản phẩm..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="PENDING">Đang chờ</option>
                            <option value="ACCEPTED">Đã chấp nhận</option>
                            <option value="REJECTED">Đã từ chối</option>
                            <option value="IN_PROGRESS">Đang xử lý</option>
                            <option value="COMPLETED">Đã hoàn thành</option>
                        </select>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={fetchRequests}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mã yêu cầu
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Đơn hàng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Khách hàng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sản phẩm
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loại
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        {loading ? 'Đang tải...' : 'Không có yêu cầu nào'}
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((request) => (
                                    <tr key={request.requestId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{request.requestId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            #{request.orderId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {request.customerName || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>
                                                <div className="font-medium">{request.productName || 'N/A'}</div>
                                                <div className="text-xs text-gray-500">{request.productVersionId}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getTypeBadge(request.type)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(request.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDate(request.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleOpenUpdateModal(request)}
                                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Cập nhật
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <Pagination
                            currentPage={currentPage + 1}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page - 1)}
                            maxVisiblePages={5}
                            size="md"
                        />
                    </div>
                )}
            </div>

            {/* Update Modal */}
            {showUpdateModal && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Cập nhật yêu cầu #{selectedRequest.requestId}</h2>
                                <button
                                    onClick={() => setShowUpdateModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Request Info */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Đơn hàng:</span>
                                        <span className="ml-2 font-medium">#{selectedRequest.orderId}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Khách hàng:</span>
                                        <span className="ml-2 font-medium">{selectedRequest.customerName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Sản phẩm:</span>
                                        <span className="ml-2 font-medium">{selectedRequest.productName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Loại:</span>
                                        <span className="ml-2">{getTypeBadge(selectedRequest.type)}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-600">Lý do:</span>
                                        <p className="mt-1 text-gray-800">{selectedRequest.reason || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Update Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Trạng thái <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={updateForm.status}
                                        onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="PENDING">Đang chờ</option>
                                        <option value="ACCEPTED">Đã chấp nhận</option>
                                        <option value="REJECTED">Đã từ chối</option>
                                        <option value="IN_PROGRESS">Đang xử lý</option>
                                        <option value="COMPLETED">Đã hoàn thành</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ghi chú của admin
                                    </label>
                                    <textarea
                                        value={updateForm.adminNote}
                                        onChange={(e) => setUpdateForm({ ...updateForm, adminNote: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        placeholder="Nhập ghi chú cho khách hàng..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngày hẹn
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={updateForm.appointmentDate}
                                        onChange={(e) => setUpdateForm({ ...updateForm, appointmentDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowUpdateModal(false)}
                                    className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleUpdateRequest}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

export default WarrantyRequestManagementPage;

