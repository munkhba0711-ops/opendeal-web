import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import WishlistPage from "../pages/WishlistPage";
import CartPage from "../pages/CartPage";
import { useAppContext } from "../context/AppContext";

const MainHeader = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // ПРОФАЙЛ ЦЭСНИЙ STATE БОЛОН REF
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);

  // === ГОМДОЛЫН STATE ===
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState({ email: "", reason: "" });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    const token = localStorage.getItem("token");
    try {
      const res = await api.post("/reports", reportData);
      toast.success(res.data.message);
      setIsReportModalOpen(false);
      setReportData({ email: "", reason: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Алдаа гарлаа.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const notifRef = useRef(null);

  // === ХАЙЛТЫН STATE-ҮҮД ===
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const { cart, favorites, animateCart, animateFav } = useAppContext();
  const navigate = useNavigate();

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // Системээс гарах функц
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload(); // Хуудсыг дахин ачаалж цэвэрлэх
  };

  useEffect(() => {
    if (user) {
      const fetchCounts = async () => {
        const token = localStorage.getItem("token");
        // ШИНЭ НЭМСЭН ХАМГААЛАЛТ: Token байхгүй буюу нэвтрээгүй үед бааз руу хандаж 401 алдаа гаргахгүй
        if (!token) return;

        try {
          const resNotif = await api.get("/notifications");
          setNotifications(resNotif.data || []);

          const resChat = await api.get("/chat/unread-count");
          setUnreadChatCount(resChat.data?.unread || 0);
        } catch (error) {
          console.error("Мэдээлэл шалгахад алдаа гарлаа:", error);
        }
      };
      fetchCounts();
      const interval = setInterval(fetchCounts, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Гадна дарахад хаагдах тохиргоо (Мэдэгдэл, Хайлт, Профайл цэс)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target))
        setShowNotifications(false);
      if (searchRef.current && !searchRef.current.contains(event.target))
        setShowSuggestions(false);
      if (profileRef.current && !profileRef.current.contains(event.target))
        setShowProfileDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("color-theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("color-theme", "dark");
      setIsDarkMode(true);
    }
  };

  const handleProfileClick = () => {
    // Хэрэв админ бол шууд Админ хуудас руу үсэрнэ
    if (user && user.role === "admin") {
      navigate("/admin");
    } else {
      // Энгийн хэрэглэгч болон нэвтрээгүй хүмүүст цэс дэлгэнэ
      setShowProfileDropdown(!showProfileDropdown);
    }
  };

  const handleNotificationClick = (notif) => {
    setShowNotifications(false);
    if (notif.type === "sent")
      navigate("/profile", { state: { targetTab: "requests" } });
    else if (notif.type === "received")
      navigate("/profile", { state: { targetTab: "incoming_requests" } });
  };

  const handleSearchInput = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim().length > 1) {
      try {
        const res = await api.get(`/search-suggestions?q=${value}`);
        setSuggestions(res.data);
        setShowSuggestions(true);
      } catch (error) {}
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    setSearchQuery("");
    navigate(`/product-detail/${productId}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface-light dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 px-6 py-3 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <Link
            to="/"
            className="flex items-center gap-3 text-primary cursor-pointer shrink-0"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">
                music_note
              </span>
            </div>
            <h2 className="text-text-main dark:text-white text-xl font-bold tracking-tight hidden sm:block">
              OPENDEAL
            </h2>
          </Link>

          <div
            ref={searchRef}
            className="hidden md:flex flex-1 max-w-xl relative"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full group"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-text-secondary">
                  search
                </span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2.5 bg-background-light dark:bg-background-dark border-none rounded-lg text-sm text-text-main dark:text-white placeholder-text-secondary focus:ring-2 focus:ring-primary transition-all duration-200 outline-none"
                placeholder="Хөгжмийн зэмсэг хайх..."
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                onFocus={() =>
                  searchQuery.length > 1 && setShowSuggestions(true)
                }
              />
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSuggestionClick(item.id)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-none transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className="text-xs text-primary">
                        {item.category_name}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 text-[18px]">
                      north_west
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <nav className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setIsWishlistOpen(true)}
                className={`relative p-2 rounded-lg hover:bg-background-light dark:hover:bg-gray-800 text-text-main dark:text-white transition-all duration-300 ${animateFav ? "scale-125 text-red-500" : ""}`}
                title="Хадгалсан"
              >
                <span
                  className={`material-symbols-outlined ${favorites.length > 0 ? "fill-red-500 text-red-500" : ""}`}
                >
                  favorite
                </span>
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-surface-light dark:border-surface-dark">
                    {favorites.length}
                  </span>
                )}
              </button>

              {user && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg hover:bg-background-light dark:hover:bg-gray-800 text-text-main dark:text-white transition-colors"
                    title="Мэдэгдэл"
                  >
                    <span className="material-symbols-outlined">
                      notifications
                    </span>
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50 flex flex-col">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white flex justify-between items-center">
                        Мэдэгдэл
                      </div>
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-50 dark:border-slate-800/30 last:border-0 transition-colors flex gap-3"
                          >
                            <span
                              className={`material-symbols-outlined mt-1 ${notif.type === "received" ? "text-emerald-500" : "text-blue-500"}`}
                            >
                              {notif.type === "received"
                                ? "mark_email_unread"
                                : "send"}
                            </span>
                            <div className="flex flex-col">
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1">
                                {new Date(notif.date).toLocaleString("mn-MN")}
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-xs text-slate-400">
                          Танд шинэ мэдэгдэл алга байна.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Link
                to="/chat"
                className="relative p-2 rounded-lg hover:bg-background-light dark:hover:bg-gray-800 text-text-main dark:text-white transition-colors"
                title="Зурвас"
              >
                <span className="material-symbols-outlined">chat_bubble</span>
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-surface-light dark:border-surface-dark">
                    {unreadChatCount > 9 ? "9+" : unreadChatCount}
                  </span>
                )}
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-gray-800 text-text-main dark:text-white transition-colors"
                title="Загвар солих"
              >
                {isDarkMode ? (
                  <span className="material-symbols-outlined">light_mode</span>
                ) : (
                  <span className="material-symbols-outlined">dark_mode</span>
                )}
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className={`relative p-2 rounded-lg hover:bg-background-light dark:hover:bg-gray-800 text-text-main dark:text-white transition-all duration-300 ${animateCart ? "scale-125 text-primary" : ""}`}
                title="Сагс"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-surface-light dark:border-surface-dark">
                    {cart.length}
                  </span>
                )}
              </button>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={handleProfileClick}
                  className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-gray-800 text-text-main dark:text-white transition-colors flex items-center gap-2"
                  title="Профайл"
                >
                  {user ? (
                    user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                        {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                      </div>
                    )
                  ) : (
                    <span className="material-symbols-outlined">
                      account_circle
                    </span>
                  )}
                  {user && (
                    <span className="hidden xl:block text-sm font-bold truncate max-w-[100px]">
                      {user.name || user.email.split("@")[0]}
                    </span>
                  )}
                </button>

                {/* === ХЭРЭГЛЭГЧИЙН УНАДАГ ЦЭС === */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
                    {user ? (
                      // Нэвтэрсэн хэрэглэгчийн цэс
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-900 dark:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined text-primary text-[20px]">
                            person
                          </span>{" "}
                          Профайл
                        </Link>
                        <Link
                          to="/add-listing"
                          onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-900 dark:text-white transition-colors border-t border-slate-50 dark:border-slate-800/50"
                        >
                          <span className="material-symbols-outlined text-emerald-500 text-[20px]">
                            add_circle
                          </span>{" "}
                          Зар оруулах
                        </Link>
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            setIsReportModalOpen(true);
                          }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-900 dark:text-white transition-colors border-t border-slate-50 dark:border-slate-800/50"
                        >
                          <span className="material-symbols-outlined text-amber-500 text-[20px]">
                            report
                          </span>{" "}
                          Гомдол гаргах
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            handleLogout();
                          }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-red-600 border-t border-slate-100 dark:border-slate-800 transition-colors"
                        >
                          <span className="material-symbols-outlined text-red-500 text-[20px]">
                            logout
                          </span>{" "}
                          Гарах
                        </button>
                      </>
                    ) : (
                      // Нэвтрээгүй үеийн цэс
                      <>
                        <Link
                          to="/login"
                          onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-900 dark:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined text-primary text-[20px]">
                            login
                          </span>{" "}
                          Нэвтрэх
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800 transition-colors"
                        >
                          <span className="material-symbols-outlined text-primary text-[20px]">
                            person_add
                          </span>{" "}
                          Бүртгүүлэх
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ХАДГАЛСАН БОЛОН САГС */}
      <WishlistPage
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />
      <CartPage isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* === ГОМДОЛ ГАРГАХ MODAL ЦОНХ === */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">
                  report
                </span>{" "}
                Гомдол гаргах
              </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-red-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleReportSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Гомдоллох хүний имэйл хаяг
                </label>
                <input
                  type="email"
                  required
                  value={reportData.email}
                  onChange={(e) =>
                    setReportData({ ...reportData, email: e.target.value })
                  }
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Гомдлын шалтгаан
                </label>
                <textarea
                  required
                  value={reportData.reason}
                  onChange={(e) =>
                    setReportData({ ...reportData, reason: e.target.value })
                  }
                  placeholder="Яагаад гомдол гаргаж байгаагаа дэлгэрэнгүй бичнэ үү..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white min-h-[100px]"
                ></textarea>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors"
                >
                  {isSubmittingReport ? "Илгээж байна..." : "Илгээх"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MainHeader;
