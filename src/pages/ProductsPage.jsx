import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Context-оос функцуудыг дуудах
  const { addToCart, toggleFavorite, favorites } = useAppContext();

  const location = useLocation();
  const navigate = useNavigate(); // <--- ЯГ ЭНЭ МӨРИЙГ НЭМЭХЭЭ МАРТСАН БАЙНА
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get("category") || "";
  const urlSearchQuery = queryParams.get("search") || ""; // ШИНЭ: URL-аас хайсан үгийг авах

  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(urlSearchQuery); // ШИНЭ: Хайлтын утгыг state-д хадгалах
  const [sortBy, setSortBy] = useState("new");

  // ШИНЭ: Хэрэв өөр хуудаснаас шинээр хайлт хийвэл State-ийг шинэчлэх
  useEffect(() => {
    setSearch(queryParams.get("search") || "");
  }, [location.search]);
  const [conditions, setConditions] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 15000000 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // ШИНЭ: Нийт хуудсыг тоолох

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortOptions = [
    { value: "new", label: "Шинээр нэмэгдсэн", icon: "schedule" },
    { value: "low", label: "Үнэ: Багаас их", icon: "trending_up" },
    { value: "high", label: "Үнэ: Ихээс бага", icon: "trending_down" },
  ];

  // Баазаас өгөгдөл татах (Debounce ашигласан хувилбар)
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const response = await api.get(
            "/products",
            {
              params: {
                search: search || null, // ШИНЭ: Backend рүү хайсан үгээ явуулах
                category: category || null,
                sort: sortBy,
                conditions: conditions.length > 0 ? conditions.join(",") : null,
                min_price: priceRange.min,
                max_price: priceRange.max,
                page: page,
              },
            },
          );

          // ШИНЭЧИЛСЭН: Laravel paginate нь мэдээллээ data дотор, нийт хуудсыг last_page дотор явуулдаг
          const incomingData = response.data.data || response.data;
          setProducts(Array.isArray(incomingData) ? incomingData : []);
          setTotalPages(response.data.last_page || 1);
        } catch (err) {
          console.error("Алдаа:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }, 500);

    return () => clearTimeout(delayTimer);
  }, [search, category, sortBy, conditions, priceRange, page]);

  const handleClear = () => {
    setSearch(""); // Хайлтын үгийг устгана
    setCategory("");
    setConditions([]);
    setSortBy("new");
    setPriceRange({ min: 0, max: 15000000 });
    setPage(1);
    navigate("/products"); // URL дээрх хуучин үгийг бүрэн цэвэрлэнэ
  };

  const handleConditionChange = (status) => {
    if (conditions.includes(status)) {
      setConditions(conditions.filter((c) => c !== status));
    } else {
      setConditions([...conditions, status]);
    }
    setPage(1);
  };

  return (
    <div className="flex flex-1 max-w-7xl mx-auto w-full px-6 py-8 gap-8 font-sans">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 gap-6 h-fit sticky top-24">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-text-main dark:text-white">
            Шүүлтүүр
          </h1>
          <button
            onClick={handleClear}
            className="text-xs font-bold text-primary hover:text-primary-dark uppercase"
          >
            Цэвэрлэх
          </button>
        </div>

        {/* Төрөл */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase text-text-secondary mb-1">
            Төрөл
          </h3>
          {[
            { name: "Гитар", desc: "Цахилгаан, Акустик" },
            { name: "Төгөлдөр хуур", desc: "Гранд, Дижитал" },
            { name: "Бөмбөр", desc: "Сет, Цан" },
            { name: "Үлээвэр", desc: "Лимбэ, Саксофон" },
            { name: "Хийл", desc: "Сонгодог, Цахилгаан" },
            { name: "Бусад", desc: "Дагалдах хэрэгсэл г.м" },
          ].map((cat) => (
            <div
              key={cat.name}
              onClick={() => {
                // ШИНЭ ЛОГИК: Өмнө нь сонгосон байвал хоосон болгоно, үгүй бол сонгоно
                if (category === cat.name) {
                  setCategory("");
                } else {
                  setCategory(cat.name);
                }
                setPage(1);
              }}
              className={`group relative flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${category === cat.name ? "border-primary bg-primary/5 shadow-sm shadow-primary/10" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark hover:border-primary/50"}`}
            >
              <input
                type="radio"
                className="mt-0.5 size-4 text-primary focus:ring-primary pointer-events-none"
                name="category"
                checked={category === cat.name}
                readOnly // onChange-г устгаад readOnly болгов
              />
              <div className="flex flex-col pointer-events-none">
                <span
                  className={`text-sm font-medium ${category === cat.name ? "text-primary" : "text-text-main dark:text-white"}`}
                >
                  {cat.name}
                </span>
                <span className="text-xs text-text-secondary">{cat.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* DUO RANGE SLIDER - Хоёр талт слайдер */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase text-text-secondary">
            Үнийн дүн (MNT)
          </h3>

          <style>{`
            .dual-slider::-webkit-slider-thumb { pointer-events: auto; }
            .dual-slider::-moz-range-thumb { pointer-events: auto; }
          `}</style>

          <div className="relative h-10 flex items-center px-1">
            <div className="absolute w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div
              className="absolute h-1.5 bg-primary rounded-lg pointer-events-none"
              style={{
                left: `${(priceRange.min / 15000000) * 100}%`,
                right: `${100 - (priceRange.max / 15000000) * 100}%`,
              }}
            ></div>

            <input
              type="range"
              min="0"
              max="15000000"
              step="10000"
              value={priceRange.min}
              onChange={(e) => {
                setPriceRange({
                  ...priceRange,
                  min: Math.min(
                    parseInt(e.target.value),
                    priceRange.max - 50000, // Доод дээд үнийн хоорондын хамгийн бага зөрүүг 50к болгосон
                  ),
                });
                setPage(1);
              }}
              className="dual-slider absolute w-full appearance-none bg-transparent pointer-events-none z-30 accent-primary cursor-pointer"
            />
            <input
              type="range"
              min="0"
              max="15000000"
              step="10000"
              value={priceRange.max}
              onChange={(e) => {
                setPriceRange({
                  ...priceRange,
                  max: Math.max(
                    parseInt(e.target.value),
                    priceRange.min + 50000,
                  ),
                });
                setPage(1);
              }}
              className="dual-slider absolute w-full appearance-none bg-transparent pointer-events-none z-30 accent-primary cursor-pointer"
            />
          </div>

          <div className="flex justify-between text-[11px] text-text-secondary mt-1 font-bold">
            <div className="flex flex-col">
              <span>Доод</span>
              <span className="text-primary">
                {priceRange.min.toLocaleString()}₮
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span>Дээд</span>
              <span className="text-primary">
                {priceRange.max.toLocaleString()}₮
              </span>
            </div>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* Төлөв */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase text-text-secondary">
            Төлөв
          </h3>
          <div className="flex flex-col gap-2">
            {["Шинэ", "Маш сайн", "Сайн", "Дунд", "Хуучин"].map((status) => (
              <label
                key={status}
                className="flex items-center gap-3 py-1 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  className="rounded text-primary focus:ring-primary"
                  checked={conditions.includes(status)}
                  onChange={() => handleConditionChange(status)}
                />
                <span className="text-sm text-text-main dark:text-white group-hover:text-primary transition-colors">
                  {status}
                </span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6">
        <div className="hidden lg:flex items-center justify-between">
          <p className="text-text-secondary text-sm">
            <span className="font-semibold text-text-main dark:text-white">
              {products.length}
            </span>{" "}
            илэрц {category ? `"${category}"` : "Бүх бүтээгдэхүүн"}
          </p>
          <div className="relative z-20">
            {/* 1. Үндсэн дарах товч (Trigger) */}
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              onBlur={() => setTimeout(() => setIsSortOpen(false), 200)} // Гадна дарахад хаагдана
              className="flex items-center gap-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all group focus:outline-none"
            >
              <span className="text-text-secondary text-sm hidden sm:block">
                Эрэмбэлэх:
              </span>
              <span className="text-text-main dark:text-white font-bold text-sm">
                {sortOptions.find((opt) => opt.value === sortBy)?.label}
              </span>
              <span
                className={`material-symbols-outlined text-text-secondary transition-transform duration-300 ${isSortOpen ? "rotate-180 text-primary" : "group-hover:text-primary"}`}
              >
                expand_more
              </span>
            </button>

            {/* 2. Доошоо унаж гарч ирэх цэс (Dropdown Menu) */}
            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setPage(1);
                      setIsSortOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left ${
                      sortBy === option.value
                        ? "bg-primary/10 text-primary font-bold border-l-4 border-primary"
                        : "text-text-main dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary border-l-4 border-transparent"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {option.icon}
                    </span>
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 italic text-text-secondary">
            Ачаалж байна...
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product-detail/${product.id}`} // Таны App.jsx дээрх route рүү шилжинэ
                  className="group relative flex flex-col bg-white dark:bg-surface-dark rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300"
                >
                  {/* Image & Heart Icon */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      alt={product.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      src={product.img}
                    />

                    {/* Like Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const token = localStorage.getItem("token");
                        if (!token) {
                          // === ЭНДЭЭС ЭХЛЭН СОЛИНО ===
                          toast.error("Та эхлээд нэвтэрч орно уу!", {
                            style: {
                              borderRadius: "10px",
                              background: "#EF4444", // Улаан өнгө
                              color: "#fff",
                              fontWeight: "bold",
                            },
                          });
                          return;
                        }
                        toggleFavorite(product);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-white/80 dark:bg-black/30 backdrop-blur-sm hover:scale-110 active:scale-90 transition-all z-10"
                    >
                      <span
                        className={`material-symbols-outlined text-lg ${favorites.find((f) => f.id === product.id) ? "fill-red-500 text-red-500" : "text-text-main dark:text-white"}`}
                      >
                        favorite
                      </span>
                    </button>

                    {product.isVerified === 1 && (
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 text-[10px] font-bold bg-white/90 dark:bg-surface-dark/90 text-emerald-600 rounded-md flex items-center gap-1 shadow-sm border border-emerald-100/50 dark:border-emerald-900/50">
                          <span className="material-symbols-outlined text-sm">
                            verified
                          </span>{" "}
                          Баталгаажсан
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <h3 className="text-base font-semibold text-text-main dark:text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-auto">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${product.conditionColor}`}
                      >
                        {product.condition}
                      </span>
                      <span className="text-xs text-text-secondary">
                        • {product.isUsed}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-lg font-bold text-primary">
                        {product.price}
                      </p>
                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const token = localStorage.getItem("token");
                          if (!token) {
                            // === ЭНДЭЭС ЭХЛЭН СОЛИНО ===
                            toast.error("Та эхлээд нэвтэрч орно уу!", {
                              style: {
                                borderRadius: "10px",
                                background: "#EF4444", // Улаан өнгө
                                color: "#fff",
                                fontWeight: "bold",
                              },
                            });
                            return;
                          }
                          addToCart(product);
                        }}
                        className="text-primary hover:text-white p-2 rounded-lg hover:bg-primary transition-colors active:scale-95 bg-primary/10"
                      >
                        <span className="material-symbols-outlined">
                          add_shopping_cart
                        </span>
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* === ДИНАМИК ХУУДАСЛАЛТ (PAGINATION) === */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-12 gap-2 pb-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={page === 1}
                >
                  <span className="material-symbols-outlined dark:text-white">
                    chevron_left
                  </span>
                </button>

                {/* 1, 2, 3 товчийг автоматаар үүсгэх */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${
                        page === num
                          ? "bg-primary text-white shadow-md shadow-primary/20 border border-primary"
                          : "border border-gray-200 dark:border-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-transparent"
                      }`}
                    >
                      {num}
                    </button>
                  ),
                )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={page === totalPages}
                >
                  <span className="material-symbols-outlined dark:text-white">
                    chevron_right
                  </span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary gap-2">
            <span className="material-symbols-outlined text-4xl opacity-20">
              search_off
            </span>
            <p>Илэрц олдсонгүй. Өөр шүүлтүүр туршиж үзээрэй.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductsPage;