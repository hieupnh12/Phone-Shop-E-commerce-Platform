import React, { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, User, UserCheck, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supportMessageService } from "../../../services/api";
import { usePermission, PERMISSIONS } from "../../../hooks/usePermission";
import { useAuthFullOptions } from "../../../contexts/AuthContext";
import Toast from "../../../components/common/Toast";
import Pagination from "../../../components/common/Pagination";

const STATUS_LABELS = {
  OPEN: "Chờ xử lý",
  ASSIGNED: "Đã giao",
  RESOLVED: "Đã trả lời",
  CLOSED: "Đã đóng",
};

const STATUS_COLORS = {
  OPEN: "bg-yellow-100 text-yellow-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-600",
};

export default function MessageManagementPage() {
  const { user } = useAuthFullOptions();
  const currentEmployeeId = user?.id || null;
  const { hasPermission } = usePermission();
  const canViewAll = hasPermission(PERMISSIONS.MESSAGE_VIEW_ALL);
  const canReply = hasPermission(PERMISSIONS.MESSAGE_REPLY_BASIC);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(15);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);

  const { data: listData, isLoading, refetch: refetchList } = useQuery({
    queryKey: ["support-conversations", currentPage, pageSize],
    queryFn: () => supportMessageService.getConversations(currentPage, pageSize),
    staleTime: 0,
    refetchInterval: 5000,
    enabled: canViewAll || canReply,
  });

  const conversations = listData?.content || [];
  const totalPages = listData?.totalPages || 0;

  const isAssignedToMe = detail?.employeeId != null && detail.employeeId === currentEmployeeId;
  const canClaim =
    detail?.status === "OPEN" &&
    !detail?.employeeId &&
    canReply &&
    !canViewAll;
  const canReplyToConversation =
    detail?.status !== "CLOSED" &&
    canReply &&
    !canViewAll &&
    isAssignedToMe;
  const canClose =
    detail?.status !== "CLOSED" &&
    (canViewAll || (canReply && isAssignedToMe));

  const loadDetail = async (conversationId) => {
    try {
      const data = await supportMessageService.getConversationDetail(conversationId);
      setDetail(data);
      setSelectedId(conversationId);
    } catch (err) {
      setToast({ type: "error", message: "Không thể tải chi tiết hội thoại" });
    }
  };

  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      loadDetail(conversations[0].conversationId);
    }
  }, [conversations, selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedId || !canReplyToConversation) return;
    setSending(true);
    try {
      await supportMessageService.sendMessage(selectedId, replyText.trim());
      setReplyText("");
      await loadDetail(selectedId);
      refetchList();
      setToast({ type: "success", message: "Đã gửi phản hồi" });
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Gửi tin nhắn thất bại",
      });
    } finally {
      setSending(false);
    }
  };

  const handleClaim = async () => {
    if (!selectedId || !canClaim) return;
    setClaiming(true);
    try {
      await supportMessageService.claimConversation(selectedId);
      await loadDetail(selectedId);
      refetchList();
      setToast({ type: "success", message: "Đã nhận xử lý — bạn có thể phản hồi khách hàng" });
    } catch (err) {
      const msg = err.response?.data?.message;
      setToast({
        type: "error",
        message: msg || "Không thể nhận xử lý. Có thể nhân viên khác đã nhận trước.",
      });
      refetchList();
      if (selectedId) loadDetail(selectedId);
    } finally {
      setClaiming(false);
    }
  };

  const handleClose = async () => {
    if (!selectedId || !canClose) return;
    try {
      await supportMessageService.updateConversation(selectedId, { status: "CLOSED" });
      await loadDetail(selectedId);
      refetchList();
      setToast({ type: "success", message: "Đã đóng cuộc hội thoại" });
    } catch (err) {
      setToast({ type: "error", message: "Không thể đóng hội thoại" });
    }
  };

  const assignmentHint = () => {
    if (!detail) return null;
    if (detail.status === "OPEN" && !detail.employeeId) {
      return canViewAll
        ? "Tin nhắn đang chờ nhân viên tự nhận xử lý"
        : "Bấm Nhận xử lý để nhận cuộc hội thoại này (mỗi tin chỉ một nhân viên xử lý)";
    }
    if (detail.employeeName) {
      return `Đang xử lý bởi: ${detail.employeeName}`;
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="text-indigo-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tin nhắn khách hàng</h1>
          <p className="text-sm text-gray-500">
            {canViewAll
              ? "Admin: theo dõi tin nhắn — nhân viên tự nhận và xử lý"
              : "Nhân viên: nhận tin chờ xử lý và phản hồi khách hàng"}
          </p>
        </div>
        <button
          onClick={() => { refetchList(); if (selectedId) loadDetail(selectedId); }}
          className="ml-auto flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        <div className="lg:col-span-1 bg-white rounded-xl shadow border overflow-hidden flex flex-col">
          <div className="p-4 border-b font-semibold text-gray-700">
            Danh sách ({listData?.totalElements || 0})
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <p className="p-4 text-gray-500">Đang tải...</p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-gray-500">Chưa có tin nhắn nào</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.conversationId}
                  onClick={() => loadDetail(conv.conversationId)}
                  className={`w-full text-left p-4 border-b hover:bg-indigo-50 transition ${
                    selectedId === conv.conversationId ? "bg-indigo-50 border-l-4 border-l-indigo-600" : ""
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-medium text-gray-800 truncate">{conv.subject}</p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <User size={14} /> {conv.customerName}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 truncate">{conv.lastMessage}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[conv.status]}`}>
                      {STATUS_LABELS[conv.status] || conv.status}
                    </span>
                    {conv.employeeName && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <UserCheck size={12} /> {conv.employeeName}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="p-2 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow border flex flex-col overflow-hidden">
          {!detail ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Chọn một cuộc hội thoại để xem tin nhắn
            </div>
          ) : (
            <>
              <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-gray-800">{detail.subject}</h2>
                  <p className="text-sm text-gray-500">
                    {detail.customerName} · {detail.customerEmail || detail.customerPhone}
                  </p>
                  {assignmentHint() && (
                    <p className="text-xs text-indigo-600 mt-1">{assignmentHint()}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {canClaim && (
                    <button
                      onClick={handleClaim}
                      disabled={claiming}
                      className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {claiming ? "Đang nhận..." : "Nhận xử lý"}
                    </button>
                  )}
                  {canClose && (
                    <button
                      onClick={handleClose}
                      className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Đóng
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {(detail.messages || []).map((msg) => (
                  <div
                    key={msg.messageId}
                    className={`flex ${msg.senderType === "EMPLOYEE" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                        msg.senderType === "EMPLOYEE"
                          ? "bg-indigo-600 text-white rounded-tr-sm"
                          : "bg-white border text-gray-800 rounded-tl-sm"
                      }`}
                    >
                      <p className="text-xs opacity-70 mb-1">{msg.senderName}</p>
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(msg.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {canReplyToConversation && (
                <div className="p-4 border-t flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                    placeholder="Nhập phản hồi cho khách hàng..."
                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={sending || !replyText.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send size={18} /> Gửi
                  </button>
                </div>
              )}

              {!canReplyToConversation && detail.status !== "CLOSED" && canReply && !canViewAll && detail.employeeId && !isAssignedToMe && (
                <div className="p-4 border-t bg-amber-50 text-amber-800 text-sm text-center">
                  Cuộc hội thoại đã được nhân viên khác nhận xử lý
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
