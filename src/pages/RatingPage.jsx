import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RatingPage = () => {
  const [rating, setRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false); // Илгээгдсэн эсэхийг шалгах төлөв

  // Илгээх товч дарах үед ажиллах функц
  const handleSubmit = (e) => {
    e.preventDefault();
    // Энд Backend рүү өгөгдөл илгээх код бичигдэнэ
    // ...
    // Илгээгдсэний дараа амжилттай цонхыг харуулна:
    setIsSubmitted(true);
  };

  // ХЭРЭВ АМЖИЛТТАЙ ИЛГЭЭГДСЭН БОЛ ТАНЫ БЭЛДСЭН ГОЁ ЦОНХ ХАРАГДАНА
  if (isSubmitted) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-4 bg-background-light dark:bg-background-dark py-12">
        <div className="max-w-md w-full bg-white dark:bg-surface-dark rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all">
          
          {/* Visual Section */}
          <div className="pt-12 pb-8 flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full scale-150"></div>
              <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                <span className="material-symbols-outlined text-5xl font-bold">check</span>
              </div>
            </div>
            
            {/* Background Element */}
            <div className="mt-10 w-full px-8">
              <div className="aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center overflow-hidden border border-primary/10 dark:from-primary/10 dark:to-primary/30">
                <div className="text-primary/40 flex gap-4">
                  <span className="material-symbols-outlined text-6xl">star</span>
                  <span className="material-symbols-outlined text-6xl opacity-50">thumb_up</span>
                  <span className="material-symbols-outlined text-6xl opacity-30">verified_user</span>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="px-8 pb-4 text-center">
            <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold leading-tight mb-4">
              Сэтгэгдэл амжилттай илгээгдлээ!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
              Таны үнэлгээ платформын итгэлцлийг нэмэгдүүлэхэд тусална. Бусад хэрэглэгчид таны туршлага дээр үндэслэн зөв сонголт хийх боломжтой боллоо.
            </p>
          </div>

          {/* Action Button */}
          <div className="p-8">
            <Link to="/seller-profile" className="w-full flex items-center justify-center gap-2 rounded-2xl h-14 bg-primary hover:bg-primary/90 text-white text-lg font-bold transition-all active:scale-95 shadow-lg shadow-primary/25">
              <span className="material-symbols-outlined">arrow_back</span>
              <span>Хаах</span>
            </Link>
            <p className="mt-6 text-center text-slate-400 dark:text-slate-500 text-sm">
              Борлуулагчийн профайл руу буцаж очих
            </p>
          </div>
        </div>
        
        {/* Арын бүдэг эффектүүд */}
        <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        </div>
      </main>
    );
  }

  // ХЭРЭВ ИЛГЭЭГЭЭГҮЙ БАЙВАЛ ҮНЭЛГЭЭ ӨГӨХ ФОРМ ХАРАГДАНА
  return (
    <main className="flex-grow flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Үнэлгээ өгөх</h1>
          <p className="text-sm text-slate-500 mt-1">Таны сэтгэгдэл бусад худалдан авагчдад туслах болно.</p>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
              <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&q=80&w=200" alt="Product" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">Fender Stratocaster American Pro II</h3>
              <p className="text-xs text-slate-500 mt-1">Худалдагч: Vintage Tone Shop</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ерөнхий үнэлгээ</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform focus:outline-none"
                >
                  <span className={`material-symbols-outlined text-4xl ${star <= rating ? 'text-yellow-400 fill-1' : 'text-slate-300 dark:text-slate-600'}`}>
                    star
                  </span>
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-primary mt-1">{rating > 0 ? `${rating} од өглөө` : 'Одоо дарж үнэлнэ үү'}</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Сэтгэгдэл бичих <span className="text-slate-400 font-normal">(Заавал биш)</span></label>
            <textarea 
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary py-3 px-4 min-h-[120px]" 
              placeholder="Бүтээгдэхүүний чанар, хүргэлтийн талаарх дэлгэрэнгүй сэтгэгдлээ энд бичнэ үү..."
            ></textarea>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Зураг хавсаргах</label>
            <div className="grid grid-cols-4 gap-3">
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-primary dark:hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-slate-400">add_a_photo</span>
                <span className="text-[10px] text-slate-500 mt-1">Зураг нэмэх</span>
                <input accept="image/*" className="hidden" type="file" />
              </label>
            </div>
            <p className="text-xs text-slate-500">Максимум 4 зураг (JPG, PNG)</p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <Link to="/order-detail" className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center">
            Болих
          </Link>
          {/* ЭНД ИЛГЭЭХ ТОВЧ БАЙНА */}
          <button onClick={handleSubmit} className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors text-center shadow-sm shadow-primary/20">
            Үнэлгээ илгээх
          </button>
        </div>

      </div>
    </main>
  );
};

export default RatingPage;