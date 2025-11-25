import React, { useEffect, useState } from "react";
import {
  Mail,
  FileText,
  Calendar,
  FileSpreadsheet,
  Settings2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import statisticApi from "../../../../../services/statisticService";

export default function Settings() {
  const queryClient = useQueryClient();

  const [recipients, setRecipients] = useState("");
  const [reportType, setReportType] = useState("WEEKLY");
  const [sendTime, setSendTime] = useState("08:00");
  const [enabled, setEnabled] = useState(true);

  const [contentType, setContentType] = useState("full");
  const [fileFormat, setFileFormat] = useState("excel");
  console.log(enabled);

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
      alert.success("Đã gửi báo cáo ngay lập tức!");
    },
    onError: () => {
      alert.error("Gửi thất bại!");
    },
  });

  // ---- MUTATION: CẬP NHẬT SETTING ----
  const { mutate: updateSetting, isLoading: sending2 } = useMutation({
    mutationFn: async (payload) => await statisticApi.postSetting(payload),
    onSuccess: () => {
      alert.success("Cập nhật thành công!");
      queryClient.invalidateQueries(["setting", 7]); // <-- FIX
    },
    onError: () => {
      alert.error("Cập nhật thất bại!");
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

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center md:text-left bg-white/80 rounded-2xl shadow-lg p-4">
          <label className="flex items-center gap-2 text-gray-700 font-medium text-2xl">
            <Settings2 className="w-5 h-5 text-blue-500" />
            Report Settings
          </label>
          <p className="text-gray-600">Cấu hình báo cáo doanh thu điện thoại</p>
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

            <div>
              {/* BUTTON GỬI NGAY */}
              <button
                onClick={() => sendNow()}
                disabled={sending}
                className="px-4 py-2 mr-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              >
                {sending ? "Đang gửi..." : "Gửi báo cáo ngay"}
              </button>

              {/* BUTTON CẬP NHẬT */}
              <button
                onClick={handleSubmit}
                disabled={sending2}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-blue-300"
              >
                {sending2 ? "Đang gửi..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
