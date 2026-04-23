import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Backend рүү нууц үг сэргээх хүсэлт илгээх (Хаягаа api инстанцаар явуулна)
      const res = await api.post("/forgot-password", { email });
      toast.success(res.data.message || "Нууц үг сэргээх линк илгээгдлээ.");
      setEmail(""); // Амжилттай болсны дараа имэйл бичих нүдийг хоослох
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Алдаа гарлаа. Дахин оролдоно уу.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 lg:p-10 relative overflow-hidden min-h-[80vh]">
      {/* Background Эффектүүд (Нэвтрэх хуудастай яг адилхан) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#0ea5e9]/10 blur-[100px] pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center z-10 w-full max-w-[960px]">
        {/* Голлуулсан Нэвтрэх хайрцагтай ижил Форм */}
        <div className="flex w-full max-w-[440px] flex-col bg-white dark:bg-surface-dark rounded-2xl shadow-lg border border-slate-200 dark:border-gray-800 p-8 mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Нууц үг сэргээх
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Бүртгэлтэй имэйл хаягаа оруулна уу. Бид танд сэргээх линк илгээх
              болно.
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1.5">
              <span className="text-slate-900 dark:text-slate-200 text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-slate-400">
                  mail
                </span>
                Имэйл хаяг
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-background-dark p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="name@example.com"
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
              {loading ? "Түр хүлээнэ үү..." : "Линк илгээх"}
            </button>
          </form>

          {/* Нэвтрэх хуудас руу буцах товч */}
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            <Link
              to="/login"
              className="text-primary font-bold hover:underline flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">
                arrow_back
              </span>
              Нэвтрэх хуудас руу буцах
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
