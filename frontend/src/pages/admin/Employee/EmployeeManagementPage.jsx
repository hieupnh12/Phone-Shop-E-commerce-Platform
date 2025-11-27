import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Settings, Users, Key, Save, Loader2, AlertTriangle, Edit, X, Plus, Trash2, Search, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Lock, CheckCircle, Unlock, Edit3, Mail } from 'lucide-react';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';

import Toast from "../../../components/common/Toast";


const API_ENDPOINTS = {
    GET_EMPLOYEES: '/employee',
    GET_ROLES: '/role',
    CREATE_EMPLOYEE: '/employee',
    UPDATE_EMPLOYEE: '/employee',
    DELETE_EMPLOYEE: '/employee',
};


// --- MODAL XÁC NHẬN XÓA/VÔ HIỆU HÓA ---
const DeleteEmployeeModal = ({ isOpen, onClose, employee, onDeleteSuccess, setToast }) => { // Thêm setToast
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [localError, setLocalError] = useState(null);

    const handleDelete = async () => {
        if (!employee) return;
        setIsSubmitting(true);
        setLocalError(null);

        try {
            await api.delete(`${API_ENDPOINTS.DELETE_EMPLOYEE}/${employee.id}`);

            onDeleteSuccess(employee.id, employee.fullName);
            onClose();

        } catch (err) {
            console.error("Lỗi vô hiệu hóa nhân viên:", err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || "Không thể vô hiệu hóa tài khoản.";
            setLocalError(errorMessage);
            setToast({ message: errorMessage, type: 'error' }); // Hiển thị lỗi chung lên Toast
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !employee) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
                <div className="p-6 text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Vô hiệu hóa Tài khoản</h3>
                    <p className="text-gray-600 mb-6">
                        Bạn có chắc chắn muốn vô hiệu hóa tài khoản của nhân viên:
                        <span className="font-semibold text-red-600"> {employee.fullName}</span>?
                        <br />
                        Họ sẽ không thể đăng nhập được nữa.
                    </p>
                    {localError && <p className="text-sm text-red-500 mb-3">{localError}</p>}
                    <div className="flex justify-center space-x-3">
                        <button
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Lock className="w-5 h-5 mr-2" />}
                            {isSubmitting ? 'Đang vô hiệu hóa...' : 'Vô hiệu hóa'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MODAL TẠO/SỬA NHÂN VIÊN ---
const EmployeeModal = ({ isOpen, onClose, employeeToEdit, allRoles, onSaveSuccess, setToast }) => {
    const isEdit = !!employeeToEdit;

    const employeeRolesArray = Array.isArray(employeeToEdit?.employeeRoles)
        ? employeeToEdit.employeeRoles
        : [];

    const initialRoles = employeeRolesArray.map(r => r.id);

    const [formData, setFormData] = useState({
        fullName: employeeToEdit?.fullName || '',
        email: employeeToEdit?.email || '',
        isActive: employeeToEdit?.isActive || true,
        roleId: new Set(initialRoles), // Sử dụng Set của IDs
    });

    useEffect(() => {
        if (employeeToEdit) {
            const rolesArr = Array.isArray(employeeToEdit.employeeRoles) ? employeeToEdit.employeeRoles : [];

            setFormData({
                fullName: employeeToEdit.fullName,
                email: employeeToEdit.email,
                isActive: employeeToEdit.isActive,
                roleId: new Set(rolesArr.map(r => r.id)),
            });
        } else {
            // ...
        }
    }, [employeeToEdit]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState(null);
    const [isSendingReset, setIsSendingReset] = useState(false);

    useEffect(() => {
        if (employeeToEdit) {
            const roles = Array.isArray(employeeToEdit.employeeRoles) ? employeeToEdit.employeeRoles : [];
            setFormData({
                fullName: employeeToEdit.fullName,
                email: employeeToEdit.email,
                isActive: employeeToEdit.isActive,
                roleId: new Set(roles.map(r => r.id)),
            });
        } else {
            setFormData({ fullName: '', email: '', isActive: true, roleId: new Set() });
        }
    }, [employeeToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (roleId, isChecked) => {
        setFormData(prev => {
            const newSet = new Set(prev.roleId);
            if (isChecked) {
                newSet.add(roleId);
            } else {
                newSet.delete(roleId);
            }
            return { ...prev, roleId: newSet };
        });
    };

    const handleSubmit = async () => {
        if (!formData.fullName || !formData.email || formData.roleId.size === 0) {
            setLocalError("Vui lòng điền đủ Họ tên, Email và gán ít nhất một Vai trò.");
            return;
        }
        if (!isEdit && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setLocalError("Định dạng Email không hợp lệ.");
            return;
        }

        setIsSubmitting(true);
        setLocalError(null);

        try {
            const payload = {
                fullName: formData.fullName,
                email: formData.email,
                roleId: Array.from(formData.roleId),
                // Chỉ gửi isActive khi chỉnh sửa
                ...(isEdit && { isActive: formData.isActive }),
            };

            let response;
            if (isEdit) {
                // PUT /employee/{id}
                response = await api.put(`${API_ENDPOINTS.UPDATE_EMPLOYEE}/${employeeToEdit.id}`, payload);
            } else {
                // POST /employee
                response = await api.post(API_ENDPOINTS.CREATE_EMPLOYEE, payload);
            }

            // Xử lý thành công
            onSaveSuccess(response.data.result, isEdit);
            onClose();

        } catch (err) {
            console.error(`Lỗi ${isEdit ? 'cập nhật' : 'tạo'} nhân viên:`, err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || `Lỗi không xác định khi ${isEdit ? 'cập nhật' : 'tạo'}.`;
            setLocalError(errorMessage);
            setToast({ message: errorMessage, type: 'error' }); // Hiển thị lỗi lên Toast
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendResetLink = async () => {
        if (!employeeToEdit?.email) return;
        setIsSendingReset(true);
        try {
            await api.post('/employee/forgot', { email: employeeToEdit.email });
            setToast({ message: `Đã gửi email đặt lại mật khẩu tới ${employeeToEdit.email}`, type: 'success' });
        } catch (err) {
            console.error("Lỗi gửi link đặt lại mật khẩu:", err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || "Không thể gửi link đặt lại mật khẩu.";
            setToast({ message: errorMessage, type: 'error' });
        } finally {
            setIsSendingReset(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        {isEdit ? <Edit3 className="w-5 h-5 mr-2 text-blue-500" /> : <Plus className="w-5 h-5 mr-2 text-red-500" />}
                        {isEdit ? `Chỉnh sửa: ${employeeToEdit?.fullName}` : 'Tạo Tài khoản Nhân viên Mới'}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-grow space-y-4">
                    {localError && <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg flex items-center"><AlertTriangle className='w-4 h-4 mr-2' />{localError}</div>}

                    {/* Thông tin cơ bản */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Họ và tên <span className='text-red-500'>*</span></label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Ví dụ: Nguyễn Văn A" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email <span className='text-red-500'>*</span></label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} readOnly={isEdit} className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${isEdit ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`} placeholder="Ví dụ: staff@phoneshop.com" />
                        </div>
                    </div>

                    {/* Trạng thái & Reset Password (Chỉ khi chỉnh sửa) */}
                    {isEdit && (
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                            <label className="flex items-center space-x-2 text-gray-700 font-medium">
                                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <span>Tài khoản đang hoạt động (Active)</span>
                            </label>
                            <button
                                type="button"
                                onClick={handleSendResetLink}
                                disabled={formData.isActive || isSendingReset}
                                className="text-sm text-red-600 hover:underline flex items-center disabled:opacity-50"
                                title={formData.isActive ? "Tài khoản đã kích hoạt" : "Gửi lại link đặt mật khẩu"}
                            >
                                {isSendingReset ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Mail className="w-4 h-4 mr-1" />}
                                {isSendingReset ? 'Đang gửi...' : 'Gửi link đặt mật khẩu'}
                            </button>
                        </div>
                    )}

                    {/* Gán Roles */}
                    <div className="space-y-3 p-4 border rounded-lg">
                        <h4 className="font-semibold text-gray-700 flex items-center"><Key className="w-4 h-4 mr-2 text-red-500" /> Gán Vai trò <span className='text-red-500'>*</span></h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {allRoles.map(role => (
                                <label key={role.id} className="flex items-center cursor-pointer p-2 bg-white rounded-md border hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.roleId.has(role.id)}
                                        onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-800">{role.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t bg-gray-50 flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors">Hủy</button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        {isSubmitting ? 'Đang lưu...' : (isEdit ? 'Lưu Thay đổi' : 'Tạo & Gửi Mật khẩu')}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENT CHÍNH (EMPLOYEE MANAGEMENT PAGE) ---

const EmployeeManagementPage = () => {
    const [employees, setEmployees] = useState([]);
    const [allRoles, setAllRoles] = useState([]);
    const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 1, totalElements: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    const [employeeToEdit, setEmployeeToEdit] = useState(null); // State cho modal Edit
    const [employeeToDelete, setEmployeeToDelete] = useState(null); // State cho modal Delete
    const [isModalOpen, setIsModalOpen] = useState(false); // State cho modal Create/Edit

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ message: '', type: 'success' }); // State cho Toast


    // --- LOGIC FETCH VÀ REFRESH DỮ LIỆU ---
    const fetchEmployees = async (currentPage = pagination.page, currentSize = pagination.size, search = searchTerm) => {
        try {
            setIsLoading(true);
            setError(null);

            // 1. Lấy danh sách Roles (Cần cho Modal)
            const roleResponse = await api.get(API_ENDPOINTS.GET_ROLES);
            setAllRoles(roleResponse.data.result || []);

            const empResponse = await api.get(API_ENDPOINTS.GET_EMPLOYEES, {
                params: { page: currentPage, size: currentSize, search: search }
            });

            const result = empResponse.data.result;

            setEmployees(result.content || []);
            setPagination({
                page: result.number,
                size: result.size,
                totalPages: result.totalPages,
                totalElements: result.totalElements,
            });

        } catch (err) {
            console.error("Lỗi tải dữ liệu nhân viên:", err);
            setError("Không thể tải danh sách nhân viên. Vui lòng kiểm tra API Backend.");
        } finally {
            setIsLoading(false);
        }
    };

    // Sử dụng useCallback để hàm này không bị re-render không cần thiết
    const fetchEmployeesCallback = useCallback(fetchEmployees, [pagination.size, searchTerm]);

    useEffect(() => {
        fetchEmployeesCallback(0); // Luôn reset về trang 0 khi searchTerm thay đổi
    }, [searchTerm, fetchEmployeesCallback]);


    // --- LOGIC XỬ LÝ SỰ KIỆN ---
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchEmployees(newPage, pagination.size, searchTerm);
        }
    };

    const openCreateModal = () => {
        setEmployeeToEdit(null); // Reset để mở Modal Tạo mới
        setIsModalOpen(true);
    };

    const openEditModal = (employee) => {
        setEmployeeToEdit(employee); // Đặt nhân viên để Edit
        setIsModalOpen(true);
    };


    // ✅ LOGIC CẬP NHẬT STATE SAU KHI LƯU (Tạo hoặc Sửa)
    const handleSaveSuccess = (savedEmployeeData, isEdit) => {
        const message = isEdit
            ? `Cập nhật nhân viên ${savedEmployeeData.fullName} thành công!`
            : `Tạo tài khoản nhân viên ${savedEmployeeData.fullName} thành công! Mật khẩu đã được gửi qua email.`;

        if (isEdit) {
            // Sửa thành công, cập nhật state cục bộ
            setEmployees(prev => prev.map(emp => emp.id === savedEmployeeData.id ? savedEmployeeData : emp));
        } else {
            // Tạo mới, tải lại trang 0 để thấy nhân viên mới nhất
            fetchEmployees(0, pagination.size, searchTerm);
        }
        setToast({ message: message, type: 'success' });
    };

    // ✅ LOGIC XÓA/VÔ HIỆU HÓA
    const handleDeleteSuccess = (employeeId, employeeName) => {
        // Lọc khỏi danh sách hiện tại
        setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
        setToast({ message: `Vô hiệu hóa tài khoản ${employeeName} thành công!`, type: 'success' });
    };

    // --- RENDER COMPONENT CHÍNH ---

    return (
        <>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl space-y-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center border-b pb-3 mb-4">
                    <Users className="w-7 h-7 mr-3 text-red-500" />
                    Quản lý Nhân viên ({pagination.totalElements})
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-3" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Thanh tìm kiếm và Tạo mới */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-80">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo Tên hoặc Email..."
                            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors w-full sm:w-auto"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Thêm Nhân viên
                    </button>
                </div>

                {/* Bảng Danh sách Nhân viên */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Đang tải...
                                </td>
                            </tr>
                        ) : employees.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-gray-500">
                                    Không tìm thấy nhân viên nào.
                                </td>
                            </tr>
                        ) : (
                            employees.map((employee) => (
                                <tr key={employee.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{employee.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {/* ✅ FIX: Thêm Optional Chaining để bảo vệ khỏi lỗi .map trên null */}
                                        {employee.employeeRoles?.map(r => (
                                            <span key={r.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                                                    {r.name}
                                                </span>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {employee.isActive ? (
                                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle className='w-3 h-3 mr-1' /> Hoạt động
                                                </span>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <Lock className='w-3 h-3 mr-1' /> Vô hiệu hóa
                                                </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openEditModal(employee)}
                                            className="text-blue-600 hover:text-blue-900 mr-3 p-1 rounded-md hover:bg-blue-50 transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit3 className='w-5 h-5' />
                                        </button>
                                        <button
                                            onClick={() => setEmployeeToDelete(employee)}
                                            disabled={!employee.isActive} // Chỉ xóa/vô hiệu hóa tài khoản đang active
                                            className={`p-1 rounded-md transition-colors ${!employee.isActive ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900 hover:bg-red-50'}`}
                                            title={employee.isActive ? "Vô hiệu hóa" : "Đã vô hiệu hóa"}
                                        >
                                            <Trash2 className='w-5 h-5' />
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
                        Hiển thị {employees.length} trên {pagination.totalElements} kết quả.
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

            {/* Modal Tạo/Sửa */}
            <EmployeeModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEmployeeToEdit(null); }} // Reset employeeToEdit khi đóng
                employeeToEdit={employeeToEdit}
                allRoles={allRoles}
                onSaveSuccess={(data, isEdit) => {
                    handleSaveSuccess(data, isEdit);
                    setIsModalOpen(false); // Đóng modal sau khi lưu thành công
                    setEmployeeToEdit(null); // Đảm bảo modal tạo mới hoạt động đúng lần sau
                }}
                setToast={setToast} // Truyền setToast vào Modal
            />

            {/* Modal Xóa/Vô hiệu hóa */}
            <DeleteEmployeeModal
                isOpen={!!employeeToDelete}
                onClose={() => setEmployeeToDelete(null)}
                employee={employeeToDelete}
                onDeleteSuccess={(id, name) => {
                    handleDeleteSuccess(id, name);
                    setEmployeeToDelete(null); // Đóng modal sau khi xóa
                }}
                setToast={setToast} // Truyền setToast vào Modal
            />

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ message: '', type: 'success' })}
                position="bottom-right" // Đặt vị trí Toast (Tùy chọn)
            />
        </>
    );
};

export default EmployeeManagementPage;