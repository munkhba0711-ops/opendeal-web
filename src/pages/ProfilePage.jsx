import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. УДИРДАХ STATE-ҮҮД
  const [activeTab, setActiveTab] = useState("purchases");
  const [activeOrders, setActiveOrders] = useState([]);
  const [pastPurchases, setPastPurchases] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);

  // === ШИНЭ: ХУДАЛДАГЧИЙН STATE-ҮҮД ===
  const [activeProducts, setActiveProducts] = useState([]);
  const [soldProducts, setSoldProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Хэрэглэгчийн мэдээллийг State-д хадгалах
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "{}"),
  );
  const [uploading, setUploading] = useState(false);

  // === ШИНЭ: Header-ээс шидэгдсэн цэсний мэдээлэл байвал түүнийг нээнэ ===
  useEffect(() => {
    if (location.state && location.state.targetTab) {
      setActiveTab(location.state.targetTab);
    }
  }, [location]);
  // =========================================================================

  // Баталгаажуулалтын логик
  const isEmailVerified =
    user.email_verified_at !== null && user.email_verified_at !== undefined;
  const isPhoneVerified =
    user.phone_verified_at !== null && user.phone_verified_at !== undefined;
  const isSeller = user.role === "seller"; // ШИНЭ: Худалдагч мөн эсэхийг шалгах

  // Огноо хөрвүүлэх функц (ШИНЭ)
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("mn-MN");

  // 2. БААЗААС МЭДЭЭЛЭЛ ТАТАХ (Алдааг засаж гадна нь гаргасан хэлбэр)
  const fetchProfileData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/profile/data",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const allOrders = response.data.activeOrders || [];
      setPendingOrders(
        allOrders.filter(
          (o) => o.status === "pending" && o.product?.status !== "sold",
        ),
      );
      // Хянах самбар руу: зөвхөн амжилттай төлөгдсөн, хүргэлтийн барааг хийнэ
      setActiveOrders(
        allOrders.filter((o) =>
          ["paid", "shipping", "delivered"].includes(o.status),
        ),
      );

      setPastPurchases(response.data.pastPurchases || []);
      setPurchaseRequests(response.data.purchaseRequests || []);
      setIncomingRequests(response.data.incomingRequests || []);
      setActiveProducts(response.data.activeProducts || []);
      setSoldProducts(response.data.soldProducts || []);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Профайлын мэдээлэл татахад алдаа гарлаа:", error);
    }
  };

  // Хуудас руу ороход датаг татаж авах хэсэг
  useEffect(() => {
    fetchProfileData();
  }, [navigate]);

  // ЗУРАГ ХУУЛАХ ФУНКЦ
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    const token = localStorage.getItem("token");
    setUploading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/profile/avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // 1. Дэлгэцийн мэдээллийг шинэчлэх
      setUser(response.data.user);
      // 2. LocalStorage шинэчлэх
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success("Профайл зураг шинэчлэгдлээ!");
    } catch (error) {
      console.error("Зураг хуулахад алдаа гарлаа:", error);
      toast.error("Зураг хуулахад алдаа гарлаа.");
    } finally {
      setUploading(false);
    }
  };

  // === ЗУРАГ УСТГАХ ФУНКЦ ===
  const handleDeleteAvatar = async (e) => {
    e.preventDefault(); // Файл сонгох цонх давхар нээгдэхээс сэргийлнэ
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/profile/avatar/delete",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Зураг амжилттай устгагдлаа!");
    } catch (error) {
      console.error("Зураг устгахад алдаа гарлаа:", error);
      toast.error("Алдаа гарлаа.");
    }
  };

  const handleAcceptRequest = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/requests/accept/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Саналыг зөвшөөрлөө! Захиалга үүслээ.");
      fetchProfileData(); // Датаг шинээр татах
    } catch (e) {
      toast.error("Алдаа гарлаа.");
    }
  };

  const handleDeclineRequest = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/requests/decline/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Саналыг татгалзлаа.");
      fetchProfileData(); // Датаг шинэчлэх
    } catch (e) {
      toast.error("Алдаа гарлаа.");
    }
  };

  const handlePayOrder = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/orders/pay/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Төлбөр амжилттай! Бараа таных боллоо.");
      fetchProfileData(); // Датаг шинээр татах
    } catch (e) {
      toast.error("Төлбөр гүйцэтгэхэд алдаа гарлаа.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    localStorage.removeItem("favorites");
    navigate("/");
    window.location.reload();
  };

  // === ШИНЭЧИЛСЭН: ЗАХИАЛГА УСТГАХ ФУНКЦ (Орчин үеийн Toast загвартай) ===
  const handleCancelOrder = (id) => {
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
                Захиалга устгах
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Та энэ захиалгыг устгахдаа итгэлтэй байна уу?
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg transition-colors"
            >
              Болих
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id); // Эхлээд асуусан цонхоо хаана
                const loadingToast = toast.loading("Устгаж байна..."); // Уншиж буй төлөв харуулна

                const token = localStorage.getItem("token");
                try {
                  await axios.delete(`http://127.0.0.1:8000/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  toast.success("Захиалга амжилттай устгагдлаа!", {
                    id: loadingToast,
                  });
                  fetchProfileData(); // Датагаа шинэчилнэ
                } catch (error) {
                  console.error("Захиалга устгахад алдаа гарлаа:", error);
                  toast.error("Алдаа гарлаа.", { id: loadingToast });
                }
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-red-500/20"
            >
              Устгах
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Хэрэглэгч өөрөө товч дартал дэлгэц дээр байсаар байна
        position: "top-center", // Дээд талд голлож гарч ирнэ
        style: {
          padding: "16px",
          borderRadius: "16px",
          background: "var(--bg-surface)", // Танай dark mode-д тааруулж болно (эсвэл "#fff")
        },
      },
    );
  };

  // === ШИНЭ: ХҮСЭЛТ УСТГАХ ФУНКЦ (Орчин үеийн Toast-той) ===
  const handleCancelRequest = (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-[250px]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-red-500 text-2xl">
                campaign
              </span>
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-base">
                Хүсэлт цуцлах
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Илгээсэн үнийн саналаа устгахдаа итгэлтэй байна уу?
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg transition-colors"
            >
              Болих
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const loadingToast = toast.loading("Устгаж байна...");
                const token = localStorage.getItem("token");
                try {
                  await axios.delete(
                    `http://127.0.0.1:8000/api/purchase-requests/${id}`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    },
                  );
                  toast.success("Хүсэлт цуцлагдлаа!", { id: loadingToast });
                  fetchProfileData();
                } catch (error) {
                  toast.error("Алдаа гарлаа.", { id: loadingToast });
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
        style: { padding: "16px", borderRadius: "16px", background: "#fff" },
      },
    );
  };

  // === ИРСЭН ХҮСЭЛТҮҮДЭЭС ӨӨРИЙНХИЙГӨӨ ХАСАХ ===
  const filteredIncomingRequests = incomingRequests.filter(
    (req) => req.user_id !== user?.id,
  );

  // === ДУНДАЖ ҮНЭЛГЭЭ БОДОХ ===
  const averageRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <main className="max-w-7xl mx-auto w-full px-4 py-8 flex flex-col gap-8">
      {/* --- ПРОФАЙЛЫН ТОЛГОЙ ХЭСЭГ --- */}
      <section className="bg-white dark:bg-background-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* ЗУРАГ ХАРАГДАХ БА СОНГОХ ХЭСЭГ */}
            <div className="relative group">
              <input
                type="file"
                id="avatarInput"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
              <label
                htmlFor="avatarInput"
                className="cursor-pointer block relative"
              >
                <div
                  className={`w-32 h-32 rounded-full border-4 border-primary/20 bg-indigo-500 overflow-hidden flex items-center justify-center text-5xl text-white font-bold relative transition-all ${uploading ? "opacity-50" : "hover:border-primary/50 shadow-md"}`}
                >
                  {user.avatar ? (
                    <img
                      className="w-full h-full object-cover"
                      alt="Profile"
                      src={user.avatar}
                    />
                  ) : (
                    <span>
                      {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                    </span>
                  )}

                  {/* Дээгүүр нь хулгана очиход харагдах Камерын icon */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-3xl">
                      photo_camera
                    </span>
                  </div>

                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </label>

              {/* Хэрэв зураг байвал УСТГАХ ТОВЧ харуулна */}
              {user.avatar && (
                <button
                  onClick={handleDeleteAvatar}
                  className="absolute top-0 right-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md hover:bg-red-600 transition-colors z-10"
                  title="Зураг устгах"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    delete
                  </span>
                </button>
              )}
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 border-4 border-white dark:border-background-dark rounded-full"></div>
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white capitalize">
                {user.name || "Хэрэглэгч"}
              </h1>
              <p className="flex items-center justify-center md:justify-start gap-1 text-slate-500 dark:text-slate-400 mt-1">
                <span className="material-symbols-outlined text-sm">mail</span>
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 w-full xl:w-auto mt-4 xl:mt-0">
            {user.role === "seller" && (
              <Link
                to="/add-listing"
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-xl">
                  add_circle
                </span>
                Зар оруулах
              </Link>
            )}

            <Link
              to="/edit-profile"
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
              Профайл засах
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all border border-red-100 dark:border-red-800/50"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              Гарах
            </button>
          </div>
        </div>
      </section>

      {/* --- ИДЭВХТЭЙ ЗАХИАЛГУУДЫН ХЯНАХ САМБАР (3 Алхамтай) --- */}
      {activeOrders && activeOrders.length > 0 && (
        <div className="flex flex-col gap-6">
          {activeOrders.map((order) => (
            <section
              key={order.id}
              className="bg-white dark:bg-background-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">
                      local_shipping
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Идэвхтэй захиалга: #{order.id}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {order.product?.title || "Бараа"} •{" "}
                      {order.total_price?.toLocaleString()}₮
                    </p>
                  </div>
                </div>
                <Link
                  to={`/order-detail/${order.id}`}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Дэлгэрэнгүй
                </Link>
              </div>

              {/* Хүргэлтийн төлөв харуулах Progress Bar (3 алхамтай) */}
              <div className="relative mt-8 mb-4 px-2 md:px-8">
                <div className="absolute left-0 top-6 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full z-0"></div>

                <div
                  className="absolute left-0 top-6 h-1.5 bg-[#0ea5e9] rounded-full transition-all duration-1000 z-0"
                  style={{
                    width:
                      order.status === "paid"
                        ? "0%"
                        : order.status === "shipping"
                          ? "50%"
                          : order.status === "delivered"
                            ? "100%"
                            : "0%",
                  }}
                ></div>

                <div className="relative flex justify-between z-10">
                  {[
                    { id: "paid", label: "Төлөгдсөн", icon: "receipt_long" },
                    {
                      id: "shipping",
                      label: "Хүргэлтэнд гарсан",
                      icon: "inventory_2",
                    },
                    {
                      id: "delivered",
                      label: "Хүргэгдсэн",
                      icon: "check_circle",
                    },
                  ].map((step, index) => {
                    const stepOrder = ["paid", "shipping", "delivered"];
                    const currentIndex = stepOrder.indexOf(
                      order.status || "paid",
                    );
                    const isActive = index <= currentIndex;

                    return (
                      <div
                        key={step.id}
                        className="flex flex-col items-center gap-3 bg-white dark:bg-background-dark px-2"
                      >
                        <div
                          className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-colors duration-500 ${isActive ? "bg-[#0ea5e9] border-white dark:border-background-dark text-white shadow-md" : "bg-slate-50 dark:bg-surface-dark border-slate-200 dark:border-slate-700 text-slate-400"}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {step.icon}
                          </span>
                        </div>
                        <span
                          className={`text-xs md:text-sm font-bold ${isActive ? "text-slate-900 dark:text-white" : "text-slate-400"}`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* --- СТАТИСТИК ХЭСЭГ --- */}
      <section
        className={`grid grid-cols-1 gap-4 ${isSeller ? "md:grid-cols-3" : "md:grid-cols-2"}`}
      >
        <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <p className="text-3xl font-bold text-primary">
            {pastPurchases.length}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Нийт худалдан авалт
          </p>
        </div>

        <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <p className="text-3xl font-bold text-primary">
            {purchaseRequests.length}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Илгээсэн хүсэлт
          </p>
        </div>

        {/* ЗӨВХӨН ХУДАЛДАГЧИД ГУРАВ ДАХЬ БОКС ХАРАГДАНА */}
        {isSeller && (
          <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <p className="text-3xl font-bold text-primary">{averageRating}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Дундаж үнэлгээ{" "}
              {reviews.length > 0 && (
                <span className="text-xs">({reviews.length})</span>
              )}
            </p>
          </div>
        )}
      </section>

      {/* --- БАТАЛГААЖУУЛАЛТ ХЭСЭГ --- */}
      <section className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            verified_user
          </span>
          Баталгаажуулалт
        </h3>
        <div className="flex flex-wrap gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isEmailVerified ? "bg-green-50 border-green-100" : "bg-orange-50 border-orange-100"}`}
          >
            <span
              className={`material-symbols-outlined text-lg ${isEmailVerified ? "text-green-600" : "text-orange-500"}`}
            >
              {isEmailVerified ? "check_circle" : "warning"}
            </span>
            <span
              className={`text-sm font-medium ${isEmailVerified ? "text-green-700" : "text-orange-700"}`}
            >
              {isEmailVerified ? "Имэйл баталгаажсан" : "Имэйл баталгаажаагүй"}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isPhoneVerified ? "bg-green-50 border-green-100" : "bg-orange-50 border-orange-100"}`}
          >
            <span
              className={`material-symbols-outlined text-lg ${isPhoneVerified ? "text-green-600" : "text-orange-500"}`}
            >
              {isPhoneVerified ? "check_circle" : "warning"}
            </span>
            <span
              className={`text-sm font-medium ${isPhoneVerified ? "text-green-700" : "text-orange-700"}`}
            >
              {isPhoneVerified ? "Утас баталгаажсан" : "Утас баталгаажаагүй"}
            </span>
          </div>
        </div>
      </section>

      {/* --- ТАБУУД БОЛОН ЖАГСААЛТ --- */}
      <section className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab("purchases")}
            className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all ${activeTab === "purchases" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-slate-500 hover:text-primary"}`}
          >
            Худалдан авалт ({pastPurchases.length})
          </button>
          <button
            onClick={() => setActiveTab("pending_orders")}
            className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all ${activeTab === "pending_orders" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-slate-500 hover:text-primary"}`}
          >
            Захиалга ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all ${activeTab === "requests" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-slate-500 hover:text-primary"}`}
          >
            Илгээсэн хүсэлт ({purchaseRequests.length})
          </button>

          {/* ЗӨВХӨН ХУДАЛДАГЧИД ХАРАГДАХ ЦЭСНҮҮД === */}
          {isSeller && (
            <>
              {/* Шинээр нэмсэн ИРСЭН ХҮСЭЛТ ТОВЧ (Шүүгдсэн тоо) */}
              <button
                onClick={() => setActiveTab("incoming_requests")}
                className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all ${activeTab === "incoming_requests" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-slate-500 hover:text-primary"}`}
              >
                Ирсэн хүсэлт ({filteredIncomingRequests.length})
              </button>
              <button
                onClick={() => setActiveTab("active_products")}
                className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all ${activeTab === "active_products" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-slate-500 hover:text-primary"}`}
              >
                Миний зарууд ({activeProducts.length})
              </button>
              <button
                onClick={() => setActiveTab("sold_products")}
                className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all ${activeTab === "sold_products" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-slate-500 hover:text-primary"}`}
              >
                Зарагдсан түүх ({soldProducts.length})
              </button>
            </>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-background-dark min-h-[400px]">
          {/* === 1. ХУДАЛДАН АВАЛТ (Кард хэлбэрээр) === */}
          {activeTab === "purchases" &&
            (pastPurchases.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
                {pastPurchases.map((item) => (
                  <Link
                    key={item.id}
                    // ШИНЭ: Барааны дэлгэрэнгүй рүү шилжих
                    to={`/product-detail/${item.product?.id || item.product_id}`}
                    className="group bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900 overflow-hidden w-full">
                      <img
                        src={item.product?.img || "/placeholder.jpg"}
                        alt="Бараа"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-[10px] px-2 py-1 rounded font-bold uppercase shadow-md">
                        {item.status === "delivered"
                          ? "Хүргэгдсэн"
                          : "Төлөгдсөн"}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {item.product?.title || "Бараа"}
                      </h3>
                      {/* ҮНЭ ХАРУУЛАХ ХЭСЭГ: Санал болгосон эсвэл үндсэн үнэ нь байна */}
                      <p className="text-lg font-black text-primary mb-3">
                        {item.total_price?.toLocaleString()} ₮
                      </p>
                      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <p className="text-base font-black text-primary">
                          {item.total_price?.toLocaleString()}₮
                        </p>
                        <span className="text-xs text-slate-400">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-50">
                  shopping_bag
                </span>
                <p>Худалдан авалтын түүх хоосон байна.</p>
              </div>
            ))}

          {/* === 2. ЗАХИАЛГА (Төлөх хүлээгдэж буй + Бусдад алдсан) === */}
          {activeTab === "pending_orders" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
              {pendingOrders.map((order) => {
                const isSold =
                  order.product?.status === "sold" ||
                  order.status === "sold_to_other" ||
                  order.status === "cancelled";

                return (
                  <Link
                    key={order.id}
                    to={
                      isSold
                        ? "#"
                        : `/product-detail/${order.product_id || order.product?.id}`
                    }
                    onClick={(e) => {
                      if (isSold) e.preventDefault();
                    }}
                    className={`group rounded-xl border flex flex-col overflow-hidden transition-all shadow-sm ${isSold ? "bg-slate-50 border-slate-300 opacity-80 cursor-default" : "bg-white dark:bg-slate-800 border-blue-200 hover:shadow-lg"}`}
                  >
                    <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img
                        src={order.product?.img || "/placeholder.jpg"}
                        alt="Бараа"
                        className={`w-full h-full object-cover transition-transform duration-500 ${isSold ? "grayscale" : "group-hover:scale-105"}`}
                      />
                      {isSold ? (
                        <div className="absolute inset-0 z-10 bg-slate-900/40 flex items-center justify-center">
                          <span className="bg-slate-800 text-white font-black px-4 py-1 rounded-full uppercase tracking-widest transform -rotate-12 border-2 border-white/20 shadow-xl">
                            ЗАРАГДСАН
                          </span>
                        </div>
                      ) : (
                        <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-[10px] px-2 py-1 rounded font-bold uppercase shadow-md">
                          Төлбөр хүлээгдэж буй
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h3
                        className={`font-bold line-clamp-1 mb-1 ${isSold ? "text-slate-500" : "dark:text-white"}`}
                      >
                        {order.product?.title}
                      </h3>

                      {/* ҮНЭ ХАРУУЛАХ ХЭСЭГ */}
                      <p className="text-lg font-black text-primary mb-3">
                        {order.total_price?.toLocaleString()} ₮
                      </p>

                      <div className="mt-auto flex gap-2">
                        {isSold ? (
                          <button
                            disabled
                            className="w-full py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold rounded-lg cursor-not-allowed"
                          >
                            Өөр хүн худалдаж авсан
                          </button>
                        ) : (
                          <>
                            {/* БАТАЛГААЖУУЛАХ ТОВЧ */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(
                                  `/checkout/${order.product_id || order.product?.id}`,
                                  {
                                    state: {
                                      existingOrderId: order.id,
                                      totalAmount: order.total_price,
                                      product: order.product,
                                    },
                                  },
                                );
                              }}
                              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-sm flex justify-center items-center gap-1 text-xs sm:text-sm"
                            >
                              Баталгаажуулах
                            </button>

                            {/* УСТГАХ ТОВЧ */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleCancelOrder(order.id);
                              }}
                              className="px-3 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 font-bold rounded-lg transition-all border border-red-100 dark:border-red-800 flex items-center justify-center"
                              title="Захиалга устгах"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                delete
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
              {pendingOrders.length === 0 && (
                <p className="col-span-full text-center py-20 text-slate-400">
                  Төлбөр төлөх захиалга алга.
                </p>
              )}
            </div>
          )}

          {/* === 3. ИЛГЭЭСЭН ХҮСЭЛТ === */}
          {activeTab === "requests" &&
            (purchaseRequests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
                {purchaseRequests.map((req) => {
                  const isSold =
                    req.product?.status === "sold" ||
                    req.status === "sold_to_other";
                  const isDeclined = req.status === "declined";
                  const isDisabled = isSold || isDeclined;

                  return (
                    <Link
                      key={req.id}
                      to={
                        isDisabled ? "#" : `/product-detail/${req.product_id}`
                      }
                      className={`group rounded-xl border overflow-hidden transition-all flex flex-col ${isDisabled ? "bg-slate-50 border-slate-300 opacity-80 cursor-default" : "bg-white dark:bg-slate-800 border-gray-200 hover:shadow-lg"}`}
                    >
                      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900 overflow-hidden w-full">
                        <img
                          src={req.product?.img || "/placeholder.jpg"}
                          alt="Бараа"
                          className={`w-full h-full object-cover transition-transform duration-500 ${isDisabled ? "grayscale" : "group-hover:scale-105"}`}
                        />
                        {isSold ? (
                          <div className="absolute inset-0 z-10 bg-slate-900/40 flex items-center justify-center">
                            <span className="bg-slate-800 text-white font-black px-4 py-1 rounded-full uppercase tracking-widest transform -rotate-12 border-2 border-white/20 shadow-xl">
                              ЗАРАГДСАН
                            </span>
                          </div>
                        ) : isDeclined ? (
                          <div className="absolute inset-0 z-10 bg-red-900/40 flex items-center justify-center">
                            <span className="bg-red-600 text-white font-black px-4 py-1 rounded-full uppercase tracking-widest transform -rotate-12 border-2 border-white/20 shadow-xl">
                              ТАТГАЛЗСАН
                            </span>
                          </div>
                        ) : (
                          <div
                            className={`absolute top-2 right-2 z-10 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase shadow-md ${req.status === "pending" ? "bg-orange-500" : "bg-blue-500"}`}
                          >
                            {req.status === "pending"
                              ? "Хүлээгдэж буй"
                              : req.status === "accepted"
                                ? "Зөвшөөрсөн"
                                : req.status}
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3
                          className={`font-bold line-clamp-1 mb-3 ${isDisabled ? "text-slate-500" : "text-slate-900 dark:text-white"}`}
                        >
                          {req.product?.title || "Бараа олдсонгүй"}
                        </h3>
                        <div
                          className={`mt-auto p-3 rounded-lg flex items-center justify-between border ${isDisabled ? "bg-slate-100 border-slate-200" : "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30"}`}
                        >
                          <span
                            className={`text-xs font-bold ${isDisabled ? "text-slate-500" : "text-orange-600 dark:text-orange-400"}`}
                          >
                            Таны санал:
                          </span>
                          <p
                            className={`text-base font-black ${isDisabled ? "text-slate-500" : "text-orange-600 dark:text-orange-400"}`}
                          >
                            {req.offered_price?.toLocaleString()}₮
                          </p>
                        </div>

                        {/* ХҮСЭЛТ УСТГАХ ТОВЧ (Бүх төлөвт харагдана, түүхээс цэвэрлэх) */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleCancelRequest(req.id);
                          }}
                          className="mt-3 w-full py-2 bg-red-50 dark:bg-red-900/10 text-red-500 border border-red-100 dark:border-red-800/30 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                          Устгах
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-50">
                  send
                </span>
                <p>Илгээсэн хүсэлт одоогоор алга.</p>
              </div>
            ))}

          {/* === 3. ИРСЭН ХҮСЭЛТҮҮД (Худалдагч) === */}
          {activeTab === "incoming_requests" &&
            (filteredIncomingRequests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
                {filteredIncomingRequests.map((req) => {
                  const isSold =
                    req.product?.status === "sold" ||
                    req.status === "sold_to_other";
                  const isDeclined = req.status === "declined";
                  const isDisabled = isSold || isDeclined;

                  return (
                    <Link
                      key={req.id}
                      to={`/product-detail/${req.product?.id || req.product_id}`} // Дархад бараа руу шилжих
                      className={`group rounded-xl border overflow-hidden flex flex-col transition-all ${isDisabled ? "bg-slate-50 border-slate-300 opacity-80" : "bg-white dark:bg-slate-800 border-emerald-200 shadow-sm hover:shadow-lg"}`}
                    >
                      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900 overflow-hidden w-full">
                        <img
                          src={req.product?.img || "/placeholder.jpg"}
                          alt="Бараа"
                          className={`w-full h-full object-cover transition-transform duration-500 ${isDisabled ? "grayscale" : "group-hover:scale-105"}`}
                        />

                        {/* ТӨЛӨВ ХАРУУЛАХ BADGE */}
                        {isSold && (
                          <div className="absolute inset-0 z-10 bg-slate-900/40 flex items-center justify-center">
                            <span className="bg-slate-800 text-white font-black px-4 py-1 rounded-full uppercase tracking-widest transform -rotate-12 border-2 border-white/20 shadow-xl">
                              ЗАРАГДСАН
                            </span>
                          </div>
                        )}
                        {isDeclined && (
                          <div className="absolute inset-0 z-10 bg-red-900/40 flex items-center justify-center">
                            <span className="bg-red-600 text-white font-black px-4 py-1 rounded-full uppercase tracking-widest transform -rotate-12 border-2 border-white/20 shadow-xl">
                              ТАТГАЛЗСАН
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3 pt-10 z-20">
                          <span className="text-white/80 text-xs font-medium">
                            Илгээгч:
                          </span>
                          <p className="text-white font-bold truncate">
                            {req.user?.name ||
                              req.user?.email ||
                              "Худалдан авагч"}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <h3
                          className={`font-bold line-clamp-1 mb-3 ${isDisabled ? "text-slate-500" : "text-slate-900 dark:text-white"}`}
                        >
                          {req.product?.title || "Устгагдсан бараа"}
                        </h3>
                        <div
                          className={`mb-4 flex items-center justify-between p-2 rounded-lg border ${isDisabled ? "bg-slate-100 border-slate-200" : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30"}`}
                        >
                          <span
                            className={`text-xs font-bold ${isDisabled ? "text-slate-500" : "text-emerald-700 dark:text-emerald-400"}`}
                          >
                            Санал:
                          </span>
                          <span
                            className={`font-black text-base ${isDisabled ? "text-slate-500" : "text-emerald-600 dark:text-emerald-400"}`}
                          >
                            {req.offered_price?.toLocaleString()}₮
                          </span>
                        </div>

                        {/* ЗӨВХӨН ИДЭВХТЭЙ ҮЕД ТОВЧЛУУР ХАРУУЛНА */}
                        {!isDisabled && (
                          <div className="mt-auto flex gap-2">
                            {req.status === "pending" ? (
                              <button
                                onClick={(e) => {
                                  e.preventDefault(); // Link рүү шилжихийг зогсооно
                                  handleAcceptRequest(req.id);
                                }}
                                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                              >
                                Зөвшөөрөх
                              </button>
                            ) : (
                              <div className="flex-1 py-2 text-center rounded-lg text-[10px] font-bold uppercase border bg-blue-50 text-blue-600 border-blue-200">
                                ЗӨВШӨӨРСӨН
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.preventDefault(); // Link рүү шилжихийг зогсооно
                                handleDeclineRequest(req.id);
                              }}
                              className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-red-500 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
                            >
                              Татгалзах
                            </button>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-50">
                  mark_email_unread
                </span>
                <p>Танд ирсэн үнийн санал одоогоор алга байна.</p>
              </div>
            ))}

          {/* === 4. ИДЭВХТЭЙ ЗАРУУД === */}
          {activeTab === "active_products" &&
            (activeProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
                {activeProducts.map((prod) => (
                  <Link
                    key={prod.id}
                    to={`/product-detail/${prod.id}`}
                    className="group bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900 overflow-hidden w-full">
                      {prod.isVerified === 1 && (
                        <div className="absolute top-2 left-2 z-10 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded font-bold shadow-md">
                          БАТАЛГААЖСАН
                        </div>
                      )}
                      <img
                        src={prod.img}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-xs text-slate-400 mb-1">
                        {prod.category_name}
                      </p>
                      <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {prod.title}
                      </h3>
                      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <p className="text-base font-black text-primary">
                          {prod.price}
                        </p>
                        <span className="text-xs text-slate-400">
                          {formatDate(prod.created_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-50">
                  inventory_2
                </span>
                <p>Танд одоогоор идэвхтэй зар алга байна.</p>
                <Link
                  to="/add-listing"
                  className="mt-4 text-primary font-bold hover:underline"
                >
                  Зар оруулах
                </Link>
              </div>
            ))}

          {/* === 5. ЗАРАГДСАН ТҮҮХ === */}
          {activeTab === "sold_products" &&
            (soldProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
                {soldProducts.map((prod) => (
                  <Link
                    key={prod.id}
                    to={`/product-detail/${prod.id}`} // Бараа руу үсрэх
                    className="relative group bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col opacity-80 grayscale-[30%] hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="absolute inset-0 z-20 bg-slate-900/10 flex items-center justify-center pointer-events-none">
                      <span className="bg-slate-800 text-white font-black px-4 py-1 rounded-full uppercase tracking-widest transform -rotate-12 border-2 border-white/20 shadow-xl">
                        ЗАРАГДСАН
                      </span>
                    </div>
                    <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900 overflow-hidden w-full">
                      <img
                        src={prod.img}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                        {prod.title}
                      </h3>
                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <p className="text-base font-bold text-slate-500 line-through">
                          {prod.price}
                        </p>
                        <span className="text-xs text-slate-400">
                          {formatDate(prod.created_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-50">
                  history
                </span>
                <p>Зарагдсан түүх алга байна.</p>
              </div>
            ))}
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;
