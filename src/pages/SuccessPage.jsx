import React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";

const SuccessPage = () => {
  const location = useLocation();
  const order = location.state?.order;

  // Хэрэв Payment хуудаснаас дамжиж ирээгүй шууд /success гэж орж ирвэл нүүр рүү буцаана
  if (!order) {
    return <Navigate to="/" />;
  }

  return (
    <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background-light dark:bg-background-dark min-h-[80vh]">
      <div className="max-w-md w-full text-center">
        {/* Checkmark Animation / Icon */}
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 mb-8 animate-bounce">
          <span className="material-symbols-outlined text-5xl text-green-500">
            check_circle
          </span>
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          Амжилттай баталгаажлаа!
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
          Таны захиалга амжилттай хийгдлээ. Бид таны имэйл хаяг руу баримтыг
          илгээсэн болно.
        </p>

        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-8 text-left shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            Захиалгын мэдээлэл
          </h2>

          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Бараа</span>
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
              {order.product.title}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Захиалгын дугаар
            </span>
            <span className="font-bold text-primary dark:text-white">
              #{String(order.id).replace("ORDER_", "")}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Огноо</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {new Date().toLocaleDateString("mn-MN")}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Төлсөн дүн
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {order.total_price.toLocaleString()} ₮
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Санамж:
              </span>{" "}
              Таны худалдан авалт манай "Жинхэнэ эсэхийг баталгаажуулах
              баталгаа"-гаар хангагдсан.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          {/* Захиалгын төлөв харах товч дарахад Профайлын 'purchases' таб руу үсэрнэ */}
          <Link
            to="/profile"
            state={{ targetTab: "purchases" }}
            className="w-full sm:w-auto px-8 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined">receipt_long</span>
            Захиалгын төлөв харах
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-8 h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
          >
            Үргэлжлүүлэн үзэх
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default SuccessPage;
