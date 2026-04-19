import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [type, setType] = useState("pending_verification"); // pending_verification эсвэл all

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/admin/products?type=${type}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setProducts(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchProducts();
  }, [type]);

  const handleApprove = async (id) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/admin/verifications/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success("Бараа баталгаажлаа!");
      fetchProducts();
    } catch (e) {}
  };

  const handleDelete = (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-[250px]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-red-500 text-2xl">
                warning
              </span>
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-base">
                Барааг устгах
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Энэ барааг дүрмэнд нийцээгүй гэж үзэж шууд устгах уу?
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg transition-colors"
            >
              Болих
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const loadingToast = toast.loading("Устгаж байна...");
                try {
                  await axios.delete(
                    `http://127.0.0.1:8000/api/admin/products/${id}`,
                    {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                    },
                  );
                  toast.success("Бараа устгагдлаа!", { id: loadingToast });
                  fetchProducts();
                } catch (e) {
                  toast.error("Алдаа гарлаа", { id: loadingToast });
                }
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
            >
              Устгах
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        style: {
          padding: "16px",
          borderRadius: "16px",
          background: "var(--bg-surface)",
        },
      },
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6">
        Барааны Хяналт
      </h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setType("pending_verification")}
          className={`px-4 py-2 rounded-lg font-bold ${type === "pending_verification" ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"}`}
        >
          Баталгаажуулах хүсэлтүүд
        </button>
        <button
          onClick={() => setType("all")}
          className={`px-4 py-2 rounded-lg font-bold ${type === "all" ? "bg-primary text-white" : "bg-slate-200 text-slate-600"}`}
        >
          Бүх барааг хянах
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400">
                Бараа
              </th>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400">
                Эзэмшигч
              </th>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400">
                Үнэ
              </th>
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400">
                Үйлдэл
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={type === "all" ? p.id : p.request_id}
                className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <td className="p-4 flex items-center gap-3">
                  <img
                    src={p.img}
                    alt="img"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <a
                    href={`/product-detail/${p.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-slate-900 dark:text-white hover:text-primary"
                  >
                    {p.title}
                  </a>
                </td>
                <td className="p-4">
                  {type === "all" ? p.user?.name : p.seller_name}
                </td>
                <td className="p-4 font-bold text-primary">{p.price}</td>
                <td className="p-4 flex gap-2">
                  {type === "pending_verification" && (
                    <button
                      onClick={() => handleApprove(p.request_id)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-sm"
                    >
                      БАТАЛГААЖУУЛАХ
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 font-bold rounded-lg text-sm"
                  >
                    УСТГАХ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="p-10 text-center text-slate-500">
            Одоогоор бараа алга байна.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
