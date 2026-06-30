import React, { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, User, RefreshCw, Smartphone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { nodeChatService } from "../../../services/nodeChatService";
import { usePermission, PERMISSIONS } from "../../../hooks/usePermission";
import { useAuthFullOptions } from "../../../contexts/AuthContext";
import Toast from "../../../components/common/Toast";
import Pagination from "../../../components/common/Pagination";

export default function MessageManagementPage() {
  const { user } = useAuthFullOptions();
  const { hasPermission } = usePermission();
  const canViewAll = hasPermission(PERMISSIONS.MESSAGE_VIEW_ALL);
  const canReply = hasPermission(PERMISSIONS.MESSAGE_REPLY_BASIC);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(15);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);

  const canAccess = canViewAll || canReply;
  const canReplyToConversation = canAccess && !!detail;

  const { data: listData, isLoading, refetch: refetchList } = useQuery({
    queryKey: ["app-chat-threads", currentPage, pageSize, user?.id],
    queryFn: () => nodeChatService.getConversations(currentPage, pageSize, user),
    staleTime: 0,
    refetchInterval: 5000,
    enabled: canAccess && !!user,
  });

  const conversations = listData?.content || [];
  const totalPages = listData?.totalPages || 0;

  const loadDetail = async (threadId) => {
    try {
      const data = await nodeChatService.getConversationDetail(threadId, user);
      setDetail(data);
      setSelectedId(threadId);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.message?.includes("Network Error")
          ? "Không kết nối được API app (Node). Kiểm tra REACT_APP_MOBILE_API_URL_LOCAL"
          : "Không thể tải chi tiết hội thoại");
      setToast({ type: "error", message: msg });
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
      await nodeChatService.sendMessage(selectedId, replyText.trim(), user);
      setReplyText("");
      await loadDetail(selectedId);
      refetchList();
      setToast({ type: "success", message: "Đã gửi phản hồi — khách sẽ thấy trên app" });
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Gửi tin nhắn thất bại",
      });
    } finally {
      setSending(false);
    }
  };

  if (!canAccess) {
    return (
      <div className="p-6 text-gray-600">
        Bạn không có quyền xem tin nhắn khách hàng từ app.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="text-indigo-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tin nhắn (App)</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Smartphone size={14} />
            Đồng bộ với chat khách hàng trên app Sumaatophon — realtime qua Node API
          </p>
        </div>
        <button
          onClick={() => {
            refetchList();
            if (selectedId) loadDetail(selectedId);
          }}
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
              <p className="p-4 text-gray-500">Chưa có tin nhắn từ app</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.conversationId}
                  onClick={() => loadDetail(conv.conversationId)}
                  className={`w-full text-left p-4 border-b hover:bg-indigo-50 transition ${
                    selectedId === conv.conversationId
                      ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                      : ""
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
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      App chat
                    </span>
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
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-800">{detail.subject}</h2>
                <p className="text-sm text-gray-500">
                  {detail.customerName} · {detail.customerEmail || detail.customerPhone || "—"}
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  Mọi nhân viên có quyền đều có thể phản hồi — khách nhận tin trên app ngay lập tức
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {(detail.messages || []).map((msg) => (
                  <div
                    key={msg.messageId}
                    className={`flex ${
                      msg.senderType === "EMPLOYEE" ? "justify-end" : "justify-start"
                    }`}
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
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt=""
                          className="mt-2 max-h-40 rounded-lg object-cover"
                        />
                      )}
                      <p className="text-xs opacity-60 mt-1">
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleString("vi-VN")
                          : ""}
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
                    placeholder="Nhập phản hồi cho khách hàng trên app..."
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
            </>
          )}
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
