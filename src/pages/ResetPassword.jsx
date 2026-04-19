import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/reset-password", {
        token: searchParams.get("token"),
        email: searchParams.get("email"),
        password: password,
        password_confirmation: confirmPassword,
      });
      toast.success("Нууц үг амжилттай шинэчлэгдлээ!");
      navigate("/login");
    } catch (err) {
      toast.error("Алдаа гарлаа. Линк хүчингүй байж магадгүй.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        Шинэ нууц үг тохируулах
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          placeholder="Шинэ нууц үг"
          className="p-3 rounded-lg border dark:bg-slate-800 dark:text-white"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Нууц үг давтах"
          className="p-3 rounded-lg border dark:bg-slate-800 dark:text-white"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button className="bg-primary text-white p-3 rounded-lg font-bold">
          Хадгалах
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
