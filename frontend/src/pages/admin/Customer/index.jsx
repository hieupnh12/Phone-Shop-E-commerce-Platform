import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Trash2, Edit, Plus, X } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([
    {
      customer_id: 1,
      full_name: "Nguyễn Văn An",
      phone_number: "0901234567",
      email: "nguyenvanan@gmail.com",
      birth_date: "1990-05-15",
      address: "123 Lê Lợi, Quận 1, TP.HCM",
      create_at: "2024-01-10",
      update_at: "2024-01-10"
    },
    {
      customer_id: 2,
      full_name: "Trần Thị Bình",
      phone_number: "0912345678",
      email: "tranthibinh@gmail.com",
      birth_date: "1985-08-22",
      address: "456 Nguyễn Huệ, Quận 1, TP.HCM",
      create_at: "2024-02-15",
      update_at: "2024-02-15"
    },
    {
      customer_id: 3,
      full_name: "Lê Hoàng Cường",
      phone_number: "0923456789",
      email: "lehoangcuong@gmail.com",
      birth_date: "1992-12-10",
      address: "789 Trần Hưng Đạo, Quận 5, TP.HCM",
      create_at: "2024-03-20",
      update_at: "2024-03-20"
    },
    {
      customer_id: 4,
      full_name: "Phạm Thị Dung",
      phone_number: "0934567890",
      email: "phamthidung@gmail.com",
      birth_date: "1988-03-18",
      address: "321 Hai Bà Trưng, Quận 3, TP.HCM",
      create_at: "2024-04-05",
      update_at: "2024-04-05"
    },
    {
      customer_id: 5,
      full_name: "Võ Minh Đức",
      phone_number: "0945678901",
      email: "vominhduc@gmail.com",
      birth_date: "1995-07-25",
      address: "654 Lý Thường Kiệt, Quận 10, TP.HCM",
      create_at: "2024-05-12",
      update_at: "2024-05-12"
    },
    {
      customer_id: 6,
      full_name: "Hoàng Thị Mai",
      phone_number: "0956789012",
      email: "hoangthimai@gmail.com",
      birth_date: "1991-11-08",
      address: "987 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM",
      create_at: "2024-06-18",
      update_at: "2024-06-18"
    },
    {
      customer_id: 7,
      full_name: "Đặng Văn Hùng",
      phone_number: "0967890123",
      email: "dangvanhung@gmail.com",
      birth_date: "1987-04-30",
      address: "246 Cách Mạng Tháng 8, Quận 3, TP.HCM",
      create_at: "2024-07-22",
      update_at: "2024-07-22"
    },
    {
      customer_id: 8,
      full_name: "Bùi Thị Lan",
      phone_number: "0978901234",
      email: "buithilan@gmail.com",
      birth_date: "1993-09-14",
      address: "135 Võ Văn Tần, Quận 3, TP.HCM",
      create_at: "2024-08-05",
      update_at: "2024-08-05"
    }
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    birth_date: '',
    address: ''
  });

  const openPanel = (customer, editing = false) => {
    setSelectedCustomer(customer);
    setIsEditing(editing);
    if (customer) {
      setFormData({
        full_name: customer.full_name,
        phone_number: customer.phone_number,
        email: customer.email,
        birth_date: customer.birth_date,
        address: customer.address
      });
    } else {
      setFormData({
        full_name: '',
        phone_number: '',
        email: '',
        birth_date: '',
        address: ''
      });
    }
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => {
      setSelectedCustomer(null);
      setIsEditing(false);
    }, 300);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    if (selectedCustomer) {
      // Update existing customer
      setCustomers(customers.map(c => 
        c.customer_id === selectedCustomer.customer_id 
          ? { ...c, ...formData, update_at: new Date().toISOString().split('T')[0] }
          : c
      ));
    } else {
      // Add new customer
      const newCustomer = {
        customer_id: Math.max(...customers.map(c => c.customer_id)) + 1,
        ...formData,
        create_at: new Date().toISOString().split('T')[0],
        update_at: new Date().toISOString().split('T')[0]
      };
      setCustomers([...customers, newCustomer]);
    }
    closePanel();
  };

  const handleDelete = (customerId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      setCustomers(customers.filter(c => c.customer_id !== customerId));
      if (selectedCustomer?.customer_id === customerId) {
        closePanel();
      }
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone_number.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">Khách hàng</h1>
              <button
                onClick={() => openPanel(null, true)}
                className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition"
              >
                <Plus size={20} />
                Thêm khách hàng
              </button>
            </div>
            
            {/* Search bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Customer Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên / ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số điện thoại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày sinh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Địa chỉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentCustomers.map((customer) => (
                  <tr
                    key={customer.customer_id}
                    className="hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => openPanel(customer, false)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {customer.full_name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-teal-600">
                            {customer.full_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            #{customer.customer_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.phone_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-teal-600">{customer.email}</div>
                      <div className="text-xs text-gray-500">
                        {customer.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(customer.birth_date).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {customer.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Hoạt động
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPanel(customer, true);
                          }}
                          className="text-gray-600 hover:text-teal-600 transition"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(customer.customer_id);
                          }}
                          className="text-gray-600 hover:text-red-600 transition"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredCustomers.length)} của {filteredCustomers.length} khách hàng
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevious}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={20} />
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`px-3 py-1 rounded transition ${
                        currentPage === pageNumber
                          ? 'bg-teal-500 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber} className="px-2">...</span>;
                }
                return null;
              })}

              <button
                onClick={goToNext}
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Panel Header */}
          <div className="p-6 border-b border-gray-200 bg-teal-500 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {isEditing ? (selectedCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới') : 'Chi tiết khách hàng'}
              </h2>
              <button
                onClick={closePanel}
                className="p-1 hover:bg-teal-600 rounded transition"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedCustomer && !isEditing ? (
              // View Mode
              <div className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                    {selectedCustomer.full_name.charAt(0)}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Họ và tên</label>
                  <p className="text-lg font-semibold text-gray-800">{selectedCustomer.full_name}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Số điện thoại</label>
                  <p className="text-lg text-gray-800">{selectedCustomer.phone_number}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="text-lg text-gray-800">{selectedCustomer.email}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Ngày sinh</label>
                  <p className="text-lg text-gray-800">
                    {new Date(selectedCustomer.birth_date).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Địa chỉ</label>
                  <p className="text-lg text-gray-800">{selectedCustomer.address}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-500">Ngày tạo</label>
                      <p className="text-gray-800">
                        {new Date(selectedCustomer.create_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-500">Cập nhật lần cuối</label>
                      <p className="text-gray-800">
                        {new Date(selectedCustomer.update_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-teal-500 text-white py-3 rounded hover:bg-teal-600 transition font-semibold"
                >
                  Chỉnh sửa thông tin
                </button>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Nhập địa chỉ"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-teal-500 text-white py-3 rounded hover:bg-teal-600 transition font-semibold"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => selectedCustomer ? setIsEditing(false) : closePanel()}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded hover:bg-gray-400 transition font-semibold"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300"
          onClick={closePanel}
        />
      )}
    </div>
  );
};

export default Customers;