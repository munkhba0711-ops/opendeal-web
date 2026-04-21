import React, { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (id) => {
    try {
      const res = await api.post(
        `/admin/users/${id}/toggle-block`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success(res.data.message);
      fetchUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || "Алдаа гарлаа");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6">
        Хэрэглэгчийн Удирдлага
      </h1>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400">
                Нэр
              </th>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400">
                Имэйл
              </th>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400">
                Эрх
              </th>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400">
                Төлөв
              </th>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400">
                Үйлдэл
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <td className="p-4 font-bold text-slate-900 dark:text-white">
                  {u.name}
                </td>
                <td className="p-4">{u.email}</td>
                <td className="p-4 uppercase text-xs font-bold">{u.role}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${u.is_blocked ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}
                  >
                    {u.is_blocked ? "БЛОКЛОГДСОН" : "ИДЭВХТЭЙ"}
                  </span>
                </td>
                <td className="p-4">
                  {u.role !== "admin" && (
                    <button
                      onClick={() => handleToggleBlock(u.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold ${u.is_blocked ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-red-100 hover:bg-red-200 text-red-600"}`}
                    >
                      {u.is_blocked ? "Блокоос гаргах" : "Блоклох"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminUsers;