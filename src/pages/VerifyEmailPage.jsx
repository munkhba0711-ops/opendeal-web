import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");
  const hash = searchParams.get("hash");

  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Уншиж байна...");
  const hasRequested = useRef(false); // Давхар хүсэлт явахаас сэргийлэх

  useEffect(() => {
    if (!id || !hash) {
      setStatus("error");
      setMessage("Баталгаажуулах линк буруу эсвэл дутуу байна.");
      return;
    }

    if (hasRequested.current) return;
    hasRequested.current = true;

    const verifyEmail = async () => {
      try {
        const res = await axios.post("http://127.0.0.1:8000/api/email/verify", {
          id,
          hash,
        });

        setStatus("success");
        setMessage(res.data.message);

        // Хэрэв тухайн хэрэглэгч системд нэвтэрсэн байвал LocalStorage-ийг шинэчлэх
        const localUserStr = localStorage.getItem("user");
        if (localUserStr) {
          const localUser = JSON.parse(localUserStr);
          if (localUser.id === parseInt(id)) {
            // Баталгаажсан хугацааг нэмж хадгалах
            localUser.email_verified_at = res.data.user.email_verified_at;
            localStorage.setItem("user", JSON.stringify(localUser));
          }
        }
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Баталгаажуулахад алдаа гарлаа.",
        );
      }
    };

    verifyEmail();
  }, [id, hash]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-background-light dark:bg-background-dark">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 max-w-md w-full text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold">Түр хүлээнэ үү...</h2>
            <p className="text-slate-500 mt-2">
              Таны имэйлийг баталгаажуулж байна.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl">
                check_circle
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Амжилттай!
            </h2>
            <p className="text-slate-500 mb-6">{message}</p>
            <Link
              to="/profile"
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold w-full"
            >
              Профайл руу буцах
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl">error</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Алдаа гарлаа
            </h2>
            <p className="text-slate-500 mb-6">{message}</p>
            <Link
              to="/"
              className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold w-full"
            >
              Нүүр хуудас руу буцах
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
