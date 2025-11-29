import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Search, Loader2, AlertTriangle, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Eye } from 'lucide-react';
import api from "../../../services/api";
import Toast from "../../../components/common/Toast";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const API_ENDPOINT = '/audit-log';

const ChangesModal = ({ isOpen, onClose, log }) => {
    if (!isOpen || !log) return null;

    const formatChanges = (changes) => {
        if (!changes) return 'Không có chi tiết thay đổi.';
        try {
            const obj = JSON.parse(changes);
            return JSON.stringify(obj, null, 2);
        } catch (e) {
            return changes;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-blue-500" /> Chi tiết Thay đổi - ID: {log.id}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-grow space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 border-b pb-3">
                        <p><strong>Bảng:</strong> <span className='font-mono text-red-600'>{log.tableName}</span></p>
                        <p><strong>Hành động:</strong> <span className='font-semibold'>{log.action}</span></p>
                        <p><strong>Employee ID:</strong> {log.employeeId}</p>
                        <p><strong>Record ID:</strong> {log.recordId || 'N/A'}</p>
                        <p className='col-span-2'><strong>Thời gian:</strong> {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}</p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-800 mb-2">Dữ liệu Thay đổi (JSON)</h4>
                        <pre className="bg-gray-800 text-green-300 p-3 rounded-lg overflow-x-auto text-xs font-mono max-h-60">
                            {formatChanges(log.changes)}
                        </pre>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">Đóng</button>
                </div>
            </div>
        </div>
    );
};


const AuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({ page: 0, size: 15, totalPages: 1, totalElements: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState(null); // State cho Modal xem chi tiết

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ message: '', type: 'success' });


    // --- LOGIC FETCH DỮ LIỆU ---
    const fetchAuditLogs = async (currentPage = pagination.page, currentSize = pagination.size, search = searchTerm) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.get(API_ENDPOINT, {
                params: { page: currentPage, size: currentSize, search: search }
            });

            const result = response.data.result;

            setLogs(result.content || []);
            setPagination({
                page: result.number,
                size: result.size,
                totalPages: result.totalPages,
                totalElements: result.totalElements,
            });

        } catch (err) {
            console.error("Lỗi tải Audit Logs:", err.response?.data || err.message);
            setError("Không thể tải Nhật ký hoạt động. Vui lòng kiểm tra quyền hạn.");
            setToast({ message: "Lỗi: Không thể tải log. Kiểm tra Backend.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLogsCallback = useCallback(fetchAuditLogs, [pagination.size]);

    useEffect(() => {
        fetchLogsCallback(0); // Luôn reset về trang 0 khi searchTerm thay đổi
    }, [searchTerm, fetchLogsCallback]);


    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchAuditLogs(newPage, pagination.size, searchTerm);
        }
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            return format(new Date(isoString), 'dd/MM/yyyy HH:mm:ss', { locale: vi });
        } catch (e) {
            return 'Lỗi định dạng';
        }
    };

    const getActionStyle = (action) => {
        switch (action) {
            case 'CREATE':
                return 'bg-green-100 text-green-800';
            case 'UPDATE':
                return 'bg-yellow-100 text-yellow-800';
            case 'DELETE':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };


    // --- RENDER COMPONENT CHÍNH ---

    return (
        <>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl space-y-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center border-b pb-3 mb-4">
                    <Shield className="w-7 h-7 mr-3 text-red-500" />
                    Nhật ký Hoạt động Hệ thống (Audit Logs)
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-3" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Thanh tìm kiếm */}
                <div className="flex justify-between items-center gap-4">
                    <div className="relative w-full sm:w-80">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo Bảng hoặc ID Employee..."
                            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">Tổng cộng: {pagination.totalElements} log</p>
                </div>

                {/* Bảng Danh sách Logs */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bảng</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Record ID</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-10 text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Đang tải...
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-10 text-gray-500">
                                    Không tìm thấy bản ghi hoạt động nào.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className='hover:bg-gray-50 transition-colors'>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.employeeId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDateTime(log.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">{log.tableName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${getActionStyle(log.action)}`}>
                                                {log.action}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{log.recordId || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => setSelectedLog(log)}
                                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors flex items-center justify-end ml-auto"
                                            title="Xem chi tiết thay đổi"
                                        >
                                            <Eye className='w-5 h-5' />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Hiển thị {logs.length} trên {pagination.totalElements} log.
                    </p>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button onClick={() => handlePageChange(0)} disabled={pagination.page === 0} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                            <ChevronsLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 0} className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-600 text-sm font-medium text-white">
                            Trang {pagination.page + 1} / {pagination.totalPages}
                        </span>
                        <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages - 1} className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <button onClick={() => handlePageChange(pagination.totalPages - 1)} disabled={pagination.page >= pagination.totalPages - 1} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                            <ChevronsRight className="w-5 h-5" />
                        </button>
                    </nav>
                </div>
            </div>

            {/* Modal Xem Chi tiết */}
            <ChangesModal
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                log={selectedLog}
            />

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ message: '', type: 'success' })}
            />
        </>
    );
};

export default AuditLogPage;