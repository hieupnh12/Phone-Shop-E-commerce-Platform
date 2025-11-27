import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Edit, Trash2, Home, Loader2 } from 'lucide-react';
import AddressForm from "../common/AddressForm";
import { customerService } from '../../services/api';

const AddressBook = () => {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState(null);
    const [defaultAddressId, setDefaultAddressId] = useState(null); // Lưu địa chỉ mặc định (địa chỉ đầu tiên)
    const [customerInfo, setCustomerInfo] = useState({
        fullName: '',
        phoneNumber: ''
    });

    // Load dữ liệu từ API
    useEffect(() => {
        loadCustomerInfo();
        loadAddresses();
    }, []);

    const loadCustomerInfo = async () => {
        try {
            const response = await customerService.getMyCustomerInfo();
            const customer = response?.result || response;
            setCustomerInfo({
                fullName: customer.fullName || '',
                phoneNumber: customer.phoneNumber || ''
            });
        } catch (error) {
            console.error("Lỗi khi tải thông tin khách hàng:", error);
        }
    };

    const loadAddresses = async () => {
        try {
            setIsLoading(true);
            const response = await customerService.getAddresses();
            const addressList = response?.result || response || [];
            setAddresses(addressList);
            // Đặt địa chỉ đầu tiên làm mặc định nếu chưa có
            if (addressList.length > 0 && !defaultAddressId) {
                setDefaultAddressId(addressList[0].addressBookId);
            }
        } catch (error) {
            console.error("Lỗi khi tải địa chỉ:", error);
            setAddresses([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAddress = async (formData, isEditMode) => {
        try {
            setIsLoading(true);
            console.log("Saving address:", formData, "isEditMode:", isEditMode);
            
            if (isEditMode) {
                // Cập nhật địa chỉ
                console.log("Updating address with ID:", addressToEdit.addressBookId);
                const result = await customerService.updateAddress(addressToEdit.addressBookId, formData);
                console.log("Update result:", result);
            } else {
                // Tạo địa chỉ mới
                console.log("Creating new address");
                const result = await customerService.addAddress(formData);
                console.log("Create result:", result);
            }
            
            console.log("Reloading addresses...");
            await loadAddresses();
            setShowForm(false);
            setAddressToEdit(null);
        } catch (error) {
            console.error("Lỗi khi lưu địa chỉ:", error);
            console.error("Error details:", error.response?.data || error.message);
            alert("Lỗi: Không thể lưu địa chỉ. " + (error.response?.data?.message || error.message || "Vui lòng thử lại."));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;

        const addressToDelete = addresses.find(a => a.addressBookId === id);
        
        // Không cho xóa địa chỉ mặc định nếu còn nhiều địa chỉ
        if (addressToDelete && defaultAddressId === id && addresses.length > 1) {
            alert("Lỗi: Vui lòng đặt một địa chỉ khác làm mặc định trước khi xóa địa chỉ mặc định hiện tại.");
            return;
        }

        try {
            setIsLoading(true);
            await customerService.deleteAddress(id);
            await loadAddresses();
            // Nếu xóa địa chỉ mặc định, đặt địa chỉ đầu tiên (nếu còn) làm mặc định
            if (defaultAddressId === id && addresses.length > 1) {
                const remaining = addresses.filter(a => a.addressBookId !== id);
                if (remaining.length > 0) {
                    setDefaultAddressId(remaining[0].addressBookId);
                }
            }
        } catch (error) {
            console.error("Lỗi khi xóa địa chỉ:", error);
            alert("Lỗi: Không thể xóa địa chỉ. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetDefault = (id) => {
        setDefaultAddressId(id);
    };

    const handleAddAddress = () => {
        setAddressToEdit(null);
        setShowForm(true);
    };

    const handleEditAddress = (address) => {
        setAddressToEdit(address);
        setShowForm(true);
    };

    // Render danh sách địa chỉ
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

        // Sắp xếp: địa chỉ mặc định lên đầu
        const sortedAddresses = [...addresses].sort((a, b) => {
            if (a.addressBookId === defaultAddressId) return -1;
            if (b.addressBookId === defaultAddressId) return 1;
            return 0;
        });

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedAddresses.map((addr) => {
                    const isDefault = addr.addressBookId === defaultAddressId;
                    return (
                        <div 
                            key={addr.addressBookId} 
                            className={`p-4 border rounded-lg transition-shadow ${
                                isDefault ? 'border-red-500 bg-red-50 shadow-md' : 'border-gray-200 hover:shadow-sm'
                            }`}
                        >
                            {/* Header với label và buttons */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    
                                    <button
                                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                                        disabled
                                    >
                                        <Home size={12} />
                                        Nhà
                                    </button>
                                    {isDefault && (
                                        <button
                                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                                            disabled
                                        >
                                            Mặc định
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Thông tin địa chỉ */}
                            <div className="text-sm text-gray-700 space-y-1 mb-3">
                                <p><span className="font-medium">Người nhận:</span> {customerInfo.fullName || 'N/A'}</p>
                                <p><span className="font-medium">SĐT:</span> {customerInfo.phoneNumber || 'N/A'}</p>
                                <p><span className="font-medium">Địa chỉ:</span> {addr.address || 'Chưa có'}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                                {!isDefault && (
                                    <button
                                        type="button"
                                        onClick={() => handleSetDefault(addr.addressBookId)}
                                        className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                                    >
                                        Đặt làm mặc định
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleEditAddress(addr)}
                                    className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                                >
                                    Cập nhật
                                </button>
                                {!(isDefault && addresses.length === 1) && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(addr.addressBookId)}
                                        className="text-xs text-red-500 hover:text-red-600 font-medium"
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
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
                    disabled={isLoading}
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
                    onClose={() => {
                        setShowForm(false);
                        setAddressToEdit(null);
                    }}
                    onSave={handleSaveAddress}
                />
            )}
        </div>
    );
};

export default AddressBook;
