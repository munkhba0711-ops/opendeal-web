import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

const SellerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  // === ШИНЭ: Үнэлгээ өгөх Modal State ===
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  // Мэдээлэл татах функцийг гадна гаргасан (Үнэлгээ өгсний дараа дахин дуудахын тулд)
  const fetchSeller = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/seller-profile/${id}`);
      setSellerData(response.data);
    } catch (error) {
      toast.error("Худалдагчийн мэдээлэл олдсонгүй");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeller();
  }, [id, navigate]);

  // === ШИНЭ: Үнэлгээ илгээх функц ===
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Та эхлээд нэвтэрч орно уу!");
      return;
    }

    setSubmittingReview(true);
    const token = localStorage.getItem("token");

    try {
      const res = await api.post("/submit-review", {
        seller_id: id,
        rating: rating,
        comment: comment,
      });

      toast.success(res.data.message);
      setIsReviewModalOpen(false);
      setComment("");
      fetchSeller(); // Амжилттай болмогц датаг шинэчилж шинэ үнэлгээг харуулна
    } catch (error) {
      toast.error(error.response?.data?.message || "Алдаа гарлаа.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // === ЗАССАН: ХУДАЛДАГЧ РУУ АНХНЫ ЧАТ ИЛГЭЭХ ===
  const startChat = (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Та эхлээд нэвтэрч орно уу!");
      return;
    }
    // seller биш sellerData.seller гэж хандах ёстой
    if (currentUser.id === sellerData.seller.id) {
      toast.error("Та өөрийнхөө профайл руу зурвас бичих боломжгүй.");
      return;
    }

    const token = localStorage.getItem("token");

    api
      .post("/chat/send", {
        receiver_id: sellerData.seller.id,
        message: "Сайн байна уу?",
      })
      .catch(() => {});

    navigate("/chat", { state: { autoSelectUser: sellerData.seller } });
  };

  if (loading || !sellerData) {
    return (
      <div className="flex-1 flex justify-center items-center py-40 text-slate-500">
        Уншиж байна...
      </div>
    );
  }

  // Backend-ээс ирж буй датанууд
  const { seller, activeProducts, soldProducts, reviews } = sellerData;

  // === ШИНЭ: Статистик тооцоолол ===
  const totalSales = soldProducts?.length || 0;
  const activeCount = activeProducts?.length || 0;
  const totalReviews = reviews?.length || 0;
  const avgRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews
        ).toFixed(1)
      : "0.0";

  // Огноог Монгол форматаар гаргах
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("mn-MN");

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-10 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ЗҮҮН ТАЛ: Худалдагчийн мэдээлэл болон Баталгаажуулалт */}
        <aside className="w-full lg:w-80 space-y-6">
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col items-center text-center">
              <div className="size-32 rounded-full border-4 border-primary/20 p-1 mb-4">
                <div className="size-full rounded-full bg-cover bg-center bg-slate-200 flex items-center justify-center text-3xl font-black text-slate-400 overflow-hidden">
                  {seller.avatar ? (
                    <img
                      src={seller.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    seller.name.substring(0, 2).toUpperCase()
                  )}
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {seller.name}
              </h1>
              <span className="mt-1 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">
                Худалдагч
              </span>

              <div className="mt-4 flex flex-col gap-2 w-full text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    location_on
                  </span>
                  <span className="text-sm">Монгол, Улаанбаатар</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    calendar_month
                  </span>
                  <span className="text-sm">
                    Элссэн: {new Date(seller.created_at).getFullYear()} он
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-2 w-full">
                <button
                  onClick={startChat}
                  className="flex-1 flex justify-center items-center bg-primary text-white py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Мессеж
                </button>
                {/* === ШИНЭ: Үнэлгээ өгөх товч (Өөрөө биш бол харагдана) === */}
                {currentUser && currentUser.id !== seller.id ? (
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="flex-1 bg-primary/10 text-primary py-2 rounded-lg font-bold text-sm hover:bg-primary/20 transition-colors"
                  >
                    Үнэлэх
                  </button>
                ) : (
                  <button className="flex-1 bg-primary/10 text-primary py-2 rounded-lg font-bold text-sm hover:bg-primary/20 transition-colors">
                    Дагах
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Нийт борлуулалт
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {totalSales}+
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Үнэлгээ
                </span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-yellow-500 text-sm">
                    star
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {avgRating} / 5.0
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Идэвхтэй зар
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {activeCount}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">
              Баталгаажуулалт
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-green-600 dark:text-green-500">
                <span className="material-symbols-outlined">check_circle</span>
                <span>Утасны дугаар баталгаажсан</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-green-600 dark:text-green-500">
                <span className="material-symbols-outlined">check_circle</span>
                <span>И-мэйл баталгаажсан</span>
              </div>
            </div>
          </div>
        </aside>

        {/* БАРУУН ТАЛ: Зарууд, Сэтгэгдэл болон Зарагдсан түүх */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="mb-6 flex border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${
                activeTab === "active"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Идэвхтэй зарууд ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab("sold")}
              className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${
                activeTab === "sold"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Зарагдсан түүх ({totalSales})
            </button>
          </div>

          {/* Барааны жагсаалт (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeTab === "active" ? (
              activeProducts.length > 0 ? (
                activeProducts.map((prod) => (
                  <Link
                    key={prod.id}
                    to={`/product-detail/${prod.id}`}
                    className="group bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all hover:shadow-lg flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-slate-200 dark:bg-slate-800 overflow-hidden w-full">
                      {prod.isVerified === 1 && (
                        <div className="absolute top-2 left-2 z-10 bg-primary/90 text-white text-[10px] px-2 py-1 rounded font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">
                            verified
                          </span>{" "}
                          БАТАЛГААЖСАН
                        </div>
                      )}
                      <img
                        src={prod.img}
                        alt={prod.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-xs text-slate-500 mb-1">
                        {prod.category_name}
                      </p>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {prod.title}
                      </h3>
                      <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <p className="text-lg font-bold text-primary">
                          {prod.price}
                        </p>
                        <span className="text-xs text-slate-400">
                          {formatDate(prod.created_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-slate-500">
                  Идэвхтэй зар алга байна.
                </div>
              )
            ) : soldProducts.length > 0 ? (
              soldProducts.map((prod) => (
                <Link
                  key={prod.id}
                  to={`/product-detail/${prod.id}`}
                  className="group relative bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col opacity-70 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="absolute inset-0 z-20 bg-slate-900/10 dark:bg-black/40 flex items-center justify-center pointer-events-none">
                    <span className="bg-slate-800 text-white font-black px-4 py-1 rounded-full uppercase tracking-widest transform -rotate-12 border-2 border-white/20 shadow-xl">
                      ЗАРАГДСАН
                    </span>
                  </div>
                  <div className="relative aspect-[4/3] bg-slate-200 dark:bg-slate-800 overflow-hidden w-full">
                    <img
                      src={prod.img}
                      alt={prod.title}
                      className="w-full h-full object-cover grayscale-[50%] group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs text-slate-500 mb-1">
                      {prod.category_name}
                    </p>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-primary transition-colors">
                      {prod.title}
                    </h3>
                    <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <p className="text-lg font-bold text-slate-500 line-through decoration-red-400">
                        {prod.price}
                      </p>
                      <span className="text-xs text-slate-400">
                        {formatDate(prod.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-slate-500">
                Зарагдсан түүх алга байна.
              </div>
            )}
          </div>

          {/* Хэрэглэгчийн сэтгэгдэл */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Хэрэглэгчийн сэтгэгдэл
              </h2>
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-lg">
                <span className="material-symbols-outlined text-sm">star</span>
                <span className="font-bold text-sm">{avgRating} / 5.0</span>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                          {review.buyer?.avatar ? (
                            <img
                              src={review.buyer.avatar}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : review.buyer?.name ? (
                            review.buyer.name.substring(0, 1).toUpperCase()
                          ) : (
                            "U"
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {review.buyer?.name || "Хэрэглэгч"}
                          </h4>
                          <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`material-symbols-outlined text-xs ${i < review.rating ? "fill-yellow-500" : "text-slate-300 dark:text-slate-700"}`}
                              >
                                star
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">
                  Одоогоор сэтгэгдэл алга байна.
                </p>
              )}
            </div>

            {reviews.length > 0 && (
              <button className="mt-6 w-full py-3 text-sm font-bold text-primary hover:bg-primary/5 transition-colors rounded-xl border border-primary/20">
                Бүх сэтгэгдлийг харах
              </button>
            )}
          </div>

          {/* Сүүлд зарагдсан зүйлс (Хүснэгт) */}
          {soldProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                Сүүлд зарагдсан зүйлс (Хүснэгт)
              </h2>
              <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                    <tr>
                      <th className="px-6 py-4">Бүтээгдэхүүн</th>
                      <th className="px-6 py-4">Үнэ</th>
                      <th className="px-6 py-4">Огноо</th>
                      <th className="px-6 py-4">Төлөв</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {soldProducts.slice(0, 5).map((prod) => (
                      <tr
                        key={prod.id}
                        className="text-slate-700 dark:text-slate-300"
                      >
                        <td className="px-6 py-4 flex items-center gap-3 font-medium">
                          <div
                            className="size-10 rounded bg-slate-100 bg-cover bg-center shrink-0"
                            style={{ backgroundImage: `url('${prod.img}')` }}
                          ></div>
                          <span className="truncate max-w-[200px]">
                            {prod.title}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {prod.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(prod.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-bold">
                            Амжилттай
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === ҮНЭЛГЭЭ ӨГӨХ MODAL ЦОНХ === */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Үнэлгээ үлдээх
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-slate-400 hover:text-red-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Одоор үнэлэх (1-5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setRating(num)}
                      className={`material-symbols-outlined text-4xl transition-colors ${rating >= num ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
                      style={{
                        fontVariationSettings:
                          rating >= num ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >
                      star
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Сэтгэгдэл
                </label>
                <textarea
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white min-h-[100px]"
                  placeholder="Жишээ: Найдвартай, хурдан шуурхай байлаа..."
                ></textarea>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors"
                >
                  {submittingReview ? "Илгээж байна..." : "Илгээх"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default SellerProfilePage;
