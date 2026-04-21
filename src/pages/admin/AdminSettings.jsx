import React, { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.get(
        "/admin/categories",
      );
      setCategories(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await api.post(
        "/admin/categories",
        { name: newCategory },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success("Ангилал нэмэгдлээ");
      setNewCategory("");
      fetchCategories();
    } catch (e) {}
  };

  const handleDelete = (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-[250px]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-red-500 text-2xl">
                delete_forever
              </span>
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-base">
                Ангилал устгах
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Та энэ ангиллыг системээс устгахдаа итгэлтэй байна уу?
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
                  await api.delete(
                    `/admin/categories/${id}`,
                    {
                      headers: {
                      },
                    },
                  );
                  toast.success("Ангилал устгагдлаа", { id: loadingToast });
                  fetchCategories();
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
        Системийн Тохиргоо
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ангилал нэмэх хэсэг */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold mb-4">
            Хөгжмийн зэмсгийн ангилал нэмэх
          </h2>
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Шинэ ангиллын нэр (Жишээ нь: Укулеле)"
              className="flex-1 px-4 py-2 border rounded-lg outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg font-bold"
            >
              Нэмэх
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-bold"
              >
                {cat.name}
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-red-500 hover:text-red-700 ml-1"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    close
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminSettings;