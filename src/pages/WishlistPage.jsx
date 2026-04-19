import React from "react";
import { useAppContext } from "../context/AppContext";

const WishlistPage = ({ isOpen, onClose }) => {
  // 1. AppContext-оос хэрэгтэй дата болон функцуудыг дуудаж байна
  const { favorites, toggleFavorite, addToCart } = useAppContext();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Арын бүдэг хэсэг */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Баруун талаас гарч ирэх цагаан цонх */}
      <div className="relative w-full max-w-md bg-white dark:bg-surface-dark h-full shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500">
              favorite
            </span>
            Хадгалсан ({favorites.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-red-500 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* 2. Хадгалсан бараа байхгүй үед харагдах текст */}
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50">
              <span className="material-symbols-outlined text-6xl mb-2">
                favorite_border
              </span>
              <p>Одоогоор хадгалсан бараа байхгүй байна.</p>
            </div>
          ) : (
            // 3. Хадгалсан бараануудыг давталтаар (map) харуулж байна
            favorites.map((product) => (
              <div
                key={product.id}
                className="flex gap-4 group border-b border-gray-50 dark:border-gray-800 pb-4"
              >
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0 relative">
                  <img
                    className="w-full h-full object-cover"
                    src={product.img}
                    alt={product.title}
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {product.title}
                      </h3>
                      <p className="font-bold text-primary mt-1">
                        {product.price}
                      </p>
                    </div>
                    {/* 4. Жагсаалтаас устгах үйлдэл (toggleFavorite-ийг ашиглана) */}
                    <button
                      onClick={() => toggleFavorite(product)}
                      className="text-slate-400 hover:text-red-500 ml-2 transition-colors p-1 bg-slate-50 dark:bg-slate-800 rounded-md"
                      title="Жагсаалтаас устгах"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                  <div className="flex items-end justify-end mt-2">
                    {/* Сагсанд хийх үйлдэл */}
                    <button
                      onClick={() => {
                        // 1. Сагс руу нэмэх
                        addToCart(product);

                        // 2. Хадгалсан жагсаалтаас (Wishlist) автоматаар хасах
                        // Энэ функц нь баазаас болон LocalStorage-аас давхар устгана
                        toggleFavorite(product);

                        // Сонголт: Хэрэв сагсанд нэмэгдсэн бол хажуугийн цонхыг хаахыг хүсвэл:
                        // onClose();
                      }}
                      className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        add_shopping_cart
                      </span>
                      Сагсанд хийх
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
