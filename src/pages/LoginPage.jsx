import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); // Нууц үг харах төлөв
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { fetchUserItems } = useAppContext();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login",
        formData,
      );

      // 1. Мэдээллийг хөтөч дээр хадгалах
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      await fetchUserItems();

      toast.success("Сайн байна уу, " + response.data.user.name, {
        style: {
          borderRadius: "10px",
          background: "#10B981", // Ногоон өнгө
          color: "#fff",
          fontWeight: "bold",
        },
      });

      // === ЗАССАН ХЭСЭГ: Энд замаа солино ===
      if (response.data.user.role === "admin") {
        navigate("/admin"); // Админ бол шууд Админ Панел руу
      } else {
        navigate("/products"); // Бусад хүмүүс Барааны хуудас руу
      }
      // ======================================
    } catch (err) {
      setError(
        err.response?.data?.message || "Имэйл эсвэл нууц үг буруу байна.",
      );
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 lg:p-10 relative overflow-hidden min-h-[80vh]">
      {/* Background glow хэсэг хэвээрээ... */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5 dark:opacity-10">
        <div className="absolute -right-20 top-20 w-96 h-96 bg-primary rounded-full blur-[128px]"></div>
        <div className="absolute -left-20 bottom-20 w-96 h-96 bg-primary rounded-full blur-[128px]"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center z-10 w-full max-w-[960px]">
        {/* Left Side Image хэвээрээ... */}
        <div className="hidden lg:flex flex-1 flex-col justify-center max-w-[480px]">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800")',
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
              <h3 className="text-white text-3xl font-bold mb-2">
                Хөгжмийн ертөнцөд тавтай морил
              </h3>
              <p className="text-slate-200 text-lg">
                Монголын хамгийн том хөгжмийн зэмсгийн зах зээл.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="flex w-full max-w-[440px] flex-col bg-white dark:bg-surface-dark rounded-2xl shadow-lg border border-slate-200 dark:border-gray-800 p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Нэвтрэх
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Бүртгэлтэй хаягаараа нэвтэрч орно уу.
            </p>
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-xs text-center font-bold bg-red-50 py-2 rounded-lg">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            <label className="flex flex-col gap-1.5">
              <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                Имэйл хаяг
              </span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">
                    mail
                  </span>
                </span>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary pl-10 pr-4 py-3 text-base"
                  placeholder="name@example.com"
                  type="email"
                  required
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                  Нууц үг
                </span>
                <Link
                  to="/forgot-password" // Бидний үүсгэсэн зам
                  className="text-primary text-sm font-medium hover:text-primary-dark underline-offset-4 hover:underline"
                >
                  Мартсан уу?
                </Link>
              </div>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">
                    lock
                  </span>
                </span>
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"} // Төрлийг солих
                  className="w-full rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary pl-10 pr-12 py-3 text-base"
                  placeholder="••••••••"
                  required
                />
                {/* Нүдний дүрс нэмсэн хэсэг */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="mt-2 w-full text-center rounded-lg bg-primary py-3 px-4 text-white text-base font-bold shadow-sm hover:bg-primary-dark transition-all"
            >
              Нэвтрэх
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            Бүртгэлгүй юу?{" "}
            <Link
              to="/register"
              className="font-bold text-primary hover:text-primary-dark"
            >
              Бүртгүүлнэ үү
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
