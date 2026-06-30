import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Phone, Home, Clock, Send, Plus } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { supportMessageService } from "../../services/api";
import Toast from "../common/Toast";

const SupportPage = () => {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newContent, setNewContent] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);

  const loadConversations = async () => {
    try {
      const data = await supportMessageService.getMyConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id) => {
    try {
      const data = await supportMessageService.getConversationDetail(id);
      setDetail(data);
      setSelectedId(id);
    } catch {
      setToast({ type: "error", message: "Không thể tải tin nhắn" });
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages]);

  const handleCreate = async () => {
    if (!newSubject.trim() || !newContent.trim()) return;
    setSending(true);
    try {
      const created = await supportMessageService.createConversation({
        subject: newSubject.trim(),
        content: newContent.trim(),
      });
      setShowNewForm(false);
      setNewSubject("");
      setNewContent("");
      await loadConversations();
      if (created?.conversationId) {
        await loadDetail(created.conversationId);
      }
      setToast({ type: "success", message: "Đã gửi tin nhắn đến nhân viên hỗ trợ" });
    } catch {
      setToast({ type: "error", message: "Gửi tin nhắn thất bại. Vui lòng đăng nhập." });
    } finally {
      setSending(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedId) return;
    setSending(true);
    try {
      await supportMessageService.sendMessage(selectedId, replyText.trim());
      setReplyText("");
      await loadDetail(selectedId);
      await loadConversations();
    } catch {
      setToast({ type: "error", message: "Gửi tin nhắn thất bại" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-lg rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <MessageCircle size={24} className="text-red-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">{t("profile.support")}</h2>
          </div>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
          >
            <Plus size={16} /> Gửi tin nhắn mới
          </button>
        </div>

        {showNewForm && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Tiêu đề (VD: Hỏi về đơn hàng #123)"
              className="w-full border rounded-lg px-3 py-2"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Nội dung tin nhắn..."
              rows={3}
              className="w-full border rounded-lg px-3 py-2"
            />
            <button
              onClick={handleCreate}
              disabled={sending}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              Gửi đến nhân viên
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[360px]">
          <div className="md:col-span-1 border rounded-lg overflow-hidden">
            <div className="p-3 bg-gray-50 font-medium text-gray-700 border-b">Tin nhắn của bạn</div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <p className="p-3 text-gray-500 text-sm">Đang tải...</p>
              ) : conversations.length === 0 ? (
                <p className="p-3 text-gray-500 text-sm">Chưa có tin nhắn. Nhấn &quot;Gửi tin nhắn mới&quot; để liên hệ nhân viên.</p>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.conversationId}
                    onClick={() => loadDetail(conv.conversationId)}
                    className={`w-full text-left p-3 border-b hover:bg-gray-50 ${
                      selectedId === conv.conversationId ? "bg-red-50" : ""
                    }`}
                  >
                    <p className="font-medium text-sm text-gray-800 truncate">{conv.subject}</p>
                    <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                    {conv.employeeName && (
                      <p className="text-xs text-green-600 mt-1">NV: {conv.employeeName}</p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="md:col-span-2 border rounded-lg flex flex-col min-h-[360px]">
            {!detail ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Chọn cuộc hội thoại hoặc gửi tin nhắn mới
              </div>
            ) : (
              <>
                <div className="p-3 border-b bg-gray-50">
                  <p className="font-medium">{detail.subject}</p>
                  <p className="text-xs text-gray-500">
                    {detail.employeeName ? `Nhân viên: ${detail.employeeName}` : "Đang chờ nhân viên phản hồi"}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                  {(detail.messages || []).map((msg) => (
                    <div
                      key={msg.messageId}
                      className={`flex ${msg.senderType === "CUSTOMER" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                          msg.senderType === "CUSTOMER"
                            ? "bg-red-500 text-white"
                            : "bg-white border text-gray-800"
                        }`}
                      >
                        <p className="text-xs opacity-70">{msg.senderName}</p>
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                {detail.status !== "CLOSED" && (
                  <div className="p-3 border-t flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleReply()}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      onClick={handleReply}
                      disabled={sending}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 shadow-lg rounded-xl">
        <div className="space-y-6">
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4 text-lg">{t("profile.supportPage.contactInfo")}</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Phone size={20} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">{t("profile.supportPage.phone")}</p>
                  <p className="text-gray-700 text-lg font-semibold">0705432115</p>
                  <p className="text-sm text-gray-500 mt-1">{t("profile.supportPage.support24_7")}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Home size={20} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">{t("profile.supportPage.storeAddress")}</p>
                  <p className="text-gray-700">FShop, FPT City, Ngũ Hành Sơn, Đà Nẵng</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock size={20} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">{t("profile.supportPage.businessHours")}</p>
                  <p className="text-gray-700">{t("profile.supportPage.businessHoursDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SupportPage;
