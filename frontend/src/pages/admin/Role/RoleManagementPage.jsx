import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Users, Key, Save, Loader2, AlertTriangle, Edit, X, Plus, Trash2 } from 'lucide-react';
import api from "../../../services/api";
import { useNavigate } from 'react-router-dom';
import { usePermission, PERMISSIONS } from '../../../hooks/usePermission';
import Toast from '../../../components/common/Toast';

const API_ENDPOINTS = {
    GET_ROLES: '/role',
    GET_ALL_PERMISSIONS: '/role/permission',
    UPDATE_ROLE: '/role',
    CREATE_ROLE: '/role',
    DELETE_ROLE: '/role',
};

const DeleteRoleModal = ({ isOpen, onClose, role, onDeleteSuccess, setToast }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!role) return;
        setIsDeleting(true);

        try {
            await api.delete(`${API_ENDPOINTS.DELETE_ROLE}/${role.id}`);

            onDeleteSuccess(role.id);
            onClose();
            if (setToast) {
                setToast({
                    type: 'success',
                    message: `Xóa Role "${role.name}" thành công!`
                });
            }

        } catch (err) {
            console.error("Lỗi xóa Role:", err.response?.data || err.message);
            if (setToast) {
                setToast({
                    type: 'error',
                    message: err.response?.data?.message || "Lỗi xóa Role không xác định."
                });
            }
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen || !role) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
                <div className="p-6 text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận Xóa Vai trò</h3>
                    <p className="text-gray-600 mb-6">
                        Bạn có chắc chắn muốn xóa vĩnh viễn Role: <span className="font-semibold text-red-600">{role.name}</span>?
                        <br />
                        Thao tác này không thể hoàn tác.
                    </p>
                    <div className="flex justify-center space-x-3">
                        <button
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                            disabled={isDeleting}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors disabled:opacity-50"
                        >
                            {isDeleting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Trash2 className="w-5 h-5 mr-2" />}
                            {isDeleting ? 'Đang xóa...' : 'Xóa Role'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CreateRoleModal = ({ isOpen, onClose, allPermissions, onCreateSuccess, setToast }) => {
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDescription, setNewRoleDescription] = useState('');
    const [newRolePermissions, setNewRolePermissions] = useState(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTogglePermission = (permissionKey) => {
        setNewRolePermissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(permissionKey)) {
                newSet.delete(permissionKey);
            } else {
                newSet.add(permissionKey);
            }
            return newSet;
        });
    };

    const handleSelectAllModule = (permissions) => {
        setNewRolePermissions(prev => {
            const moduleKeys = permissions.map(p => p.key);
            const newSet = new Set(prev);

            const isAllSelected = moduleKeys.every(key => prev.has(key));

            if (isAllSelected) {
                moduleKeys.forEach(key => newSet.delete(key));
            } else {
                moduleKeys.forEach(key => newSet.add(key));
            }
            return newSet;
        });
    };

    const getSafePermissionIds = useMemo(() => {
        const ids = [];
        Object.values(allPermissions).flat().forEach(p => {
            const idValue = parseInt(p.id);
            if (newRolePermissions.has(p.key) && !isNaN(idValue) && idValue > 0) {
                ids.push(idValue);
            }
        });
        return Array.from(new Set(ids));
    }, [newRolePermissions, allPermissions]);


    const handleSubmit = async () => {
        const permissionIds = getSafePermissionIds;

        if (!newRoleName || permissionIds.length === 0) {
            if (setToast) {
                setToast({
                    type: 'warning',
                    message: "Vui lòng nhập Tên Role và chọn ít nhất một Quyền."
                });
            }
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await api.post(API_ENDPOINTS.CREATE_ROLE, {
                roleName: newRoleName,
                description: newRoleDescription,
                permissionId: permissionIds, // Đã sửa key
            });

            const createdRoleData = response.data.result;
            onCreateSuccess(createdRoleData);

            setNewRoleName('');
            setNewRoleDescription('');
            setNewRolePermissions(new Set());
            onClose();
            
            if (setToast) {
                setToast({
                    type: 'success',
                    message: `Tạo Role "${newRoleName}" thành công!`
                });
            }

        } catch (err) {
            console.error("Lỗi tạo Role:", err.response?.data || err.message);
            if (setToast) {
                setToast({
                    type: 'error',
                    message: err.response?.data?.message || "Lỗi không xác định khi tạo Role."
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    if (!isOpen) return null;

    const moduleKeys = Object.keys(allPermissions);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 border-b">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <Plus className="w-5 h-5 mr-2 text-red-500" /> Tạo Vai trò Mới
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto flex-grow space-y-6">
                    {/* Thông tin cơ bản */}
                    <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
                        <h4 className="font-semibold text-gray-700">Thông tin cơ bản</h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên Vai trò <span className='text-red-500'>*</span></label>
                            <input
                                type="text"
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="Ví dụ: MANAGER, SALE_LEAD"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                            <textarea
                                value={newRoleDescription}
                                onChange={(e) => setNewRoleDescription(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 min-h-[80px]"
                                placeholder="Mô tả vai trò này có thể làm gì"
                            />
                        </div>
                    </div>

                    {/* Danh sách Permissions */}
                    <h4 className="font-semibold text-gray-700 mt-4 flex items-center">
                        <Key className="w-4 h-4 mr-2 text-blue-600" />
                        Gán Quyền hạn
                    </h4>
                    <div className="space-y-4">
                        {moduleKeys.map(moduleKey => (
                            <div key={moduleKey} className="border border-gray-300 rounded-lg p-4 shadow-sm">
                                <div className="flex justify-between items-center mb-3 border-b pb-2">
                                    <h3 className="text-lg font-bold text-gray-700">{moduleKey} Module</h3>
                                    <button
                                        onClick={() => handleSelectAllModule(allPermissions[moduleKey])}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                    >
                                        {allPermissions[moduleKey].every(p => newRolePermissions.has(p.key)) ? 'Bỏ chọn Tất cả' : 'Chọn Tất cả'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                    {allPermissions[moduleKey].map(p => (
                                        <label key={p.key} className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newRolePermissions.has(p.key)}
                                                onChange={() => handleTogglePermission(p.key)}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition duration-150"
                                            />
                                            <span className="ml-3 text-sm text-gray-700">{p.desc}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t bg-gray-50 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        {isSubmitting ? 'Đang tạo...' : 'Tạo Role'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RoleManagementPage = () => {
    const { hasPermission } = usePermission();
    const [roles, setRoles] = useState([]);
    const [allPermissions, setAllPermissions] = useState({});
    const [selectedRole, setSelectedRole] = useState(null);
    const [currentPermissions, setCurrentPermissions] = useState(new Set());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // State quản lý Modal
    const [roleToDelete, setRoleToDelete] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    const groupPermissions = (apiPermissions) => {
        const grouped = {};
        apiPermissions.forEach(p => {
            const key = `${p.module}:${p.action}:${p.resource}`;
            if (!grouped[p.module]) { grouped[p.module] = []; }
            grouped[p.module].push({ id: p.id, module: p.module, action: p.action, resource: p.resource, key: key, desc: `${p.action} ${p.resource}` });
        });
        return grouped;
    };

    const normalizeRole = (role) => {
        if (!role) return null;
        const permissions = Array.isArray(role.rolePermissions) ? role.rolePermissions : [];
        return {
            id: role.id,
            name: role.name,
            description: role.description || '',
            permissionKeys: new Set(permissions.map(p => `${p.module}:${p.action}:${p.resource}`)),
            permissionIds: new Set(permissions.map(p => p.id)),
        };
    };

    const normalizeRoles = (apiRoles) =>
        apiRoles
            .map(normalizeRole)
            .filter(Boolean);

    const fetchRolesAndPermissions = async () => {
        try {
            setIsLoading(true);

            // 1. Lấy Permissions
            const permResponse = await api.get(API_ENDPOINTS.GET_ALL_PERMISSIONS);
            const groupedPerms = groupPermissions(permResponse.data.result || []);
            setAllPermissions(groupedPerms);

            // 2. Lấy Roles
            const roleResponse = await api.get(API_ENDPOINTS.GET_ROLES);
            const normalizedRoles = normalizeRoles(roleResponse.data.result || []);
            setRoles(normalizedRoles);

            // 3. Chọn Role mặc định (hoặc giữ Role cũ)
            if (selectedRole && normalizedRoles.some(r => r.id === selectedRole.id)) {
                const updatedSelectedRole = normalizedRoles.find(r => r.id === selectedRole.id);
                setSelectedRole(updatedSelectedRole);
                setCurrentPermissions(updatedSelectedRole.permissionKeys);
            } else if (!selectedRole && normalizedRoles.length > 0) {
                const defaultRole = normalizedRoles[0];
                setSelectedRole(defaultRole);
                setCurrentPermissions(defaultRole.permissionKeys);
            } else if (normalizedRoles.length === 0) {
                setSelectedRole(null);
                setCurrentPermissions(new Set());
            }

        } catch (err) {
            console.error("Lỗi tải dữ liệu phân quyền:", err);
            setToast({
                type: 'error',
                message: "Không thể tải cấu hình Role. Vui lòng kiểm tra API Backend."
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRolesAndPermissions();
    }, []);


    const handleSelectRole = (role) => {
        setSelectedRole(role);
        setCurrentPermissions(new Set(role.permissionKeys));
    };

    const handleTogglePermission = (permissionKey) => {
        setCurrentPermissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(permissionKey)) {
                newSet.delete(permissionKey);
            } else {
                newSet.add(permissionKey);
            }
            return newSet;
        });
    };

    const selectedPermissionIds = useMemo(() => {
        const ids = [];
        Object.values(allPermissions).flat().forEach(p => {
            const idValue = parseInt(p.id);
            if (currentPermissions.has(p.key) && !isNaN(idValue) && idValue > 0) {
                ids.push(idValue);
            }
        });
        return Array.from(new Set(ids));
    }, [currentPermissions, allPermissions]);

    const handleRoleCreated = (apiRole) => {
        if (!apiRole) {
            fetchRolesAndPermissions();
            return;
        }

        const normalizedRole = normalizeRole(apiRole);

        if (!normalizedRole) {
            fetchRolesAndPermissions();
            return;
        }

        setRoles(prev => [...prev, normalizedRole]);

        setSelectedRole(normalizedRole);
        setCurrentPermissions(new Set(normalizedRole.permissionKeys));
    };

    const handleSaveRole = async () => {
        if (!selectedRole || isSaving) return;
        setIsSaving(true);
        try {
            const permissionIds = selectedPermissionIds;

            await api.put(`${API_ENDPOINTS.UPDATE_ROLE}/${selectedRole.id}`, {
                roleName: selectedRole.name,
                description: selectedRole.description,
                permissionId: permissionIds,
            });

            const updatedRole = {
                ...selectedRole,
                permissionKeys: new Set(currentPermissions),
                permissionIds: new Set(permissionIds),
            };

            setRoles(prev =>
                prev.map(role => (role.id === updatedRole.id ? updatedRole : role))
            );
            setSelectedRole(updatedRole);

            setToast({
                type: 'success',
                message: `Cập nhật Role "${updatedRole.name}" thành công!`
            });

        } catch (err) {
            console.error("Lỗi khi lưu Role:", err.response?.data || err.message);
            setToast({
                type: 'error',
                message: "Lỗi khi lưu quyền: " + (err.response?.data?.message || err.message)
            });
        } finally {
            setIsSaving(false);
        }
    };
    const handleDeleteRole = async (roleId) => {
        try {
            const deletedRole = roles.find(r => r.id === roleId);
            setRoles(prev => prev.filter(r => r.id !== roleId));

            if (selectedRole && selectedRole.id === roleId) {
                setSelectedRole(null);
                setCurrentPermissions(new Set());
            }
            
            // Toast đã được hiển thị trong DeleteRoleModal
        } catch (err) {
            console.error("Lỗi xóa role cục bộ:", err);
        }
    };

    const handleSelectAllModule = (permissions) => {
        setCurrentPermissions(prev => {
            const moduleKeys = permissions.map(p => p.key);
            const newSet = new Set(prev);
            const isAllSelected = moduleKeys.every(key => prev.has(key));

            if (isAllSelected) {
                moduleKeys.forEach(key => newSet.delete(key));
            } else {
                moduleKeys.forEach(key => newSet.add(key));
            }
            return newSet;
        });
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 bg-white rounded-xl shadow-lg min-h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="ml-3 text-lg text-gray-700">Đang tải dữ liệu Role và Permission...</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl space-y-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center border-b pb-3 mb-4">
                    <Settings className="w-7 h-7 mr-3 text-red-500" />
                    Quản lý Phân quyền
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                                <Users className="w-5 h-5 mr-2 text-blue-600" />
                                Danh sách Vai trò ({roles.length})
                            </h2>
                            {hasPermission(PERMISSIONS.STAFF_MANAGE_ROLES) && (
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-1.5 px-3 rounded-lg flex items-center transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Tạo mới
                                </button>
                            )}
                        </div>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {roles.map((role) => (
                                <div key={role.id} className="relative">
                                <button
                                    key={role.id}
                                    onClick={() => handleSelectRole(role)}
                                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 border 
                                        ${selectedRole?.id === role.id
                                        ? 'bg-blue-600 text-white shadow-md border-blue-700'
                                        : 'bg-white hover:bg-blue-50 text-gray-800 border-gray-300'
                                    }`}
                                >
                                    <p className="font-bold">{role.name}</p>
                                    <p className={`text-xs ${selectedRole?.id === role.id ? 'text-blue-200' : 'text-gray-500'}`}>
                                        {role.description}
                                    </p>
                                </button>
                                    {hasPermission(PERMISSIONS.STAFF_MANAGE_ROLES) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Ngăn chặn kích hoạt handleSelectRole
                                                setRoleToDelete(role);
                                            }}
                                            className={`absolute top-2 right-2 p-1 rounded-full 
                                                ${selectedRole?.id === role.id
                                                ? 'bg-red-500 hover:bg-red-700 text-white'
                                                : 'bg-gray-200 hover:bg-red-500 hover:text-white text-gray-600'
                                            } transition-colors`}
                                            title={`Xóa Role ${role.name}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cột 2 & 3: Chi tiết Permissions */}
                    <div className="lg:col-span-2">
                        {selectedRole ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b pb-3">
                                    <h2 className="text-2xl font-bold text-red-600 flex items-center">
                                        <Key className="w-6 h-6 mr-2" />
                                        Quyền hạn của Role: {selectedRole.name}
                                    </h2>
                                    {hasPermission(PERMISSIONS.STAFF_MANAGE_ROLES) && (
                                        <button
                                            onClick={handleSaveRole}
                                            disabled={isSaving}
                                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                                            {isSaving ? 'Đang lưu...' : 'Lưu Thay đổi'}
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-4">
                                    {Object.entries(allPermissions).map(([moduleKey, permissions]) => (
                                        <div key={moduleKey} className="border border-gray-300 rounded-lg p-4 shadow-sm">
                                            <div className="flex justify-between items-center mb-3 border-b pb-2">
                                                <h3 className="text-lg font-bold text-gray-700">{moduleKey} Module</h3>
                                                <button
                                                    onClick={() => handleSelectAllModule(permissions)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                                >
                                                    {permissions.every(p => currentPermissions.has(p.key)) ? 'Bỏ chọn Tất cả' : 'Chọn Tất cả'}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                                {permissions.map(p => (
                                                    <label key={p.key} className="flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={currentPermissions.has(p.key)}
                                                            onChange={() => handleTogglePermission(p.key)}
                                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition duration-150"
                                                        />
                                                        <span className="ml-3 text-sm text-gray-700">{p.desc}</span>
                                                        <code className="ml-2 text-xs text-gray-400 bg-gray-100 px-1 rounded">
                                                            {p.action}
                                                        </code>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <p>Vui lòng chọn một Vai trò để xem và chỉnh sửa quyền hạn.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CreateRoleModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                allPermissions={allPermissions}
                onCreateSuccess={handleRoleCreated}
                setToast={setToast}
            />
            <DeleteRoleModal
                isOpen={!!roleToDelete}
                onClose={() => setRoleToDelete(null)}
                role={roleToDelete}
                onDeleteSuccess={handleDeleteRole}
                setToast={setToast}
            />
            
            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
};

export default RoleManagementPage;