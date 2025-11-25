import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Edit, Trash2, CheckCircle, Loader2 } from 'lucide-react';

import AddressForm from "../common/AddressForm";

const STORAGE_KEY = 'customer_addresses';

const getLocalAddresses = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Lỗi khi đọc LocalStorage:", e);
        return [];
    }
};

const saveLocalAddresses = (addresses) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
    } catch (e) {
        console.error("Lỗi khi ghi LocalStorage:", e);
    }
};
// ------------------------------------------------

const AddressBook = () => {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState(null);

    // Load dữ liệu khi component được mount
    useEffect(() => {
        setIsLoading(true);
        // Mô phỏng việc tải dữ liệu chậm từ API (thực tế là LocalStorage)
        setTimeout(() => {
            setAddresses(getLocalAddresses());
            setIsLoading(false);
        }, 300);
    }, []);

    // --- Handlers & Local State Operations ---

    const handleSaveAddress = async (formData, isEditMode) => {
        setIsLoading(true);
        let updatedAddresses = [...addresses];

        // Xử lý isDefault (chỉ có một địa chỉ mặc định)
        if (formData.isDefault) {
            updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
        }

        if (isEditMode) {
            // Chế độ Sửa
            updatedAddresses = updatedAddresses.map(addr =>
                addr.id === formData.id ? { ...formData } : addr
            );
        } else {
            // Chế độ Thêm mới
            const newAddress = { ...formData, id: Date.now().toString() };
            updatedAddresses.push(newAddress);
        }

        // Đảm bảo luôn có ít nhất 1 địa chỉ mặc định nếu có địa chỉ
        if (updatedAddresses.length === 1 && updatedAddresses[0].id) {
            updatedAddresses[0].isDefault = true;
        }

        setAddresses(updatedAddresses);
        saveLocalAddresses(updatedAddresses);
        setIsLoading(false);
    };

    const handleDelete = (id) => {
        // Thay thế window.confirm bằng alert/custom modal
        if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;

        const addressToDelete = addresses.find(a => a.id === id);

        if (addressToDelete && addressToDelete.isDefault && addresses.length > 1) {
            alert("Lỗi: Vui lòng đặt một địa chỉ khác làm mặc định trước khi xóa địa chỉ mặc định hiện tại.");
            return;
        }

        let updatedAddresses = addresses.filter(addr => addr.id !== id);

        // Nếu địa chỉ mặc định bị xóa, đặt địa chỉ đầu tiên (nếu còn) làm mặc định mới
        if (addressToDelete && addressToDelete.isDefault && updatedAddresses.length > 0) {
            updatedAddresses[0].isDefault = true;
        }

        setAddresses(updatedAddresses);
        saveLocalAddresses(updatedAddresses);
    };

    const handleSetDefault = (id) => {
        const updatedAddresses = addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id ? true : false,
        }));

        setAddresses(updatedAddresses);
        saveLocalAddresses(updatedAddresses);
    };

    // Mở form Thêm mới
    const handleAddAddress = () => {
        setAddressToEdit(null);
        setShowForm(true);
    };

    // Mở form Sửa
    const handleEditAddress = (address) => {
        setAddressToEdit(address);
        setShowForm(true);
    };

    // --- Render Phần Địa chỉ ---
    const renderAddressList = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                    <Loader2 size={24} className="animate-spin text-red-500 mb-3" />
                    <p>Đang tải dữ liệu địa chỉ...</p>
                </div>
            );
        }

        if (addresses.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                    <img
                        src="https://via.placeholder.com/150/FFDDC1/FF6B6B?text=No+Address"
                        alt="No Address"
                        className="w-40 h-40 mb-4 object-contain"
                    />
                    <p>Bạn chưa có địa chỉ nào được tạo</p>
                </div>
            );
        }

        // Sắp xếp địa chỉ mặc định lên đầu
        const sortedAddresses = [...addresses].sort((a, b) => (b.isDefault ? 1 : a.isDefault ? -1 : 0));

        return (
            <div className="space-y-4">
                {sortedAddresses.map((addr) => (
                    <div key={addr.id} className={`p-4 border rounded-lg transition-shadow ${addr.isDefault ? 'border-red-500 bg-red-50 shadow-md' : 'border-gray-200 hover:shadow-sm'}`}>

                        <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-2 text-gray-800 font-semibold mb-2">
                                <MapPin size={18} className="text-red-500" />
                                <span>Địa chỉ {addr.isDefault ? 'MẶC ĐỊNH' : ''}</span>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => handleEditAddress(addr)}
                                    className="text-blue-500 hover:text-blue-700 transition-colors"
                                >
                                    <Edit size={16} />
                                </button>

                                {!(addr.isDefault && addresses.length === 1) && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(addr.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="text-sm text-gray-700 space-y-1 border-t pt-3">
                            <p>Người nhận: <span className="font-medium">{addr.name}</span></p>
                            <p>SĐT: <span className="font-medium">{addr.phone}</span></p>
                            <p>Địa chỉ: {addr.street}, {addr.ward}, {addr.district}, {addr.city}</p>
                        </div>

                        {!addr.isDefault && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => handleSetDefault(addr.id)}
                                    className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center"
                                >
                                    <CheckCircle size={14} className="mr-1" />
                                    Đặt làm địa chỉ mặc định
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h3 className="text-xl font-bold text-gray-800">Sổ địa chỉ</h3>
                <button
                    onClick={handleAddAddress}
                    className="flex items-center text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                    disabled={isLoading} // Chỉ disabled trong thời gian tải data
                >
                    <Plus size={18} className="mr-2" />
                    Thêm địa chỉ
                </button>
            </div>

            {renderAddressList()}

            {/* Modal Form Thêm/Sửa */}
            {showForm && (
                <AddressForm
                    addressToEdit={addressToEdit}
                    onClose={() => {setShowForm(false); setAddressToEdit(null);}}
                    onSave={handleSaveAddress}
                />
            )}
        </div>
    );
};

export default AddressBook;