import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    last_name: "", // ШИНЭ: Овог
    first_name: "", // ШИНЭ: Нэр
    email: "",
    password: "",
    password_confirmation: "",
    account_type: "buyer",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Нууц үгүүд хоорондоо таарахгүй байна!");
      return;
    }

    try {
      // API руу мэдээллийг илгээх
      const response = await api.post(
        "/register",
        formData,
      );

      toast.success(
        `${formData.account_type === "buyer" ? "Худалдан авагчаар" : "Худалдагчаар"} амжилттай бүртгэгдлээ!`,
        {
          style: {
            borderRadius: "10px",
            background: "#10B981",
            color: "#fff",
            fontWeight: "bold",
          },
        },
      );
      navigate("/login");
    } catch (err) {
      // === ШИНЭ: Backend-ээс ирсэн алдааг барьж авах хэсэг ===
      if (err.response && err.response.status === 422) {
        const backendErrors = err.response.data.errors;

        // Хэрэв имэйл давхардсан (аль хэдийн бүртгэлтэй) бол
        if (backendErrors.email) {
          setError(backendErrors.email[0]); // Дэлгэц дээрх улаан бичигт өгөх
          toast.error(backendErrors.email[0], { duration: 4000 }); // Попап (Toast) хэлбэрээр гаргах
        }
        // Хэрэв нууц үгийн урт хүрээгүй гэх мэт бусад алдаа байвал
        else if (backendErrors.password) {
          setError(backendErrors.password[0]);
        } else {
          setError("Мэдээлэл буруу байна. Дахин шалгана уу.");
        }
      } else {
        // Сервер ажиллахгүй эсвэл өөр алдаа гарсан үед
        setError(err.response?.data?.message || "Бүртгэлд алдаа гарлаа.");
      }
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[480px] space-y-8 z-10">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-[-0.033em] text-slate-900 dark:text-white mb-2">
            Шинэ бүртгэл үүсгэх
          </h1>
        </div>

        <div className="bg-white dark:bg-surface-dark py-8 px-6 shadow-xl rounded-2xl border border-slate-200 dark:border-gray-800">
          {error && (
            <p className="text-red-500 text-sm text-center mb-4 font-bold">
              {error}
            </p>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Төрөл сонгох хэсэг */}
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">
                Төрөл сонгох
              </p>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <label className="cursor-pointer relative">
                  <input
                    className="peer sr-only"
                    name="account_type"
                    type="radio"
                    value="buyer"
                    checked={formData.account_type === "buyer"}
                    onChange={handleChange}
                  />
                  <div className="flex items-center justify-center py-2.5 px-4 rounded-md text-sm font-medium transition-all peer-checked:bg-white dark:peer-checked:bg-surface-dark peer-checked:text-primary peer-checked:font-bold">
                    Худалдан авагч
                  </div>
                </label>
                <label className="cursor-pointer relative">
                  <input
                    className="peer sr-only"
                    name="account_type"
                    type="radio"
                    value="seller"
                    checked={formData.account_type === "seller"}
                    onChange={handleChange}
                  />
                  <div className="flex items-center justify-center py-2.5 px-4 rounded-md text-sm font-medium transition-all peer-checked:bg-white dark:peer-checked:bg-surface-dark peer-checked:text-primary peer-checked:font-bold">
                    Худалдагч
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Овог (ШИНЭ) */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                  Овог
                </label>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-slate-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white sm:text-sm"
                  placeholder="Овог"
                  type="text"
                  required
                />
              </div>

              {/* Нэр (ШИНЭ) */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                  Нэр
                </label>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-slate-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white sm:text-sm"
                  placeholder="Нэр"
                  type="text"
                  required
                />
              </div>
            </div>

            {/* Имэйл */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                Имэйл хаяг
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-slate-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white sm:text-sm"
                placeholder="name@example.com"
                type="email"
                required
              />
            </div>

            {/* Нууц үг */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                Нууц үг
              </label>
              <div className="relative">
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-slate-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white sm:text-sm"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Нууц үг давтах */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-1.5">
                Нууц үг давтах
              </label>
              <input
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-slate-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white sm:text-sm"
                placeholder="••••••••"
                type="password"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Бүртгүүлэх
              </button>
            </div>

            <p className="text-sm text-center text-slate-600 dark:text-slate-400 mt-4">
              Бүртгэлтэй юу?{" "}
              <Link
                to="/login"
                className="font-bold text-primary hover:underline"
              >
                Нэвтрэх
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;