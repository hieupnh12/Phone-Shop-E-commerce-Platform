import React, { useEffect, useState } from "react";
import {
  Mail,
  FileText,
  Calendar,
  FileSpreadsheet,
  Settings2,
  Send,
  Upload,
  UploadIcon,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import statisticApi from "../../../../../services/statisticService";
import Loading from "../../../../../components/common/Loading";
import Toast from "../../../../../components/common/Toast";
import Modal from "../../../../../components/common/Modal";

export default function Settings() {
  const queryClient = useQueryClient();

  const [recipients, setRecipients] = useState("");
  const [reportType, setReportType] = useState("WEEKLY");
  const [sendTime, setSendTime] = useState("08:00");
  const [enabled, setEnabled] = useState(true);

  const [contentType, setContentType] = useState("full");
  const [fileFormat, setFileFormat] = useState("excel");
  const [toast, setToast] = useState(null);
  const [open, setOpen] = useState(false);
  // ---- GET SETTING ----
  const {
    data: dataCard,
    isLoadingCard,
    errorCard,
  } = useQuery({
    queryKey: ["setting", 7],
    queryFn: async () => {
      const res = await statisticApi.getSetting();
      return res ?? {}; // <-- FIX
    },
    staleTime: 0,
  });

  // ---- SET STATE FROM BE ----
  useEffect(() => {
    if (dataCard) {
      setRecipients(dataCard.recipients?.join(", ") || "");
      setReportType(dataCard.reportType || "WEEKLY");
      setSendTime(dataCard.sendTime || "08:00");
      setEnabled(dataCard.enabled ?? true);
    }
  }, [dataCard]);

  // ---- MUTATION: GỬI NGAY ----
  const { mutate: sendNow, isLoading: sending } = useMutation({
    mutationFn: async () => await statisticApi.sendMailNow(),
    onSuccess: () => {
      setToast({
        message: "Đã gửi báo cáo ngay lập tức!",
        type: "success",
      });
    },
    onError: () => {
      setToast({
        message: "Gửi thất bại!",
        type: "error",
      });
    },
  });

  // ---- MUTATION: CẬP NHẬT SETTING ----
  const { mutate: updateSetting, isLoading: sending2 } = useMutation({
    mutationFn: async (payload) => await statisticApi.postSetting(payload),
    onSuccess: () => {
      setToast({
        message: "Cập nhật thành công!",
        type: "success",
      });
      queryClient.invalidateQueries(["setting", 7]); // <-- FIX
    },
    onError: () => {
      setToast({
        message: "Cập nhật thất bại!",
        type: "error",
      });
    },
  });

  // ---- HANDLE SUBMIT ----
  const handleSubmit = () => {
    const payload = {
      recipients: recipients
        ?.split(",")
        .map((e) => e.trim())
        .filter((e) => e),

      reportType,
      sendTime,
      enabled,
    };

    updateSetting(payload);
  };
  if (isLoadingCard) {
    return <Loading type="spinner" />;
  }
  if (errorCard) {
    return <Loading message={errorCard} type="spinner" />;
  }

  return (
    <div className="flex items-center justify-center">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Cập nhật"
        footer={
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-green-600 rounded-lg"
          >
            Lưu
          </button>
        }
      >
        <div className="space-y-3">
          <input
            className="border p-2 rounded w-full"
            placeholder="Tên sản phẩm"
          />
          <input className="border p-2 rounded w-full" placeholder="Giá" />
        </div>
      </Modal>

      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-2xl shadow-lg">
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-medium text-2xl">
              <Settings2 className="w-5 h-5 text-blue-500" />
              Report Settings
            </label>
            <p className="text-gray-600">
              Cấu hình báo cáo doanh thu điện thoại
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={sending2}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-cyan-500 border border-gray-600 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm text-white"
            >
              <UploadIcon size={18} />
              {sending2 ? "Đang gửi..." : "Cập nhật"}
            </button>
            <button
              onClick={() => sendNow()}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
            >
              <Send size={18} />
              Gửi báo cáo
            </button>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 grid gap-6 md:grid-cols-2">
          {/* Email Recipients */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <Mail className="w-5 h-5 text-blue-500" />
              Người nhận
            </label>
            <input
              type="text"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="admin@example.com, manager@example.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors bg-white/50"
            />
          </div>

          {/* Content Type */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <FileText className="w-5 h-5 text-teal-500" />
              Nội dung gửi
            </label>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setContentType("full")}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  contentType === "full"
                    ? "border-blue-400 bg-blue-50 shadow-md"
                    : "border-gray-200 bg-white/50 hover:border-gray-300"
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold text-gray-800">
                    Toàn bộ báo cáo
                  </div>
                  <div className="text-sm text-gray-600">Summary + Bảng</div>
                </div>
              </button>
            </div>
          </div>

          {/* File Format */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <FileSpreadsheet className="w-5 h-5 text-green-500" />
              Định dạng file
            </label>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setFileFormat("excel")}
                className={`flex-1 p-3 rounded-xl border-2 transition-all font-medium ${
                  fileFormat === "excel"
                    ? "border-teal-400 bg-teal-50 text-teal-700 shadow-md"
                    : "border-gray-200 bg-white/50 text-gray-700 hover:border-gray-300"
                }`}
              >
                EXCEL
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <Calendar className="w-5 h-5 text-orange-500" />
              Khoảng thời gian báo cáo {reportType}
            </label>

            {/* Toggle Enabled */}
            <div
              onClick={() => setEnabled(!enabled)}
              className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-all ${
                enabled ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-all ${
                  enabled ? "translate-x-7" : ""
                }`}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
