import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/forgot-password",
        { email },
      );
      toast.success(res.data.message);
    } catch (err) {
      toast.error("Имэйл олдсонгүй эсвэл алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
        Нууц үг сэргээх
      </h2>
      <p className="text-slate-500 mb-6 text-sm">
        Бүртгэлтэй имэйл хаягаа оруулна уу. Бид танд сэргээх линк илгээх болно.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Имэйл хаяг"
          className="p-3 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          disabled={loading}
          className="bg-primary text-white p-3 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Илгээж байна..." : "Линк илгээх"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
