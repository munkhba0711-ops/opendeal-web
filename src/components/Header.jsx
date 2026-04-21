import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Header = () => {
  // === 1. DARK MODE STATE БОЛОН ФУНКЦ ===
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (
      localStorage.getItem("color-theme") === "dark" ||
      (!("color-theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
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

  // === 2. ХАЙЛТ БОЛОН ПРОФАЙЛЫН STATE ===
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // === ШИНЭЭР НЭМСЭН: Профайлын доошоо унадаг цэсний тохиргоо ===
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  // Админ бол шууд Админ хуудас руу, үгүй бол цэс дэлгэх функц
  const handleProfileClick = () => {
    if (user && user.role === "admin") {
      navigate("/admin");
    } else {
      setShowProfileDropdown(!showProfileDropdown);
    }
  };

  // Гадна дарахад хайлт болон профайл цэсийг хаах
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchInput = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length > 1) {
      try {
        const res = await api.get(
          `/search-suggestions?q=${value}`,
        );
        setSuggestions(res.data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Санал болгох үг татахад алдаа гарлаа", error);
      }
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
    <header className="sticky top-0 z-50 w-full bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          {/* Logo хэсэг */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">
                music_note
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
              OPENDEAL
            </h1>
          </Link>

          {/* ХАЙЛТЫН ХЭСЭГ */}
          <div
            ref={searchRef}
            className="hidden md:flex flex-1 max-w-lg mx-4 relative"
          >
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark text-xl">
                  search
                </span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-all duration-200"
                placeholder="Хөгжмийн зэмсэг хайх..."
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                onFocus={() =>
                  searchQuery.length > 1 && setShowSuggestions(true)
                }
              />
            </form>

            {/* САНАЛ БОЛГОХ ЦОНХ */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50 text-left">
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSuggestionClick(item.id)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-none transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className="text-xs text-primary font-medium">
                        {item.category_name}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-[18px]">
                      north_west
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Баруун талын товчнууд */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
              title="Загвар солих"
            >
              {isDarkMode ? (
                <span className="material-symbols-outlined">light_mode</span>
              ) : (
                <span className="material-symbols-outlined">dark_mode</span>
              )}
            </button>

            {/* === ШИНЭЧЛЭГДСЭН ХЭРЭГЛЭГЧИЙН ХЭСЭГ === */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={handleProfileClick}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-900 dark:text-white transition-colors flex items-center gap-2"
                  title={user.role === "admin" ? "Админ Панел" : "Профайл"}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                      {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="hidden xl:block text-sm font-bold truncate max-w-[100px]">
                    {user.name || user.email.split("@")[0]}
                  </span>
                </button>

                {/* Зөвхөн Энгийн хэрэглэгчдэд унадаг цэс харагдана */}
                {user.role !== "admin" && showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-900 dark:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-primary text-lg">
                        person
                      </span>{" "}
                      Профайл
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-red-600 border-t border-slate-100 dark:border-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-red-500 text-lg">
                        logout
                      </span>{" "}
                      Гарах
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Нэвтрээгүй үед
              <>
                <Link
                  to="/login"
                  className="hidden sm:flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-colors focus:outline-none"
                >
                  Нэвтрэх
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 transition-colors focus:outline-none shadow-sm"
                >
                  Бүртгүүлэх
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;