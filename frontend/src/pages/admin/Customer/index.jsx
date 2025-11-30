import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Download,
  Settings2Icon,
  Ampersand,
  Search,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import customerService from "../../../services/customerService";
import CustomerTable from "./CustomerTable";
import CustomerModal from "./CreateUpdate";
import Toast from "../../../components/common/Toast";
import useDebounce from "../../../contexts/useDebounce";

// Import your customerService
// import customerService from './services/customerService';

const Customers = () => {
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(8);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const debouncedSearch = useDebounce(keyword, 500); // 500ms

  const {
    data: mockResponse = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["customers", debouncedSearch, currentPage, pageSize],
    queryFn: async () => {
      const res = await customerService.getAllInfo(
        debouncedSearch,
        currentPage,
        pageSize
      );
      return res?.result || res || [];
    },
    staleTime: 0,
  });
  console.log("query", mockResponse);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    if (!dateString)
      return <span className="text-gray-400 italic">Chưa cập nhật</span>;
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString)
      return <span className="text-gray-400 italic">Chưa cập nhật</span>;
    const date = new Date(dateTimeString);
    return date.toLocaleString("vi-VN");
  };


  const getDisplayValue = (value, defaultText = "Chưa cập nhật") => {
    return value || <span className="text-gray-400 italic">{defaultText}</span>;
  };

  const openCreate = () => {
    setSelectedCustomer(null);
    setShowModal(true);
  };

  const openEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="min-h-screen">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-2xl shadow-lg">
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium text-2xl">
                <Ampersand className="w-5 h-5 text-blue-500" />
                Khách hàng
              </label>
            </div>
            <div className="flex gap-3">

              <button
              onClick={openCreate}
               className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm">
                <Download size={18} />
                Tạo khách hàng
              </button>
            </div>
          </div>
        </div>
        {/* Error Message */}
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{isError}</span>
          </div>
        )}

        {/* Customer List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {mockResponse?.empty === true ? (
            <div className="text-center py-12 text-gray-500">
              <User size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Không tìm thấy khách hàng nào</p>
            </div>
          ) : (
            <CustomerTable
              mockResponse={mockResponse}
              goToPage={goToPage}
              isLoading={isLoading}
              refetch={refetch}
              onEdit={openEdit}
              keyword={keyword}
              setKeyword={setKeyword}
            />
          )}
        </div>

        {showModal && (
        <CustomerModal
          onClose={closeModal}
          data={selectedCustomer}
          setToast={setToast}
        />
      )}
      </div>
    </div>
  );
};

export default Customers;
