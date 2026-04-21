import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [isEditingChats, setIsEditingChats] = useState(false);

  const messagesEndRef = useRef(null);

  // Сүүлийн мессеж рүү автоматаар гүйлгэх
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Хуудас руу үсэрч орж ирэх үед автоматаар хүн сонгох
  useEffect(() => {
    if (location.state?.autoSelectUser) {
      const userToSelect = location.state.autoSelectUser;
      setSelectedUser(userToSelect);

      setConversations((prev) => {
        if (!prev.find((u) => u.id === userToSelect.id)) {
          return [userToSelect, ...prev];
        }
        return prev;
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Чатын жагсаалт татах
  const fetchConversations = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await api.get("/chat/conversations");
      setConversations(res.data || []);
    } catch (error) {
      console.error("Чат татахад алдаа:", error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Сонгосон хүний мессежүүдийг татах
  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/messages/${selectedUser.id}`);
        setMessages(res.data || []);
      } catch (error) {
        console.error("Мессеж татахад алдаа:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  // Мессеж илгээх
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const res = await api.post("/chat/send", {
        receiver_id: selectedUser.id,
        message: newMessage,
      });
      setNewMessage("");
      // Шинэ мессежийг дэлгэцэнд шууд нэмж харуулах
      setMessages((prev) => [
        ...prev,
        res.data.message || {
          id: Date.now(),
          message: newMessage,
          sender_id: "me",
          created_at: new Date(),
        },
      ]);
      fetchConversations();
    } catch (error) {
      toast.error("Мессеж илгээхэд алдаа гарлаа");
    }
  };

  // === ЧАТ УСТГАХ ===
  const handleDeleteChat = async (userId, e) => {
    e.stopPropagation();
    if (!window.confirm("Энэ хүнтэй хийсэн чатыг бүр мөсөн устгах уу?")) return;

    try {
      await api.delete(`/chat/conversations/${userId}`);
      setConversations((prev) => prev.filter((c) => c.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
      toast.success("Чат устгагдлаа");
    } catch (error) {
      toast.error("Устгах үед алдаа гарлаа");
    }
  };

  // Цаг форматыг засах
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("mn-MN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* ЗҮҮН ТАЛ: ЧАТНЫ ЖАГСААЛТ */}
      <aside className="w-full md:w-80 lg:w-96 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark shrink-0 transition-all">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-surface-dark/50">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Зурвасууд
          </h2>
          <button
            onClick={() => setIsEditingChats(!isEditingChats)}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isEditingChats ? "done" : "edit"}
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center text-slate-500 py-10 text-sm">
              Одоогоор чат алга байна
            </div>
          ) : (
            conversations.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                  selectedUser?.id === user.id
                    ? "bg-primary/10 border-primary/20"
                    : "bg-white dark:bg-surface-dark border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="relative shrink-0">
                  <div
                    className="h-12 w-12 rounded-full bg-cover bg-center border border-slate-200 dark:border-slate-700"
                    style={{
                      backgroundImage: `url('${user.avatar || "https://via.placeholder.com/100?text=User"}')`,
                    }}
                  ></div>
                </div>
                <div className="flex-1 min-w-0 hidden md:flex items-center justify-between">
                  <h3
                    className={`text-sm truncate ${
                      user.unread_count > 0 || selectedUser?.id === user.id
                        ? "font-bold text-primary"
                        : "font-semibold text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {user.name || "Хэрэглэгч"}
                  </h3>

                  {isEditingChats ? (
                    <button
                      onClick={(e) => handleDeleteChat(user.id, e)}
                      className="text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 p-1.5 rounded-full transition-colors flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        delete
                      </span>
                    </button>
                  ) : (
                    user.unread_count > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-2">
                        {user.unread_count}
                      </span>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ГОЛ ХЭСЭГ: МЕССЕЖҮҮД */}
      <main className="flex-1 flex flex-col bg-slate-50 dark:bg-surface-dark/30 min-w-0 relative">
        {selectedUser ? (
          <>
            <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark px-6 shrink-0 shadow-sm z-10">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setShowInfo(!showInfo)}
              >
                <div className="relative">
                  <div
                    className="h-10 w-10 rounded-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${selectedUser.avatar || "https://via.placeholder.com/100?text=User"}')`,
                    }}
                  ></div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white leading-none">
                    {selectedUser.name || "Хэрэглэгч"}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2 rounded-full transition-colors ${showInfo ? "text-primary bg-primary/10" : "text-slate-400 hover:text-primary hover:bg-primary/10"}`}
              >
                <span className="material-symbols-outlined">info</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {messages.map((msg, index) => {
                const isMine = msg.sender_id !== selectedUser.id;

                return (
                  <div
                    key={msg.id || index}
                    className={`flex ${isMine ? "flex-row-reverse ml-auto" : ""} items-end gap-2 max-w-[85%] md:max-w-[70%] animate-in slide-in-from-bottom-2 duration-300`}
                  >
                    {!isMine && (
                      <div
                        className="h-8 w-8 rounded-full bg-cover bg-center shrink-0 hidden sm:block"
                        style={{
                          backgroundImage: `url('${selectedUser.avatar || "https://via.placeholder.com/100?text=User"}')`,
                        }}
                      ></div>
                    )}
                    <div className="flex flex-col gap-1">
                      {msg.product && (
                        <div
                          onClick={() =>
                            navigate(`/product-detail/${msg.product.id}`)
                          }
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 mb-1 flex items-center gap-3 w-64 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <img
                            src={
                              msg.product?.img ||
                              "https://via.placeholder.com/150"
                            }
                            alt={msg.product?.title || "Product"}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-100 dark:border-slate-700"
                          />
                          <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="text-[10px] text-slate-500 truncate uppercase tracking-wider">
                              {msg.product?.category_name || "Бараа"}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                              {msg.product?.title}
                            </span>
                            <span className="text-primary font-bold text-xs">
                              {msg.product?.price}
                            </span>
                          </div>
                        </div>
                      )}

                      <div
                        className={`${isMine ? "bg-primary text-white rounded-br-sm" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-sm"} p-3 rounded-2xl shadow-sm text-sm`}
                      >
                        <p className="leading-relaxed">{msg.message}</p>
                        <div
                          className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end text-white/70" : "justify-end text-slate-400"}`}
                        >
                          <span className="text-[10px]">
                            {formatTime(msg.created_at)}
                          </span>
                          {isMine && (
                            <span
                              className={`material-symbols-outlined text-[14px] ${msg.is_read ? "text-white" : "text-white/50"}`}
                            >
                              done_all
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 shrink-0 z-10">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 md:gap-3 bg-slate-100 dark:bg-background-dark rounded-full p-1.5 md:p-2 pr-2 md:pr-3 border border-transparent dark:border-slate-700"
              >
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 text-slate-900 dark:text-white placeholder:text-slate-400"
                  placeholder="Мессеж бичих..."
                  autoComplete="off"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="h-10 w-10 shrink-0 flex items-center justify-center bg-primary text-white rounded-full shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    send
                  </span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="h-24 w-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl">forum</span>
            </div>
            <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
              Мессеж илгээх хүнээ сонгоно уу
            </p>
          </div>
        )}
      </main>

      {/* БАРУУН ТАЛ: INFO */}
      {showInfo && selectedUser && (
        <aside className="w-64 flex flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark shrink-0 animate-in slide-in-from-right-4 duration-300 z-20">
          <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-800">
            <div
              className="h-20 w-20 rounded-full bg-cover bg-center mb-3 shadow-md"
              style={{
                backgroundImage: `url('${selectedUser.avatar || "https://via.placeholder.com/100?text=User"}')`,
              }}
            ></div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white text-center">
              {selectedUser.name}
            </h3>
          </div>
        </aside>
      )}
    </div>
  );
};

export default ChatPage;
