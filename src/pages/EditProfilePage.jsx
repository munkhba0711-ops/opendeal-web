import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast"; // Энийг нэмнэ

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "general";

  const [activeTab, setActiveTab] = useState(initialTab);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // --- ХЭРЭГЛЭГЧИЙН МЭДЭЭЛЛИЙГ ХАДГАЛАХ STATE-ҮҮД ---
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [city, setCity] = useState(user.city || "");
  const [district, setDistrict] = useState(user.district || "");
  const [address, setAddress] = useState(user.address || "");

  // --- НУУЦ ҮГНИЙ STATE (ШИНЭЭР НЭМЭХ) ---
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  // Буцах үйлдэл
  const handleGoBack = () => navigate("/profile");

  // --- МЭДЭЭЛЭЛ ХАДГАЛАХ ФУНКЦ ---
  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await api.post(
        "/profile/update",
        { name, phone, city, district, address },
      );

      // Амжилттай хадгалсан бол LocalStorage дахь user мэдээллийг шинэчлэх
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Мэдээлэл амжилттай шинэчлэгдлээ!", {
        style: {
          borderRadius: "10px",
          background: "#3B82F6", // Цэнхэр өнгө
          color: "#fff",
          fontWeight: "bold",
        },
      });
    } catch (error) {
      console.error("Мэдээлэл хадгалахад алдаа гарлаа:", error);
      toast.error("Алдаа гарлаа, дахин оролдоно уу.", {
        style: {
          borderRadius: "10px",
          background: "#EF4444", // Алдааг илтгэх улаан өнгө
          color: "#fff",
          fontWeight: "bold",
        },
      });
    }
  };

  // --- НУУЦ ҮГ СОЛИХ ФУНКЦ (ШИНЭЭР НЭМЭХ) ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await api.post(
        "/profile/change-password",
        passwords,
      );

      toast.success("Нууц үг амжилттай солигдлоо!", {
        style: {
          borderRadius: "10px",
          background: "#10B981", // Үндсэн ногоон өнгө (эсвэл өөрийн primary өнгө)
          color: "#fff",
          fontWeight: "bold",
        },
      });
      setPasswords({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (error) {
      console.error("Нууц үг солиход алдаа гарлаа:", error);
      toast.error(
        error.response?.data?.message || "Одоогийн нууц үг буруу байна!",
        {
          style: {
            borderRadius: "10px",
            background: "#EF4444", // Улаан өнгө
            color: "#fff",
            fontWeight: "bold",
          },
        },
      );
    }
  };
  // === ЭНДЭЭС ЭХЛЭНЭ: ИМЭЙЛ БАТАЛГААЖУУЛАХ ЛИНК ИЛГЭЭХ ===
  const handleSendVerification = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await api.post(
        "/email/verification-notification",
        {},
      );

      toast.success(response.data.message, {
        style: {
          borderRadius: "10px",
          background: "#10B981",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Алдаа гарлаа, дахин оролдоно уу.",
        {
          style: {
            borderRadius: "10px",
            background: "#EF4444",
            color: "#fff",
            fontWeight: "bold",
          },
        },
      );
    }
  };
  return (
    <main className="max-w-4xl mx-auto w-full px-4 py-8">
      {/* Буцах товч болон Гарчиг */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleGoBack}
          className="p-2 bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Тохиргоо
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Зүүн талын цэс */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-colors text-left ${activeTab === "general" ? "bg-primary text-white shadow-md" : "bg-white dark:bg-background-dark text-slate-600 hover:bg-slate-50 border border-slate-200 dark:border-slate-800"}`}
          >
            <span className="material-symbols-outlined text-lg">person</span>{" "}
            Ерөнхий мэдээлэл
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-colors text-left ${activeTab === "verification" ? "bg-primary text-white shadow-md" : "bg-white dark:bg-background-dark text-slate-600 hover:bg-slate-50 border border-slate-200 dark:border-slate-800"}`}
          >
            <span className="material-symbols-outlined text-lg">security</span>{" "}
            Баталгаажуулалт
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-colors text-left ${activeTab === "password" ? "bg-primary text-white shadow-md" : "bg-white dark:bg-background-dark text-slate-600 hover:bg-slate-50 border border-slate-200 dark:border-slate-800"}`}
          >
            <span className="material-symbols-outlined text-lg">lock</span> Нууц
            үг солих
          </button>
        </aside>

        {/* Баруун талын Контент */}
        <div className="flex-1 bg-white dark:bg-background-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 min-h-[400px]">
          {/* ТАБ 1: ЕРӨНХИЙ МЭДЭЭЛЭЛ (ШИНЭЧЛЭГДСЭН) */}
          {activeTab === "general" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold border-b border-slate-100 pb-4">
                Ерөнхий мэдээлэл болон Хаяг
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
                {/* Овог нэр */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Овог, Нэр
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-transparent"
                    placeholder="Таны нэр"
                  />
                </div>

                {/* Утасны дугаар */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Утасны дугаар
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-transparent"
                    placeholder="9911-XXXX"
                  />
                </div>

                {/* Имэйл (Зөвхөн унших боломжтой) */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Имэйл хаяг
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Хот/Аймаг */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Хот / Аймаг
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-background-dark"
                  >
                    <option value="">Сонгох...</option>
                    <option value="Улаанбаатар">Улаанбаатар</option>
                    <option value="Дархан-Уул">Дархан-Уул</option>
                    <option value="Орхон">Орхон</option>
                    <option value="Бусад аймаг">Бусад аймаг</option>
                  </select>
                </div>

                {/* Дүүрэг/Сум */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Дүүрэг / Сум
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-transparent"
                    placeholder="Сүхбаатар дүүрэг"
                  />
                </div>

                {/* Дэлгэрэнгүй хаяг */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Дэлгэрэнгүй хаяг
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-transparent"
                    rows="3"
                    placeholder="Хороо, гудамж, байр, орц, тоот..."
                  ></textarea>
                  <p className="text-xs text-slate-500 mt-1">
                    Таны захиалга автоматаар энэ хаягаар хүргэгдэх болно.
                  </p>
                </div>

                {/* Хадгалах товч */}
                <div className="col-span-1 md:col-span-2 mt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 w-full md:w-auto shadow-sm"
                  >
                    Мэдээлэл хадгалах
                  </button>
                </div>
              </div>
            </div>
          )}

          {/*ТАБ 2 БАТАЛГААЖУУЛАЛТ === */}
          {activeTab === "verification" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold border-b border-slate-100 pb-4">
                Холболт ба Баталгаажуулалт
              </h2>
              <div className="flex flex-col gap-4">
                {/* 1. ИМЭЙЛ ХЭСЭГ (ШИНЭЧИЛСЭН) */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Имэйл хаяг
                    </p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    {/* Баталгаажсан эсэхийг харуулах */}
                    {user.email_verified_at ? (
                      <span className="text-xs text-green-500 font-bold">
                        ✓ Баталгаажсан
                      </span>
                    ) : (
                      <span className="text-xs text-orange-500 font-bold">
                        ⚠ Баталгаажаагүй
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleSendVerification}
                    disabled={user.email_verified_at !== null}
                    className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${
                      user.email_verified_at
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {user.email_verified_at ? "Баталгаажсан" : "Линк илгээх"}
                  </button>
                </div>

                {/* 2. УТАСНЫ ДУГААР ХЭСЭГ (Хуучнаараа) */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Утасны дугаар
                    </p>
                    <p
                      className={`text-sm ${user.phone ? "text-slate-500" : "text-orange-500"}`}
                    >
                      {user.phone || "Одоогоор холбоогүй байна"}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-primary/10 text-primary font-bold text-sm rounded-lg hover:bg-primary/20">
                    Дугаар холбох
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ТАБ 3: НУУЦ ҮГ СОЛИХ (ШИНЭЧЛЭГДСЭН) */}
          {activeTab === "password" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold border-b border-slate-100 pb-4">
                Нууц үг солих
              </h2>
              <form
                onSubmit={handleChangePassword}
                className="flex flex-col gap-4 max-w-md"
              >
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Одоогийн нууц үг
                  </label>
                  <input
                    type="password"
                    required
                    value={passwords.current_password}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        current_password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Шинэ нууц үг
                  </label>
                  <input
                    type="password"
                    required
                    value={passwords.new_password}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        new_password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Шинэ нууц үг давтах
                  </label>
                  <input
                    type="password"
                    required
                    value={passwords.new_password_confirmation}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        new_password_confirmation: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 mt-2 w-max shadow-sm"
                >
                  Нууц үг шинэчлэх
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default EditProfilePage;