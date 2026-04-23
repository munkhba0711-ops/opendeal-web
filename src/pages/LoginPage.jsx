import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { fetchUserItems } = useAppContext();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", formData);

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      await fetchUserItems();

      toast.success("Сайн байна уу, " + response.data.user.name);

      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/products");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Холболтонд алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 lg:p-10 relative overflow-hidden min-h-[80vh]">
      {/* Background Эффектүүд */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#0ea5e9]/10 blur-[100px] pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center z-10 w-full max-w-[960px]">
        {/* Зүүн талын Зураг ба Текст */}
        <div className="hidden lg:flex flex-col flex-1 relative rounded-2xl overflow-hidden shadow-2xl h-[450px]">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop"
            alt="Music Studio"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 p-10 z-20">
            <h2 className="text-3xl font-black text-white mb-3">
              Хөгжмийн ертөнцөд
              <br />
              тавтай морил
            </h2>
            <p className="text-slate-200 text-sm max-w-sm">
              Монголын хамгийн том хөгжмийн зэмсгийн зах зээл. Баталгаатай,
              найдвартай, ил тод.
            </p>
          </div>
        </div>

        {/* Баруун талын Нэвтрэх Форм */}
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
            <div className="mb-4 text-red-500 text-xs text-center font-bold bg-red-50 py-2 rounded-lg italic">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            <label className="flex flex-col gap-1.5">
              <span className="text-slate-900 dark:text-slate-200 text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-slate-400">
                  mail
                </span>
                Имэйл хаяг
              </span>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-background-dark p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="name@example.com"
                type="email"
                required
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-900 dark:text-slate-200 text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-slate-400">
                    lock
                  </span>
                  Нууц үг
                </span>
                {/* НУУЦ ҮГ СЭРГЭЭХ РҮҮ ШИЛЖИХ ХОЛБООС */}
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                >
                  Нууц үг мартсан?
                </Link>
              </div>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                type="password"
                className="w-full rounded-lg border border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-background-dark p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className={`mt-4 w-full text-center rounded-lg py-3 px-4 text-white text-base font-bold shadow-md transition-all ${
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              {loading ? "Уншиж байна..." : "Нэвтрэх"}
            </button>
          </form>

          {/* БҮРТГҮҮЛЭХ РҮҮ ШИЛЖИХ ХОЛБООС */}
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Бүртгэлгүй юу?{" "}
            <Link
              to="/register"
              className="text-primary font-bold hover:underline"
            >
              Бүртгүүлэх рүү очих
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
