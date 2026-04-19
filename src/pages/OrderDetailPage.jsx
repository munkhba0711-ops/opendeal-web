import React from 'react';
import { Link } from 'react-router-dom';

const OrderDetailPage = () => {
  return (
    <main className="flex-1 flex justify-center py-8 px-4 md:px-10">
      <div className="max-w-[1000px] w-full flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">Захиалгын дэлгэрэнгүй</h1>
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <span className="text-sm font-medium">Захиалгын дугаар: <span className="text-primary">#ORD-12345</span></span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-sm">Огноо: 2023-11-20</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full w-fit">
            <span className="material-symbols-outlined text-[20px] fill-1">check_circle</span>
            <span className="text-sm font-bold uppercase tracking-wider">Төлбөр төлөгдсөн</span>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="bg-white dark:bg-surface-dark p-8 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="relative flex justify-between">
            <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-0">
              <div className="h-full bg-primary w-[64%] rounded-full"></div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Захиалсан</span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Төлбөр</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-sm z-10">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white">Хүргэлтэнд</span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <span className="text-xs font-medium text-slate-500">Хүлээлгэн өгсөн</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content: Ordered Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-slate-800/30">
                <h3 className="font-bold text-slate-900 dark:text-white">Захиалсан бараа</h3>
              </div>
              <div className="p-4 flex gap-4 items-center">
                <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                  <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&q=80&w=200" alt="Item" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">Fender Stratocaster American Pro II</h4>
                  <p className="text-sm font-bold text-primary mt-2">1 x 2,500,000 ₮</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">2,500,000 ₮</p>
                </div>
              </div>
            </div>
            
            {/* Shipping Info */}
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <h3 className="font-bold text-slate-900 dark:text-white">Хүргэлтийн хаяг</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Хүлээн авагч</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Бат-Эрдэнэ Тэмүүлэн</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">+976 9911-2233</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Хаяг</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Улаанбаатар хот, Сүхбаатар дүүрэг</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">1-р хороо, Чингисийн өргөн чөлөө, 12-р байр</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Order Summary */}
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Төлбөрийн товч</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Дэд дүн</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">2,500,000 ₮</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Хүргэлт</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">15,000 ₮</span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-800 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900 dark:text-white">Нийт дүн</span>
                  <span className="text-xl font-bold text-primary">2,515,000 ₮</span>
                </div>
              </div>
              <button className="w-full mt-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">print</span> Баримт хэвлэх
              </button>

              <Link to="/rating" className="w-full mt-3 py-3 bg-white dark:bg-slate-800 text-primary border-2 border-primary font-bold rounded-lg hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
               <span className="material-symbols-outlined">star</span> Үнэлгээ өгөх
              </Link>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderDetailPage;