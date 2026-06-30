import React, { useState, useEffect } from "react";
import customerService from "../../../services/customerService";
import { useQueryClient } from "@tanstack/react-query";

export default function CustomerModal({ onClose, data, setToast }) {
  const isEdit = Boolean(data);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    birthDate: "",
    gender: "",
    address: "",
  });

  useEffect(() => {
    if (isEdit) setForm(data);
  }, [data]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    // Validate fullName - bắt buộc
    if (!form.fullName || form.fullName.trim().length < 2) {
      setToast({
        message: "Họ và tên phải có ít nhất 2 ký tự",
        type: "error",
      });
      return false;
    }

    if (form.fullName.trim().length > 100) {
      setToast({
        message: "Họ và tên không được vượt quá 100 ký tự",
        type: "error",
      });
      return false;
    }

    // Validate email format nếu có
    if (form.email && form.email.trim()) {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(form.email.trim())) {
        setToast({
          message: "Email không hợp lệ",
          type: "error",
        });
        return false;
      }
    }

    // Validate birthDate nếu có
    if (form.birthDate) {
      const selectedDate = new Date(form.birthDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate >= today) {
        setToast({
          message: "Ngày sinh phải là ngày trong quá khứ",
          type: "error",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (isEdit) {
      try {
        // Chỉ gửi các field được phép update (không gửi phoneNumber)
        const updateData = {
          fullName: form.fullName.trim(),
          email: form.email ? form.email.trim() : null,
          birthDate: form.birthDate || null,
          gender: form.gender || null,
          address: form.address || null,
        };

        const res = await customerService.updateCustomer(data.customerId, updateData);
        if (res) {
          setToast({
            message: "Cập nhật thành công!",
            type: "success",
          });
          queryClient.invalidateQueries(["customers"]);
          onClose();
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Cập nhật thất bại";
        setToast({
          message: errorMessage,
          type: "error",
        });
      }
    } else {
      try {
        await customerService.createCustomer(form);
        setToast({
          message: "Tạo khách hàng thành công!",
          type: "success",
        });
        queryClient.invalidateQueries(["customers"]);
        onClose();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Tạo khách hàng thất bại";
        setToast({
          message: errorMessage,
          type: "error",
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[450px] animate-fadeIn">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? "Cập nhật khách hàng" : "Tạo khách hàng mới"}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Họ và tên (bắt buộc)"
              required
              maxLength={100}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="Số điện thoại (bắt buộc)"
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email (tùy chọn)"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày sinh
            </label>
            <input
              name="birthDate"
              type="date"
              value={form.birthDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giới tính
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Chọn giới tính</option>
              <option value="true">Nam</option>
              <option value="false">Nữ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Địa chỉ (tùy chọn)"
              rows={2}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg"
          >
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </div>
    </div>
  );
}
