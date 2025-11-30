import {
  Bot,
  ChevronDown,
  Maximize2,
  MessageCircle,
  Minimize2,
  Send,
  User,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import chatsApi, { sendMessage } from "../../services/chatBotService";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi có thể giúp gì cho bạn?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [page, setPage] = useState(1);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastScrollTop = useRef(0);
  const [isSending, setIsSending] = useState(false);
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Mock older messages để demo lazy loading
  const generateOlderMessages = (pageNum) => {
    const oldMessages = [];
    const startId = (pageNum - 1) * 5;
    for (let i = 5; i > 0; i--) {
      oldMessages.push({
        id: `old-${startId + i}`,
        text: `Đây là tin nhắn cũ số ${
          startId + i
        }. Nội dung mẫu để test lazy loading.`,
        sender: i % 2 === 0 ? "bot" : "user",
        timestamp: new Date(Date.now() - (pageNum * 5 + i) * 3600000),
      });
    }
    return oldMessages;
  };

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Xử lý scroll
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // Hiện nút scroll to bottom khi cuộn lên
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom && scrollTop > 100);

    // Load more khi scroll lên trên cùng
    if (scrollTop === 0 && !isLoadingOlder && hasMoreMessages) {
      loadOlderMessages();
    }

    lastScrollTop.current = scrollTop;
  }, [isLoadingOlder, hasMoreMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Auto scroll khi có tin nhắn mới
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === "user" || lastMessage.sender === "bot") {
        setTimeout(() => scrollToBottom(), 100);
      }
    }
  }, [messages, streamingText]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load older messages với lazy loading
  const loadOlderMessages = async () => {
    setIsLoadingOlder(true);
    const container = messagesContainerRef.current;
    const previousScrollHeight = container?.scrollHeight || 0;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const olderMessages = generateOlderMessages(page);

    if (page >= 3) {
      // Giới hạn 3 trang để demo
      setHasMoreMessages(false);
    }

    setMessages((prev) => [...olderMessages, ...prev]);
    setPage((prev) => prev + 1);
    setIsLoadingOlder(false);

    // Giữ vị trí scroll sau khi load
    setTimeout(() => {
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - previousScrollHeight;
      }
    }, 0);
  };

  // Stream text từ từ
  const streamText = async (text, callback) => {
    setIsTyping(true);
    let currentText = "";

    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      setStreamingText(currentText);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    setStreamingText("");
    setIsTyping(false);
    callback(text);
  };

  const handleSend = async () => {
    if ((!input.trim() && !file) || isTyping) return;

    const userText = input.trim();
    setInput("");
    setIsSending(true);

    // Tạo message người dùng
    const userMessage = {
      id: `user-${Date.now()}`,
      text: userText,
      sender: "user",
      timestamp: new Date(),
      extra: { file, imageUrl: input.startsWith("http") ? input : null },
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      let response;

      if (file || (input.startsWith("http") && !userText)) {
        const formData = new FormData();
        formData.append("message", input);
        if (file) formData.append("file", file);

        response = await chatsApi.sendImage(formData);

        setInput("");
        setFile(null);
      } else {
        // Gọi API gửi text bình thường
        response = await chatsApi.sendMessage(userText);
      }

      const { answer, ySendChatBots, orders } = response;
      const botText = answer || "Cảm ơn bạn! Tôi đã nhận được tin nhắn.";

      streamText(botText, (fullText) => {
        const botMessage = {
          id: `bot-${Date.now()}`,
          text: fullText,
          sender: "bot",
          timestamp: new Date(),
          extra: { ySendChatBots, orders },
        };
        setMessages((prev) => [...prev, botMessage]);
      });
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
      const errorMsg = {
        id: `bot-${Date.now()}`,
        text: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
      setFile(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMaximized(false);
      setTimeout(() => scrollToBottom("auto"), 100);
    }
  };

  // Dán ảnh hoặc link
  const handlePaste = (e) => {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.kind === "file") {
        const blob = item.getAsFile();
        setFile(blob);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(blob);
      } else if (item.kind === "string") {
        item.getAsString((str) => {
          if (str.startsWith("http")) {
            setImageUrl(str);
            setImagePreview(str); // preview link
          }
        });
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImageUrl(null); // nếu chọn file, bỏ link

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="fixed bottom-20 right-6 z-50">
      {/* Chat Button - Icon nổi */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 active:scale-95 transition-all duration-300 group"
          style={{
            animation: "bounce 2s infinite",
          }}
        >
          <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`bg-white rounded-2xl shadow-2xl transition-all duration-500 ease-out ${
            isMaximized ? "fixed inset-4 w-auto h-auto" : "w-96 h-[600px]"
          }`}
          style={{
            animation: "slideInUp 0.4s ease-out",
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h2 className="font-bold text-lg">AI Assistant</h2>
                <p className="text-xs text-purple-100">Đang hoạt động</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                {isMaximized ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={toggleChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            className="overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white relative"
            style={{ height: "calc(100% - 140px)" }}
          >
            {/* Loading indicator ở đầu */}
            {isLoadingOlder && (
              <div className="flex justify-center py-4">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            )}

            {/* No more messages indicator */}
            {!hasMoreMessages && (
              <div className="text-center py-2">
                <p className="text-xs text-gray-400">
                  Đã hiển thị tất cả tin nhắn
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
                style={{
                  animation: `slideIn 0.3s ease-out both`,
                  opacity: 0,
                }}
              >
                <div
                  className={`flex gap-2 max-w-[80%] ${
                    message.sender === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === "user"
                        ? "bg-gradient-to-br from-purple-500 to-blue-500"
                        : "bg-gradient-to-br from-gray-200 to-gray-300"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-gray-700" />
                    )}
                  </div>
                  <div>
                    <div
                      className={`px-4 py-2 rounded-2xl shadow-sm ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-sm"
                          : "bg-white text-gray-800 rounded-tl-sm border border-gray-200"
                      }`}
                    >
                      {message.text}
                    </div>
                    {/* Nếu bot có Product */}
                    {message.sender === "bot" &&
                      message?.extra?.ySendChatBots && (
                        <div className="mt-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
                          <h4 className="font-semibold text-gray-700 mb-2">
                            Sản phẩm:
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {message?.extra?.ySendChatBots.map((p) => (
                              <a
                                key={p.idProduct}
                                href={`/user/products/${p.idProduct}`}
                                className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition block"
                              >
                                {/* Ảnh */}
                                <img
                                  src={p.image}
                                  alt={p.nameProduct}
                                  className="w-full h-24 object-cover"
                                />

                                {/* Tên */}
                                <div className="p-1 text-center text-sm font-medium text-gray-800">
                                  {p.nameProduct}
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Nếu bot có Order */}
                    {message.sender === "bot" && message.extra?.Order && (
                      <div className="mt-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
                        <h4 className="font-semibold text-gray-700">
                          Đơn hàng:
                        </h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {message.extra.Order.map((o) => (
                            <li key={o.id}>
                              #{o.id} - Tổng: {o.totalAmount}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div
                      className={`text-xs text-gray-400 mt-1 ${
                        message.sender === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming message */}
            {isTyping && streamingText && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex gap-2 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <Bot className="w-4 h-4 text-gray-700" />
                  </div>
                  <div>
                    <div className="px-4 py-2 rounded-2xl shadow-sm bg-white text-gray-800 rounded-tl-sm border border-gray-200">
                      {streamingText}
                      <span className="inline-block w-1 h-4 bg-purple-600 ml-1 animate-pulse"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Typing indicator */}
            {isTyping && !streamingText && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <Bot className="w-4 h-4 text-gray-700" />
                  </div>
                  <div className="px-4 py-2 rounded-2xl shadow-sm bg-white border border-gray-200">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
            {imagePreview && (
              <div className="flex items-center gap-2 mt-2 bg-gray-100 p-2 rounded-xl max-w-xs">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="h-20 w-20 object-cover rounded-lg"
                />
                <div className="flex-1 flex justify-between items-start">
                  <button
                    onClick={() => {
                      setFile(null);
                      setImageUrl(null);
                      setImagePreview(null);
                    }}
                    className="text-gray-500 hover:text-gray-800 font-bold px-2 py-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <button
              onClick={() => scrollToBottom()}
              className="absolute bottom-24 right-8 bg-white text-purple-600 p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-200 border border-purple-200"
              style={{
                animation: "fadeIn 0.3s ease-out",
              }}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          )}

          {/* Input Area */}

          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            {/* ✅ Chèn preview ảnh ở đây */}

            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer px-3 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                📎
              </label>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onPaste={handlePaste}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={isTyping || (!input.trim() && !file)} // nếu có file vẫn enable
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        /* Smooth scrollbar */
        div::-webkit-scrollbar {
          width: 6px;
        }

        div::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #3b82f6);
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7e22ce, #2563eb);
        }
      `}</style>
    </div>
  );
}
