import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // <--- Үсэрч ирсэн датаг барьж авна
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [isEditingChats, setIsEditingChats] = useState(false); // <--- Устгах горим

  const messagesEndRef = useRef(null);

  // Хуудас руу үсэрч орж ирэх үед автоматаар хүн сонгох
  useEffect(() => {
    if (location.state?.autoSelectUser) {
      const userToSelect = location.state.autoSelectUser;
      setSelectedUser(userToSelect);

      // Хэрвээ чатын жагсаалтад байхгүй бол шууд нэмж харуулах
      setConversations((prev) => {
        if (!prev.find((u) => u.id === userToSelect.id)) {
          return [userToSelect, ...prev];
        }
        return prev;
      });

      // Дахин Refresh хийхэд гацахгүйн тулд state-ийг цэвэрлэх
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchConversations = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/chat/conversations",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setConversations(res.data);
    } catch (error) {}
  };

  const fetchMessages = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/chat/messages/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessages(res.data);
    } catch (error) {}
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
      const interval = setInterval(() => {
        fetchMessages(selectedUser.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/chat/send",
        { receiver_id: selectedUser.id, message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMessages([...messages, res.data]);
      setNewMessage("");
      fetchConversations();
    } catch (error) {
      toast.error("Мессеж илгээхэд алдаа гарлаа");
    }
  };

  // === ЧАТ УСТГАХ ===
  const handleDeleteChat = async (userId, e) => {
    e.stopPropagation(); // Дээшээ click дамжихыг зогсоох
    if (!window.confirm("Энэ хүнтэй хийсэн чатыг бүр мөсөн устгах уу?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/chat/conversations/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setConversations((prev) => prev.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
      toast.success("Чат устгагдлаа");
    } catch (err) {
      toast.error("Устгахад алдаа гарлаа");
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 flex overflow-hidden border-t border-gray-200 dark:border-gray-800">
      {/* ЗҮҮН ТАЛ: ЧАТЫН ЖАГСААЛТ */}
      <aside className="w-24 md:w-80 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark overflow-hidden shrink-0 transition-all">
        <div className="p-4 space-y-4 hidden md:block border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Чатууд
            </h2>

            {/* === ЗАСАХ / УСТГАХ ГАРГАЖ ИРЭХ ТОВЧ === */}
            <button
              onClick={() => setIsEditingChats(!isEditingChats)}
              className={`p-2 rounded-full transition-colors ${isEditingChats ? "text-red-500 bg-red-50 dark:bg-red-500/10" : "text-slate-400 hover:text-primary hover:bg-primary/10"}`}
              title="Чатуудыг засах"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isEditingChats ? "close" : "edit_square"}
              </span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {conversations.length === 0 ? (
            <p className="text-center text-xs text-gray-400 mt-4">
              Одоогоор чат байхгүй байна.
            </p>
          ) : (
            conversations.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedUser(user);
                  setShowInfo(false);
                  user.unread_count = 0;
                }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  selectedUser?.id === user.id
                    ? "bg-primary/10 dark:bg-primary/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="relative shrink-0">
                  <div
                    className="h-12 w-12 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-700"
                    style={{
                      backgroundImage: `url('${user.avatar || "https://via.placeholder.com/100?text=User"}')`,
                    }}
                  ></div>
                </div>
                <div className="flex-1 min-w-0 hidden md:flex items-center justify-between">
                  <h3
                    className={`text-sm truncate ${user.unread_count > 0 || selectedUser?.id === user.id ? "font-bold text-primary" : "font-semibold text-slate-700 dark:text-slate-200"}`}
                  >
                    {user.name || "Хэрэглэгч"}
                  </h3>

                  {/* === УСТГАХ ТОВЧ (EDIT МОД ҮЕД) === */}
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
                            src={msg.product.img}
                            alt={msg.product.title}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-100 dark:border-slate-700"
                          />
                          <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="text-[10px] text-slate-500 truncate uppercase tracking-wider">
                              {msg.product.category_name}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                              {msg.product.title}
                            </span>
                            <span className="text-primary font-bold text-xs">
                              {msg.product.price}
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
