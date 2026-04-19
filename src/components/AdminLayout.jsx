import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();
  // === ШИНЭ: DARK MODE STATE ===
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b1120]">
      {/* Хажуугийн цэс (Sidebar) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="h-16 flex items-center justify-center border-b border-slate-800 bg-slate-950">
          <h1 className="text-xl font-black text-white tracking-widest uppercase text-primary">
            Админ Панел
          </h1>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive ? "bg-primary text-white" : "hover:bg-slate-800 hover:text-white"}`
            }
          >
            <span className="material-symbols-outlined">dashboard</span> Тайлан
          </NavLink>
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive ? "bg-primary text-white" : "hover:bg-slate-800 hover:text-white"}`
            }
          >
            <span className="material-symbols-outlined">fact_check</span>{" "}
            Барааны хяналт
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive ? "bg-primary text-white" : "hover:bg-slate-800 hover:text-white"}`
            }
          >
            <span className="material-symbols-outlined">group</span> Хэрэглэгчид
          </NavLink>
          <NavLink
            to="/admin/disputes"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive ? "bg-primary text-white" : "hover:bg-slate-800 hover:text-white"}`
            }
          >
            <span className="material-symbols-outlined">gavel</span> Гомдол
            шийдвэрлэх
          </NavLink>
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive ? "bg-primary text-white" : "hover:bg-slate-800 hover:text-white"}`
            }
          >
            <span className="material-symbols-outlined">settings</span> Тохиргоо
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          {/* === ШИНЭ: THEME СОЛИХ ТОВЧ === */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors font-medium"
          >
            <span className="material-symbols-outlined">
              {isDarkMode ? "light_mode" : "dark_mode"}
            </span>
            {isDarkMode ? "Гэгээлэг загвар" : "Бараан загвар"}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-colors font-medium"
          >
            <span className="material-symbols-outlined">logout</span> Системээс
            гарах
          </button>
        </div>
      </aside>

      {/* Гол контент гарах хэсэг */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet /> {/* ЭНД 5 ХУУДАС ЭЭЛЖИЛЖ ХАРАГДАНА */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
