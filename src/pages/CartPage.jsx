import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const CartPage = ({ isOpen, onClose }) => {
  const { cart, removeFromCart } = useAppContext();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const priceNum =
        typeof item.price === "string"
          ? parseInt(item.price.replace(/[^\d]/g, ""))
          : item.price;
      return total + priceNum;
    }, 0);
  };

  const totalPrice = calculateTotal();

  // УХААЛАГ ХҮРГЭЛТИЙН ТООЦООЛОЛ
  const deliveryFee = cart.reduce((total, item) => {
    let fee = 10000;
    if (item.weight) fee += Math.ceil(item.weight) * 1000;
    if (item.size_category === "large") fee += 15000;
    else if (item.size_category === "medium") fee += 5000;
    return total + fee;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-white dark:bg-surface-dark h-full shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              shopping_cart
            </span>
            Миний сагс ({cart.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-red-500 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50">
              <span className="material-symbols-outlined text-6xl mb-2">
                shopping_basket
              </span>
              <p>Таны сагс хоосон байна.</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 group"
              >
                <Link
                  to={`/product-detail/${item.id}`}
                  onClick={onClose}
                  className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0 block"
                >
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={item.img}
                    alt={item.title}
                  />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <Link
                      to={`/product-detail/${item.id}`}
                      onClick={onClose}
                      className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-primary transition-colors pr-2"
                    >
                      {item.title}
                    </Link>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <p className="font-bold text-primary">
                      {typeof item.price === "string"
                        ? item.price
                        : `${item.price.toLocaleString()} ₮`}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-background-dark">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Нийт барааны үнэ
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {totalPrice.toLocaleString()} ₮
              </span>
            </div>
            <div className="flex justify-between items-center mb-5">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Хүргэлт
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {deliveryFee.toLocaleString()} ₮
              </span>
            </div>
            <div className="flex justify-between items-center mb-5">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Нийт төлөх
              </span>
              <span className="text-xl font-black text-primary">
                {(totalPrice + deliveryFee).toLocaleString()} ₮
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                // ЗӨВХӨН CHECKOUT РУУ ШИЛЖИНЭ (Мэдээллээ бүрэн явуулна)
                navigate("/checkout/cart", {
                  state: {
                    isCart: true,
                    items: cart,
                    subTotal: totalPrice,
                    deliveryFee: deliveryFee,
                    totalAmount: totalPrice + deliveryFee,
                  },
                });
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <span className="material-symbols-outlined">
                shopping_cart_checkout
              </span>
              Захиалга үүсгэх рүү шилжих
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
