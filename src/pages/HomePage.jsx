import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const HomePage = () => {
  const navigate = useNavigate();

  // === ХАЙЛТЫН STATE-ҮҮД ===
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

 // === ШИНЭ: СҮҮЛД НЭМЭГДСЭН БАРАА ТАТАХ БОЛОН ГҮЙЛГЭХ (SLIDER) ===
  const [recentProducts, setRecentProducts] = useState([]);
  const sliderRef = useRef(null); // Слайдерыг удирдах Ref

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const res = await api.get("/products");
        const data = res.data.data || res.data;
        setRecentProducts(data.slice(0, 12)); // Гүйлгэж харахын тулд 12 бараа татна
      } catch (error) {
        console.error("Сүүлд нэмэгдсэн бараа татахад алдаа гарлаа", error);
      }
    };
    fetchRecentProducts();
  }, []);

  // Зүүн тийш гүйлгэх функц
  const slideLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  // Баруун тийш гүйлгэх функц
  const slideRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  // Бичих тоолонд санал болгох үгсийг татах
  const handleSearchInput = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length > 1) {
      try {
        const res = await api.get(
          `/search-suggestions?q=${value}`
        );
        setSuggestions(res.data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Санал болгох үг татахад алдаа гарлаа", error);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Хайх товч эсвэл Enter дарах үед ProductsPage рүү шилжих
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Санал болгосон үгэн дээр дарж шууд бараа руу орох
  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    setSearchQuery("");
    navigate(`/product-detail/${productId}`);
  };

  return (
    <main className="flex-grow flex flex-col">
      {/* Hero Section (Толгой хэсэг) */}
      <div className="relative bg-surface-dark overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 to-background-dark/40 z-10"></div>
          {/* Энд ажилладаг зураг орууллаа */}
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1920')",
            }}
          ></div>
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col justify-center min-h-[500px]">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Хуучин хөгжмийн зэмсгийн{" "}
              <span className="text-primary">хамгийн том</span> зах зээл
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl font-light">
              Та хөгжмөө зарах эсвэл шинэ хөгжим худалдаж авахыг хүсэж байна уу?
              Монголын өнцөг булан бүрээс хөгжим сонирхогчидтой холбогдоорой.
            </p>
            {/* === ШИНЭЧИЛСЭН ХАЙЛТЫН ХАЙРЦАГ === */}
            <form
              ref={searchRef}
              onSubmit={handleSearchSubmit}
              className="relative flex flex-col sm:flex-row gap-2 max-w-xl w-full bg-white p-2 rounded-xl shadow-lg"
            >
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400">
                    search
                  </span>
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-3 border-none text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-base rounded-lg"
                  placeholder="Гитар, төгөлдөр хуур, бөмбөр..."
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onFocus={() =>
                    searchQuery.length > 1 && setShowSuggestions(true)
                  }
                />

                {/* САНАЛ БОЛГОХ ЦОНХ */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden z-50 text-left">
                    {suggestions.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSuggestionClick(item.id)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">
                            {item.title}
                          </span>
                          <span className="text-xs text-primary font-medium">
                            {item.category_name}
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-gray-300 text-[18px]">
                          north_west
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-primary hover:bg-primary/90 transition-all shadow-md sm:w-auto w-full"
              >
                Хайх
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Categories (Төрлүүд) */}
      <div className="bg-background-light dark:bg-background-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Төрлүүд
            </h2>
            <Link
              to="/products"
              className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
            >
              Бүгдийг харах
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: "music_note", name: "Гитар" },
              { icon: "piano", name: "Төгөлдөр хуур" },
              { icon: "graphic_eq", name: "Бөмбөр" },
              { icon: "straighten", name: "Хийл" },
              { icon: "air", name: "Үлээвэр" },
            ].map((products, index) => (
              <Link
                key={index}
                // ШИНЭ: name-ийг URL параметр болгож дамжуулж байна
                to={`/products?category=${products.name}`}
                className="group flex flex-col items-center justify-center p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">
                    {products.icon}
                  </span>
                </div>
                <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                  {products.name}
                </span>
              </Link>
            ))}
            <Link
              to="/products"
              className="group flex flex-col items-center justify-center p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">
                  grid_view
                </span>
              </div>
              <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                Бусад
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Шинээр нэмэгдсэн */}
      <div className="bg-surface-light dark:bg-surface-dark py-12 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Шинээр нэмэгдсэн
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={slideLeft} 
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">
                  chevron_left
                </span>
              </button>
              <button 
                onClick={slideRight} 
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">
                  chevron_right
                </span>
              </button>
            </div>
          </div>

         <div 
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
          >
            {recentProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product-detail/${product.id}`}
                className="group shrink-0 snap-start w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] bg-background-light dark:bg-background-dark rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                  <img
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={product.img || "/placeholder.jpg"}
                  />
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/80 px-2 py-1 rounded text-xs font-bold text-text-primary-light dark:text-text-primary-dark shadow-sm">
                    {new Date(product.created_at).toLocaleDateString("mn-MN")}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark line-clamp-1">
                      {product.title}
                    </h3>
                    <span className="text-primary font-bold whitespace-nowrap">
                      {product.price}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-3 line-clamp-2">
                    {product.description || "Тайлбар оруулаагүй байна"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        category
                      </span>
                      <span>{product.category_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        sell
                      </span>
                      <span>{product.condition}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              to="/products"
              className="px-6 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg font-bold transition-colors"
            >
              Бүх зарыг харах
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;