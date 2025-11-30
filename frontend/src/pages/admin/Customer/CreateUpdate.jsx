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
  });

  useEffect(() => {
    if (isEdit) setForm(data);
  }, [data]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (isEdit) {
      try {
        const res = await customerService.updateCustomer(data.customerId, form);
        if (res) {
          setToast({
            message: "Cập nhật thành công!",
            type: "success",
          });
        }
      } catch (error) {
        setToast({
          message: `Cập nhật thất bại ${error}`,
          type: "error",
        });
      }
    } else {
      await customerService.createCustomer(form);
    }
    queryClient.invalidateQueries(["customers"]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[450px] animate-fadeIn">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? "Cập nhật khách hàng" : "Tạo khách hàng mới"}
        </h2>

        <div className="space-y-3">
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Họ và tên"
            className="w-full p-3 border rounded-lg"
          />

          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="Số điện thoại"
            className="w-full p-3 border rounded-lg"
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-3 border rounded-lg"
          />

          <input
            name="birthDate"
            type="date"
            value={form.birthDate}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Giới tính</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
          </select>
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
