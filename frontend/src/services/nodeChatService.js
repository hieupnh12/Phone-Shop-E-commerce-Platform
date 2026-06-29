import axios from "axios";

const env = process.env.NODE_ENV;
const MOBILE_API_BASE_URL =
  !env || env === "development"
    ? (process.env.REACT_APP_MOBILE_API_URL_LOCAL || "http://localhost:3000")
    : (process.env.REACT_APP_MOBILE_API_URL || "/mobile");

const mobileApi = axios.create({
  baseURL: MOBILE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

function staffQueryParams(user) {
  return {
    role: "staff",
    accountType: "employee",
    userId: user?.id != null ? String(user.id) : "",
    userName: user?.fullName || user?.name || "Nhân viên",
    userEmail: user?.email || "",
  };
}

function mapThreadToConversation(thread) {
  const name = thread.userName || "Khách hàng";
  return {
    conversationId: thread.id,
    customerId: thread.customerId || thread.userId,
    customerName: name,
    customerEmail: thread.userEmail || "",
    customerPhone: thread.userPhone || "",
    subject: `Chat app — ${name}`,
    status: "ACTIVE",
    lastMessage: thread.lastMessage || "",
    lastMessageAt: thread.lastMessageAt || thread.updatedAt,
    unreadCount: Number(thread.unreadCount ?? 0),
    employeeId: null,
    employeeName: null,
    source: "app",
  };
}

function mapMessageToUi(msg, conversation) {
  const isStaff = msg.senderRole === "admin";
  return {
    messageId: msg.id,
    conversationId: msg.threadId,
    senderType: isStaff ? "EMPLOYEE" : "CUSTOMER",
    senderId: msg.senderId,
    senderName: isStaff ? "Nhân viên" : conversation?.customerName || "Khách hàng",
    content: msg.text,
    imageUrl: msg.imageUrl,
    createdAt: msg.createdAt,
  };
}

export const nodeChatService = {
  getConversations: async (page = 0, size = 20, user) => {
    const { data } = await mobileApi.get("/chat/threads", {
      params: staffQueryParams(user),
    });

    const threads = Array.isArray(data) ? data : [];
    const mapped = threads.map(mapThreadToConversation);
    const start = page * size;
    const content = mapped.slice(start, start + size);

    return {
      content,
      totalElements: mapped.length,
      totalPages: Math.max(1, Math.ceil(mapped.length / size)),
      number: page,
      size,
    };
  },

  getConversationDetail: async (threadId, user) => {
    const list = await nodeChatService.getConversations(0, 500, user);
    const conversation =
      list.content.find((c) => c.conversationId === threadId) ||
      mapThreadToConversation({
        id: threadId,
        userName: "Khách hàng",
        userEmail: "",
        userPhone: "",
      });

    const { data: messages } = await mobileApi.get(`/chat/threads/${threadId}/messages`, {
      params: { role: "staff" },
    });

    const messageList = Array.isArray(messages) ? messages : [];
    return {
      ...conversation,
      messages: messageList.map((m) => mapMessageToUi(m, conversation)),
    };
  },

  sendMessage: async (threadId, content, user) => {
    const { data } = await mobileApi.post(
      `/chat/threads/${threadId}/messages`,
      {
        text: content,
        staffId: user?.id != null ? String(user.id) : "",
        staffName: user?.fullName || user?.name || "Nhân viên",
      },
      { params: staffQueryParams(user) }
    );
    return data;
  },
};

export default nodeChatService;
