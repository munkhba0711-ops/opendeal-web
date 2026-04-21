import React, { useState, useEffect } from "react";
import api from "../../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await api.get("/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (e) {}
    };
    fetchStats();
  }, []);

  if (!stats)
    return (
      <div className="animate-pulse flex gap-4">
        <div className="h-32 w-1/4 bg-slate-200 rounded-xl"></div>
      </div>
    );

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">
        Ерөнхий Статистик
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <p className="text-slate-500 font-medium mb-1">Нийт хэрэглэгчид</p>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white">
            {stats.totalUsers}
          </h2>
          <p className="text-emerald-500 text-sm font-bold mt-2">
            +{stats.newUsersToday} өнөөдөр
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <p className="text-slate-500 font-medium mb-1">
            Эргэлт (Нийт гүйлгээ)
          </p>
          <h2 className="text-3xl font-black text-primary">
            {stats.totalTransactions.toLocaleString()} ₮
          </h2>
          <p className="text-emerald-500 text-sm font-bold mt-2">
            +{stats.transactionsToday.toLocaleString()} ₮ өнөөдөр
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-4 border-l-amber-500">
          <p className="text-slate-500 font-medium mb-1">Шалгах бараа</p>
          <h2 className="text-4xl font-black text-amber-500">
            {stats.pendingVerifications}
          </h2>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-4 border-l-red-500">
          <p className="text-slate-500 font-medium mb-1">Шийдвэрлэх гомдол</p>
          <h2 className="text-4xl font-black text-red-500">
            {stats.pendingReports}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;