import React, { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

const AdminDisputes = () => {
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.get("/admin/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id) => {
    try {
      await api.post(
        `/admin/reports/${id}/resolve`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success("Шийдвэрлэгдсэн төлөвт орууллаа");
      fetchReports();
    } catch (e) {}
  };

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6">
        Гомдол Шийдвэрлэх
      </h1>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400">
                Гомдол гаргагч
              </th>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400">
                Гомдолд өртсөн
              </th>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400">
                Шалтгаан
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
            {reports.map((r) => (
              <tr
                key={r.id}
                className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <td className="p-4 font-bold text-red-500">
                  {r.reporter_name}
                </td>
                <td className="p-4 font-bold text-slate-900 dark:text-white">
                  {r.reported_name}
                </td>
                <td className="p-4 max-w-xs truncate">{r.reason}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${r.status === "pending" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}
                  >
                    {r.status === "pending" ? "ШИЙДЭГДЭЭГҮЙ" : "ШИЙДВЭРЛЭСЭН"}
                  </span>
                </td>
                <td className="p-4">
                  {r.status === "pending" && (
                    <button
                      onClick={() => handleResolve(r.id)}
                      className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg text-sm"
                    >
                      Шийдвэрлэх
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && (
          <div className="p-10 text-center text-slate-500">
            Гомдол алга байна.
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminDisputes;