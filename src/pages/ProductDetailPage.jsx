import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, favorites } = useAppContext();

  // === ҮНДСЭН STATE-ҮҮД ===
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // === ЗУРАГ БОЛОН ҮЗҮҮЛЭЛТ ===
  const [mainImage, setMainImage] = useState("");
  const [productImages, setProductImages] = useState([]);
  const [productSpecs, setProductSpecs] = useState({});

  // === ҮНИЙН САНАЛ & БАТАЛГААЖУУЛАЛТ ===
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offeredPrice, setOfferedPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // === HOVER ZOOM ===
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });
  const imageRef = useRef(null);

  // === ЭЗЭН МӨН ЭСЭХИЙГ ШАЛГАХ ===
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isOwner = currentUser && product && currentUser.id === product.user_id;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/products/${id}`,
        );

        const prodData = response.data.product;
        setProduct(prodData);
        setRelatedProducts(response.data.related || []);
        setMainImage(prodData.img);

        let gallery = [];
        if (prodData.images) {
          gallery =
            typeof prodData.images === "string"
              ? JSON.parse(prodData.images)
              : prodData.images;
        } else {
          gallery = [prodData.img];
        }
        setProductImages(gallery);

        if (prodData.specs) {
          setProductSpecs(
            typeof prodData.specs === "string"
              ? JSON.parse(prodData.specs)
              : prodData.specs,
          );
        }

        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Алдаа гарлаа:", error);
        toast.error("Барааны мэдээлэл олдсонгүй.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAuthCheck = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Та эхлээд нэвтэрч орно уу!", {
        style: {
          borderRadius: "10px",
          background: "#EF4444",
          color: "#fff",
          fontWeight: "bold",
        },
      });
      return false;
    }
    return true;
  };

  const handleAddToCart = (e, prodToAdd = product) => {
    e.preventDefault();
    if (handleAuthCheck()) addToCart(prodToAdd);
  };

  const handleToggleFavorite = (e, prodToToggle = product) => {
    e.preventDefault();
    if (handleAuthCheck()) toggleFavorite(prodToToggle);
  };

  // === ШИНЭЧИЛСЭН: БАРАА УСТГАХ (Toast) ===
  const handleDelete = () => {
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
                Зарыг устгах
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Та энэ барааг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах
                боломжгүй!
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
                toast.dismiss(t.id);
                const loadingToast = toast.loading("Устгаж байна...");
                const token = localStorage.getItem("token");
                try {
                  await axios.delete(
                    `http://127.0.0.1:8000/api/products/${product.id}`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    },
                  );
                  toast.success("Бараа амжилттай устгагдлаа!", {
                    id: loadingToast,
                  });
                  navigate(`/profile`); // Амжилттай устгавал профайл руу буцна
                } catch (error) {
                  toast.error("Устгах үед алдаа гарлаа.", { id: loadingToast });
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

  // === ШИНЭ: БАТАЛГААЖУУЛАЛТЫН ХҮСЭЛТ ЖИНХЭНЭЭР ИЛГЭЭХ ===
  const handleVerificationSubmit = async () => {
    setIsVerifying(true);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/verification-requests",
        { product_id: product.id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(response.data.message, { duration: 4000 });
      setIsVerifyModalOpen(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Хүсэлт илгээхэд алдаа гарлаа.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!offeredPrice || isNaN(offeredPrice) || Number(offeredPrice) <= 0) {
      toast.error("Зөв үнийн дүн оруулна уу!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/purchase-requests",
        { product_id: product.id, offered_price: offeredPrice },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(response.data.message, {
        style: {
          borderRadius: "10px",
          background: "#10B981",
          color: "#fff",
          fontWeight: "bold",
        },
      });
      setIsOfferModalOpen(false);
      setOfferedPrice("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Алдаа гарлаа, дахин оролдоно уу.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // === ЗАССАН: ХУДАЛДАГЧ РУУ АНХНЫ ЧАТ ИЛГЭЭХ (ГАЦАХГҮЙ) ===
  const startChat = (e) => {
    e.preventDefault();
    if (!handleAuthCheck()) return;

    if (isOwner) {
      toast.error("Та өөрийнхөө бараа руу зурвас бичих боломжгүй.");
      return;
    }

    const token = localStorage.getItem("token");

    // 1. Арын фононд мессежээ илгээх (Хүлээх шаардлагагүй!)
    axios
      .post(
        "http://127.0.0.1:8000/api/chat/send",
        {
          receiver_id: product.user_id,
          message: `Сайн байна уу? "${product.title}" барааны талаар сонирхож байна.`,
          product_id: product.id,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .catch(() => {});

    // 2. Шууд 0 секундэд Чат хуудас руу үсрэх ба хэнтэй чатлахаа автоматаар сонгох
    navigate("/chat", { state: { autoSelectUser: product.user } });
  };

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const { left, top, width, height } =
      imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundImage: `url(${mainImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: "250%",
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  const calculateShipping = () => {
    if (!product) return "Тооцоолох боломжгүй";
    let baseCost = 10000;
    if (product.weight) baseCost += Math.ceil(product.weight) * 1000;
    if (product.size_category === "large") baseCost += 15000;
    else if (product.size_category === "medium") baseCost += 5000;

    if (product.isVerified) {
      const maxCost = baseCost + 10000;
      return (
        <span>
          {baseCost.toLocaleString()}₮ - {maxCost.toLocaleString()}₮{" "}
          <span className="text-emerald-500 font-bold ml-1">(Баталгаат)</span>
        </span>
      );
    }
    return `${baseCost.toLocaleString()}₮`;
  };

  if (loading)
    return (
      <div className="flex-1 flex justify-center items-center py-40 text-slate-500">
        Уншиж байна...
      </div>
    );
  if (!product)
    return (
      <div className="flex-1 flex justify-center items-center py-40 text-slate-500">
        Бараа олдсонгүй
      </div>
    );

  const isFavorited = favorites.find((f) => f.id === product.id);
  const hasSpecs = Object.keys(productSpecs).length > 0;

  return (
    <main className="flex-1 px-4 md:px-10 py-5 w-full max-w-[1440px] mx-auto relative font-sans">
      <div className="flex flex-wrap items-center gap-2 pb-6 text-sm">
        <Link
          to="/"
          className="text-slate-500 dark:text-slate-400 font-medium hover:text-primary transition-colors"
        >
          Нүүр
        </Link>
        <span className="text-slate-400 dark:text-slate-600 material-symbols-outlined text-[16px]">
          chevron_right
        </span>
        <Link
          to={`/products?category=${product.category_name}`}
          className="text-slate-500 dark:text-slate-400 font-medium hover:text-primary transition-colors"
        >
          {product.category_name || "Ангилал"}
        </Link>
        <span className="text-slate-400 dark:text-slate-600 material-symbols-outlined text-[16px]">
          chevron_right
        </span>
        <span className="text-slate-900 dark:text-white font-bold">
          {product.title}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
        <div className="lg:col-span-7 flex flex-col gap-4 relative">
          <div
            ref={imageRef}
            className="w-full bg-white dark:bg-slate-800/50 rounded-2xl overflow-hidden aspect-[4/3] shadow-sm relative cursor-crosshair border border-slate-100 dark:border-slate-700/50"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={mainImage}
              alt={product.title}
              className="w-full h-full object-contain transition-opacity duration-300"
            />
            <div
              className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
              style={zoomStyle}
            ></div>
            <div className="absolute right-4 bottom-4 p-2 bg-white/90 dark:bg-slate-900/90 rounded-full shadow-lg text-primary pointer-events-none opacity-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">zoom_in</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {productImages.map((imgUrl, index) => (
              <button
                key={index}
                onClick={() => setMainImage(imgUrl)}
                className={`aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all bg-white dark:bg-slate-800 ${mainImage === imgUrl ? "border-primary shadow-md opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                <img
                  src={imgUrl}
                  alt={`Тайлбар ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${product.isVerified ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"}`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {product.isVerified ? "verified" : "info"}
              </span>
              {product.isVerified ? "Баталгаажсан:" : "Баталгаажаагүй:"}{" "}
              {product.condition || "Тодорхойгүй"}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleAddToCart(e, product)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                title="Сагсанд нэмэх"
              >
                <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary transition-colors">
                  add_shopping_cart
                </span>
              </button>
              <button
                onClick={(e) => handleToggleFavorite(e, product)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                title="Хадгалах"
              >
                <span
                  className={`material-symbols-outlined text-2xl transition-colors ${isFavorited ? "fill-red-500 text-red-500" : "text-slate-400 group-hover:text-red-400"}`}
                >
                  favorite
                </span>
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-3">
              {product.title}
            </h1>
            <div className="flex items-center text-xs text-slate-400 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-[16px] mr-1">
                schedule
              </span>
              Нийтлэгдсэн:{" "}
              {new Date(product.created_at).toLocaleDateString("mn-MN")}
            </div>
            {product.description && (
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          <div className="p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-lg">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {product.price}
              </span>
            </div>

            <div className="flex flex-col gap-1 mb-6 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined text-[18px] text-slate-400 mt-0.5">
                  local_shipping
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    Хүргэлтийн тооцоо:
                  </span>
                  <span>{calculateShipping()}</span>
                  <span className="text-xs text-slate-400 mt-1">
                    Овор хэмжээ:{" "}
                    {product.size_category === "large"
                      ? "Том"
                      : product.size_category === "medium"
                        ? "Дунд"
                        : "Жижиг"}{" "}
                    | Жин: {product.weight || 0}кг
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {isOwner ? (
                <>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg mb-2">
                    <p className="text-xs text-amber-600 dark:text-amber-400 text-center font-medium">
                      Энэ бол таны оруулсан зар тул танд худалдаж авах сонголт
                      харагдахгүй.
                    </p>
                  </div>

                  {product.status === "sold" ? (
                    <div className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-center font-black rounded-xl border-2 border-slate-200 dark:border-slate-700 uppercase tracking-widest">
                      БАРАА ЗАРАГДСАН БАЙНА
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate(`/edit-listing/${product.id}`)}
                        className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          edit
                        </span>{" "}
                        Зараа засах
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full h-12 bg-white dark:bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          delete
                        </span>{" "}
                        Зарыг устгах
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* === БАРАА ЗАРАГДСАН ЭСЭХИЙГ ШАЛГАХ === */}
                  {product.status === "sold" ? (
                    <div className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-center font-black rounded-xl border-2 border-slate-200 dark:border-slate-700 cursor-not-allowed uppercase tracking-widest">
                      ЭНЭ БАРАА ЗАРАГДСАН БАЙНА
                    </div>
                  ) : (
                    <>
                      {/* ҮРГЭЛЖ ХАРАГДАХ: ЗАХИАЛГА ҮҮСГЭХ ТОВЧ (Хуучин логикийг буцааж сэргээв) */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (handleAuthCheck())
                            navigate(`/checkout/${product.id}`); // Хуучин зөв байсан Checkout хуудас руугаа үсэрнэ
                        }}
                        className="w-full h-14 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-500/20 active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          shopping_bag
                        </span>{" "}
                        Захиалга үүсгэх
                      </button>

                      {/* ЗӨВХӨН БАТАЛГААЖААГҮЙ ҮЭД ХАРАГДАХ: АДМИНААР ШАЛГУУЛАХ ТОВЧ */}
                      {product.isVerified === 0 && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (handleAuthCheck()) setIsVerifyModalOpen(true);
                          }}
                          className="w-full h-12 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-amber-200 dark:border-amber-800/50"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            gavel
                          </span>{" "}
                          Админаар шалгуулах
                        </button>
                      )}

                      {/* ҮНИЙН САНАЛ ИЛГЭЭХ */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (handleAuthCheck()) setIsOfferModalOpen(true);
                        }}
                        className="w-full h-12 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-slate-600"
                      >
                        <span className="material-symbols-outlined text-[20px] text-primary">
                          campaign
                        </span>{" "}
                        Үнийн санал илгээх
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/50">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                Худалдагчийн мэдээлэл
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link
                    to={`/seller-profile/${product.user_id}`}
                    className="relative"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-black text-lg hover:ring-2 hover:ring-primary transition-all uppercase">
                      {product.user?.name
                        ? product.user.name.substring(0, 2)
                        : "VT"}
                    </div>
                  </Link>
                  <div>
                    <Link
                      to={`/seller-profile/${product.user_id}`}
                      className="block text-base font-bold text-slate-900 dark:text-white hover:text-primary transition-colors"
                    >
                      {product.user?.name || "Тодорхойгүй Худалдагч"}
                    </Link>
                  </div>
                </div>
                <button
                  onClick={startChat}
                  className="text-sm font-bold text-[#0ea5e9] hover:text-[#0284c7] transition-colors"
                >
                  Зурвас бичих
                </button>
              </div>
            </div>
          </div>

          {hasSpecs && (
            <div className="p-6 bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm mt-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  info
                </span>{" "}
                Нарийвчилсан үзүүлэлт
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                {Object.entries(productSpecs).map(([key, value], index) => (
                  <div
                    key={index}
                    className="flex flex-col border-b border-slate-100 dark:border-slate-700/50 pb-2 last:border-0 sm:last:border-b sm:[&:nth-last-child(2)]:border-0"
                  >
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                      {key}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
            Танд таалагдаж магадгүй
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <Link
                key={relProduct.id}
                to={`/product-detail/${relProduct.id}`}
                className="group relative flex flex-col bg-white dark:bg-surface-dark rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-white dark:bg-gray-800 p-4">
                  <img
                    alt={relProduct.title}
                    className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                    src={relProduct.img}
                  />
                  {relProduct.isVerified === 1 && (
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-white/90 dark:bg-surface-dark/90 text-emerald-600 rounded-md flex items-center gap-1 shadow-sm border border-emerald-100/50">
                        <span className="material-symbols-outlined text-sm">
                          verified
                        </span>{" "}
                        Баталгаажсан
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1 gap-2 border-t border-slate-50 dark:border-slate-800/50">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {relProduct.title}
                  </h3>
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <p className="text-base font-black text-slate-900 dark:text-white">
                      {relProduct.price}
                    </p>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(e, relProduct);
                      }}
                      className="text-primary hover:text-white p-2 rounded-lg hover:bg-primary transition-colors active:scale-95 bg-primary/10"
                    >
                      <span className="material-symbols-outlined text-sm">
                        add_shopping_cart
                      </span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Үнийн санал илгээх
              </h3>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="text-slate-400 hover:text-red-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleOfferSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Таны санал болгох үнэ (MNT)
                </label>
                <input
                  type="number"
                  required
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                  placeholder="Жишээ нь: 150000"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? "Илгээж байна..." : "Илгээх"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-amber-500 text-3xl">
                  gavel
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Админаар шалгуулах
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Энэхүү барааг манай мэргэжилтнүүд шалгаж, баталгаажуулах хүртэл
                та хүлээх шаардлагатай. Хүсэлт илгээх үү?
              </p>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setIsVerifyModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
              >
                Болих
              </button>
              <button
                type="button"
                onClick={handleVerificationSubmit}
                disabled={isVerifying}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-md"
              >
                {isVerifying ? "Илгээж байна..." : "Зөвшөөрөх"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductDetailPage;
