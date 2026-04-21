import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api"; // ШИНЭ: Саяны үүсгэсэн api.js-ээ ашиглана
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ШИНЭ: Уншиж байгааг мэдэх төлөв
  const navigate = useNavigate();
  const { fetchUserItems } = useAppContext();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Уншиж эхэллээ

    try {
      // ЗАССАН: Хатуу хаяг биш, api инстанц ашиглаж байна
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
      setLoading(false); // Уншиж дууслаа
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 lg:p-10 relative overflow-hidden min-h-[80vh]">
      {/* Background glow хэсэг хэвээрээ... */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center z-10 w-full max-w-[960px]">
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
            <div className="mb-4 text-red-500 text-xs text-center font-bold bg-red-50 py-2 rounded-lg italic">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            <label className="flex flex-col gap-1.5">
              <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                Имэйл хаяг
              </span>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-slate-800 p-3"
                placeholder="name@example.com"
                type="email"
                required
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                Нууц үг
              </span>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-slate-800 p-3"
                placeholder="••••••••"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 w-full text-center rounded-lg py-3 px-4 text-white text-base font-bold shadow-sm transition-all ${
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dark"
              }`}
            >
              {loading ? "Уншиж байна..." : "Нэвтрэх"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
