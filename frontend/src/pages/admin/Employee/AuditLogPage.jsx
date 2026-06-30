import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Search, Loader2, AlertTriangle, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Eye, X, RefreshCw, FileText, Terminal } from 'lucide-react';
import api from "../../../services/api";
import Toast from "../../../components/common/Toast";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';


const API_ENDPOINT = '/audit-log';

const ChangesModal = ({ isOpen, onClose, log }) => {
    if (!isOpen || !log) return null;

    const formatJSON = (obj) => {
        if (!obj) return '// No data available.';
        try {
            return JSON.stringify(obj, null, 2);
        } catch (e) {
            return String(obj);
        }
    };

    const parseChanges = (changes) => {
        if (!changes) return null;
        try {
            const parsed = JSON.parse(changes);
            // Kiểm tra xem có phải structure của UPDATE (có old, new, changes)
            if (parsed && typeof parsed === 'object' && ('old' in parsed || 'new' in parsed || 'changes' in parsed)) {
                return parsed;
        }
            return null;
        } catch (e) {
            return null;
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE':
                return 'text-green-400';
            case 'UPDATE':
                return 'text-yellow-400';
            case 'DELETE':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    const updateData = parseChanges(log.changes);
    const isUpdateAction = log.action === 'UPDATE' && updateData;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border-2 border-green-500 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header - Command Screen Style */}
                <div className="bg-[#1a1a1a] border-b-2 border-green-500 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Terminal className="w-5 h-5 text-green-400" />
                            <div>
                                <h3 className="text-green-400 font-mono font-bold text-lg">AUDIT_LOG_DETAIL</h3>
                                <p className="text-gray-400 font-mono text-xs">// ID: {log.id}</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-red-400 transition-colors font-mono"
                        >
                            [ CLOSE ]
                    </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-grow bg-[#0a0a0a] space-y-4">
                    {/* Info Display - Terminal Style */}
                    <div className="space-y-2 font-mono text-sm">
                        <div className="flex gap-4">
                            <span className="text-green-400">TABLE:</span>
                            <span className="text-gray-300">{log.tableName}</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-green-400">ACTION:</span>
                            <span className={getActionColor(log.action)}>{log.action}</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-green-400">EMPLOYEE_ID:</span>
                            <span className="text-gray-300">{log.employeeId || 'N/A'}</span>
                            {log.employeeFullName && (
                                <span className="text-gray-500">// {log.employeeFullName}</span>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <span className="text-green-400">RECORD_ID:</span>
                            <span className="text-gray-300">{log.recordId || 'N/A'}</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-green-400">TIMESTAMP:</span>
                            <span className="text-gray-300">
                                {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                            </span>
                        </div>
                        {log.ipAddress && (
                            <div className="flex gap-4">
                                <span className="text-green-400">IP_ADDRESS:</span>
                                <span className="text-gray-300">{log.ipAddress}</span>
                            </div>
                        )}
                        {log.userAgent && (
                            <div className="flex gap-4 flex-wrap">
                                <span className="text-green-400">USER_AGENT:</span>
                                <span className="text-gray-300 break-all">{log.userAgent}</span>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-0.5 bg-green-500 my-4"></div>

                    {/* Changes Display - Different layout for UPDATE */}
                    {isUpdateAction ? (
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-center gap-2">
                                <span className="text-green-400 font-mono text-sm">// UPDATE_CHANGES</span>
                            </div>

                            {/* Old vs New - Side by Side */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* OLD DATA */}
                                <div className="bg-black border border-red-500/30 p-4">
                                    <div className="mb-2">
                                        <span className="text-red-400 font-mono text-xs font-bold">[ OLD DATA ]</span>
                                    </div>
                                    <pre className="text-red-300 text-xs font-mono leading-relaxed overflow-x-auto max-h-[300px] overflow-y-auto">
                                        {formatJSON(updateData.old)}
                                    </pre>
                    </div>

                                {/* NEW DATA */}
                                <div className="bg-black border border-green-500/30 p-4">
                                    <div className="mb-2">
                                        <span className="text-green-400 font-mono text-xs font-bold">[ NEW DATA ]</span>
                                    </div>
                                    <pre className="text-green-300 text-xs font-mono leading-relaxed overflow-x-auto max-h-[300px] overflow-y-auto">
                                        {formatJSON(updateData.new)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Default JSON Display for CREATE/DELETE */
                    <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-green-400 font-mono text-sm">// CHANGES_DATA</span>
                            </div>
                            <div className="bg-black border border-green-500/30 p-4 overflow-x-auto">
                                <pre className="text-green-400 text-xs font-mono leading-relaxed">
                                    {formatJSON(log.changes ? (() => {
                                        try {
                                            return JSON.parse(log.changes);
                                        } catch {
                                            return log.changes;
                                        }
                                    })() : null)}
                        </pre>
                    </div>
                        </div>
                    )}
                </div>

                {/* Footer - Command Prompt Style */}
                <div className="bg-[#1a1a1a] border-t-2 border-green-500 p-3">
                    <div className="flex items-center gap-2 font-mono text-sm">
                        <span className="text-green-400">audit-log$</span>
                        <span className="text-gray-500">Press [ESC] or click [CLOSE] to exit</span>
                    </div>
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

    // Filter states
    const [filters, setFilters] = useState({
        employeeId: '',
        employeeName: '',
        tableName: '',
        startDate: '',
        endDate: ''
    });

    // Danh sách các bảng có thể filter
    // Lưu ý: tableName trong database lưu tên class (Order, Employee, Role, Product, Customer)
    // chứ không phải tên bảng trong database (orders, employees, roles, products, customers)
    const tableOptions = [
        { value: '', label: 'Tất cả bảng' },
        { value: 'Order', label: 'Order' },
        { value: 'Role', label: 'Role' },
        { value: 'Employee', label: 'Employee' },
        { value: 'Product', label: 'Product' },
        { value: 'Customer', label: 'Customer' }
    ];

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ message: '', type: 'success' });


    // --- LOGIC FETCH DỮ LIỆU ---
    const fetchAuditLogs = useCallback(async (currentPage = 0, currentSize = pagination.size, search = searchTerm, currentFilters = filters) => {
        try {
            setIsLoading(true);
            setError(null);

            // Build params object
            const params = {
                page: currentPage,
                size: currentSize
            };

            // Add search if exists (for backward compatibility)
            if (search && search.trim()) {
                params.search = search;
            }

            // Add filter params if they have values
            if (currentFilters.employeeId && currentFilters.employeeId.trim()) {
                const empIdValue = parseInt(currentFilters.employeeId.trim());
                if (!isNaN(empIdValue) && empIdValue >= 0) {
                    params.employeeId = empIdValue;
                }
            }
            if (currentFilters.employeeName && currentFilters.employeeName.trim()) {
                params.employeeName = currentFilters.employeeName.trim();
            }
            if (currentFilters.tableName && currentFilters.tableName.trim()) {
                params.tableName = currentFilters.tableName.trim();
            }
            if (currentFilters.startDate && currentFilters.startDate.trim()) {
                // Convert date to ISO format
                const startDate = new Date(currentFilters.startDate);
                if (!isNaN(startDate.getTime())) {
                    params.startDate = startDate.toISOString();
                }
            }
            if (currentFilters.endDate && currentFilters.endDate.trim()) {
                // Convert date to ISO format and set to end of day
                const endDate = new Date(currentFilters.endDate);
                if (!isNaN(endDate.getTime())) {
                    endDate.setHours(23, 59, 59, 999);
                    params.endDate = endDate.toISOString();
                }
            }

            const response = await api.get(API_ENDPOINT, { params });

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
    }, [pagination.size, searchTerm, filters]);

    useEffect(() => {
        fetchAuditLogs(0, pagination.size, searchTerm, filters); // Luôn reset về trang 0 khi searchTerm hoặc filters thay đổi
    }, [searchTerm, filters, fetchAuditLogs, pagination.size]);


    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => {
            const newFilters = {
                ...prev,
                [filterName]: value
            };
            
            // Validation: endDate không được là ngày trong tương lai
            if (filterName === 'endDate' && value) {
                const endDate = new Date(value);
                const now = new Date();
                if (endDate > now) {
                    setToast({ message: 'Ngày kết thúc không được là ngày trong tương lai', type: 'error' });
                    return prev; // Giữ nguyên giá trị cũ
                }
            }
            
            // Validation: startDate không được lớn hơn endDate
            if (filterName === 'startDate' && value && newFilters.endDate) {
                const startDate = new Date(value);
                const endDate = new Date(newFilters.endDate);
                if (startDate > endDate) {
                    setToast({ message: 'Ngày bắt đầu không được lớn hơn ngày kết thúc', type: 'error' });
                    return prev;
                }
            }
            
            // Validation: endDate không được nhỏ hơn startDate
            if (filterName === 'endDate' && value && newFilters.startDate) {
                const startDate = new Date(newFilters.startDate);
                const endDate = new Date(value);
                if (endDate < startDate) {
                    setToast({ message: 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu', type: 'error' });
                    return prev;
                }
            }
            
            return newFilters;
        });
    };

    const handleEmployeeIdChange = (e) => {
        const value = e.target.value;
        // Chỉ cho phép số dương (không cho nhập âm, không cho nhập chữ)
        if (value === '' || /^\d+$/.test(value)) {
            handleFilterChange('employeeId', value);
        }
    };

    const handleClearFilters = () => {
        setFilters({
            employeeId: '',
            employeeName: '',
            tableName: '',
            startDate: '',
            endDate: ''
        });
        setSearchTerm('');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchAuditLogs(newPage, pagination.size, searchTerm, filters);
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
            <div className="max-w-8xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4 bg-white p-5 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Nhật ký Hoạt động Hệ thống</h1>
                                <p className="text-sm text-gray-500">Theo dõi và quản lý các thay đổi trong hệ thống</p>
                            </div>
                        </div>
                        <button
                            onClick={() => fetchAuditLogs(0, pagination.size, searchTerm, filters)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                            title="Làm mới dữ liệu"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Làm mới
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
                    {/* General Search */}
                    <div className="mb-4">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm chung (Bảng, Action, IP, User Agent...)"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-700">Bộ lọc nâng cao</h3>
                            <button
                                onClick={handleClearFilters}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Employee ID Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">ID Nhân viên</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="Nhập ID nhân viên"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    value={filters.employeeId}
                                    onChange={handleEmployeeIdChange}
                                    min="0"
                                />
                            </div>

                            {/* Employee Name Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Tên Nhân viên</label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên nhân viên"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    value={filters.employeeName}
                                    onChange={(e) => handleFilterChange('employeeName', e.target.value)}
                                />
                            </div>

                            {/* Table Name Filter - Dropdown */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Bảng tác động</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                                    value={filters.tableName}
                                    onChange={(e) => handleFilterChange('tableName', e.target.value)}
                                >
                                    {tableOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Start Date Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Từ ngày</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    max={filters.endDate || new Date().toISOString().slice(0, 16)}
                                />
                            </div>

                            {/* End Date Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Đến ngày</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    max={new Date().toISOString().slice(0, 16)}
                                    min={filters.startDate || undefined}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-end">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Tổng số log</p>
                                <p className="text-xl font-bold text-gray-800">{pagination.totalElements}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bảng Danh sách Logs */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                        <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Thời gian</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bảng</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Hành động</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Record ID</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                        <td colSpan="7" className="text-center py-16">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                                            <p className="text-gray-500">Đang tải dữ liệu...</p>
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                        <td colSpan="7" className="text-center py-16">
                                            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p className="text-gray-500 font-medium">Không tìm thấy bản ghi hoạt động nào</p>
                                            <p className="text-sm text-gray-400 mt-1">Thử thay đổi từ khóa tìm kiếm</p>
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                        <tr 
                                            key={log.id} 
                                            className="hover:bg-blue-50/50 transition-colors border-b border-gray-100"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-semibold text-gray-900">#{log.id}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{log.employeeId || 'N/A'}</p>
                                                    {log.employeeFullName && (
                                                        <p className="text-xs text-gray-500">{log.employeeFullName}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm text-gray-700">{formatDateTime(log.createdAt)}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-mono font-semibold">
                                                    {log.tableName}
                                                </span>
                                            </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getActionStyle(log.action)}`}>
                                                {log.action}
                                            </span>
                                    </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="text-sm font-medium text-gray-700">{log.recordId || 'N/A'}</span>
                                            </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => setSelectedLog(log)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium"
                                            title="Xem chi tiết thay đổi"
                                        >
                                                    <Eye className="w-4 h-4" />
                                                    Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                    </div>
                </div>

                {/* Phân trang */}
                <div className="bg-white rounded-2xl shadow-lg p-5 mt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-600">
                            Hiển thị <span className="font-semibold text-gray-800">{logs.length}</span> trên{' '}
                            <span className="font-semibold text-gray-800">{pagination.totalElements}</span> log
                    </p>
                        <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                            <button 
                                onClick={() => handlePageChange(0)} 
                                disabled={pagination.page === 0} 
                                className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                            <ChevronsLeft className="w-5 h-5" />
                        </button>
                            <button 
                                onClick={() => handlePageChange(pagination.page - 1)} 
                                disabled={pagination.page === 0} 
                                className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white">
                                Trang {pagination.page + 1} / {pagination.totalPages || 1}
                        </span>
                            <button 
                                onClick={() => handlePageChange(pagination.page + 1)} 
                                disabled={pagination.page >= pagination.totalPages - 1} 
                                className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                            <button 
                                onClick={() => handlePageChange(pagination.totalPages - 1)} 
                                disabled={pagination.page >= pagination.totalPages - 1} 
                                className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                            <ChevronsRight className="w-5 h-5" />
                        </button>
                    </nav>
                    </div>
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