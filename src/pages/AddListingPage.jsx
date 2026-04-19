import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const AddListingPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // === 1. ФОРМЫН ҮНДСЭН МЭДЭЭЛЭЛ ХАДГАЛАХ STATE ===
  const [formData, setFormData] = useState({
    title: "",
    category_name: "",
    price: "",
    description: "",
    condition: "Сайн",
    isUsed: "Хэрэглэсэн",
    weight: "", // Жин (кг) хадгалах
    size_category: "", // Овор хэмжээ
  });

  // === 2. ЗУРАГ ХАРАГДАХ БА ХАДГАЛАХ STATE ===
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // === 3. НАРИЙВЧИЛСАН ҮЗҮҮЛЭЛТ (SPECS) - ЗААВАЛ БӨГЛӨХ АНХНЫ УТГУУД ===
  // Хөгжмийн зэмсэгт заавал байх ёстой үзүүлэлтүүдийг устгах боломжгүйгээр (isFixed: true) зоож өгнө.
  const [specs, setSpecs] = useState([
    { key: "Брэнд", value: "", isFixed: true },
    { key: "Үйлдвэрлэсэн газар", value: "", isFixed: true },
    { key: "Өнгө / Материал", value: "", isFixed: true },
    { key: "Дагалдах хэрэгсэл", value: "", isFixed: true },
  ]);

  // --- Input өөрчлөгдөх үед ажиллах функц ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Зураг сонгох үед ажиллах функц ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImages((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    setPreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- Үзүүлэлт (Specs) удирдах функцүүд ---
  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const addSpecSlot = () => {
    setSpecs([...specs, { key: "", value: "", isFixed: false }]);
  };

  const removeSpecSlot = (indexToRemove) => {
    setSpecs(specs.filter((_, index) => index !== indexToRemove));
  };

  // === 4. БАРААГ БААЗ РУУ ИЛГЭЭХ (SUBMIT) ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Үндсэн мэдээлэл шалгах
    if (
      !formData.title ||
      !formData.category_name ||
      !formData.price ||
      !formData.weight ||
      !formData.size_category
    ) {
      toast.error(
        "Нэр, Ангилал, Үнэ, Овор хэмжээ болон Жин хэсгийг заавал бөглөнө үү!",
      );
      return;
    }

    // 2. Зураг шалгах
    if (images.length === 0) {
      toast.error("Дор хаяж 1 зураг оруулна уу!");
      return;
    }

    // 3. Заавал бөглөх Үзүүлэлтүүдийг шалгах
    const missingFixedSpecs = specs.some(
      (spec) => spec.isFixed && spec.value.trim() === "",
    );
    if (missingFixedSpecs) {
      toast.error(
        "Брэнд, Он зэрэг заавал оруулах Нарийвчилсан үзүүлэлтүүдийг гүйцэд бөглөнө үү!",
      );
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      images.forEach((img) => {
        data.append("images[]", img);
      });

      // Specs (Үзүүлэлт)-ийг JSON String болгож хийх
      const specsObject = {};
      specs.forEach((spec) => {
        if (spec.key.trim() !== "" && spec.value.trim() !== "") {
          specsObject[spec.key] = spec.value;
        }
      });
      if (Object.keys(specsObject).length > 0) {
        data.append("specs", JSON.stringify(specsObject));
      }

      const response = await axios.post(
        "http://127.0.0.1:8000/api/products",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success(response.data.message);
      navigate("/profile");
    } catch (error) {
      console.error("Бараа оруулахад алдаа гарлаа:", error);
      toast.error("Алдаа гарлаа. Та мэдээллээ шалгаад дахин оролдоно уу.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex justify-center max-w-6xl mx-auto w-full">
      <main className="flex-1 flex flex-col min-w-0 px-4 py-8 md:px-8 lg:px-12 w-full">
        {/* === БУЦАХ ТОВЧ === */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary font-bold mb-6 transition-colors w-fit border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark px-4 py-2 rounded-xl shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">
            arrow_back
          </span>
          Буцах
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Шинэ бараа нэмэх
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
              Доорх формыг бөглөж баталгаажуулалтад илгээнэ үү. Системд шууд
              нийтлэгдэх болно.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* === 1. ҮНДСЭН МЭДЭЭЛЭЛ === */}
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <span className="material-symbols-outlined">edit_note</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Үндсэн мэдээлэл
                </h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Барааны нэр *
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary py-3 px-4 outline-none"
                    placeholder="Жишээ: Fender Stratocaster 1965 Reissue"
                    type="text"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Төрөл *
                    </label>
                    <select
                      name="category_name"
                      value={formData.category_name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary py-3 px-4 outline-none"
                    >
                      <option disabled value="">
                        Төрөл сонгох
                      </option>
                      <option value="Гитар">Гитар</option>
                      <option value="Төгөлдөр хуур">Төгөлдөр хуур</option>
                      <option value="Бөмбөр">Бөмбөр</option>
                      <option value="Үлээвэр">Үлээвэр</option>
                      <option value="Хийл">Хийл</option>
                      <option value="Бусад">Бусад</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Үнэ (₮) *
                    </label>
                    <input
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary py-3 px-4 outline-none"
                      placeholder="Жишээ: 1500000"
                      type="number"
                      min="0"
                    />
                  </div>
                </div>

                {/* Төлөв байдал, Хэрэглэсэн эсэх, Овор, Жин */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Төлөв байдал *
                    </label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white py-3 px-4 outline-none"
                    >
                      <option value="Шинэ">Шинэ</option>
                      <option value="Маш сайн">Маш сайн</option>
                      <option value="Сайн">Сайн</option>
                      <option value="Дунд">Дунд</option>
                      <option value="Хуучин">Хуучин</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Хэрэглэсэн эсэх *
                    </label>
                    <select
                      name="isUsed"
                      value={formData.isUsed}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white py-3 px-4 outline-none"
                    >
                      <option value="Хэрэглэсэн">Хуучин</option>
                      <option value="Шинэ">Шинэ (Шошготой)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Овор хэмжээ *
                    </label>
                    <select
                      name="size_category"
                      value={formData.size_category}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white py-3 px-4 outline-none"
                    >
                      <option value="" disabled>
                        Сонгох...
                      </option>
                      <option value="small">Жижиг</option>
                      <option value="medium">Дунд зэрэг</option>
                      <option value="large">Том</option>
                    </select>
                  </div>
                  {/* ШИНЭЭР НЭМЭГДСЭН ЖИНГИЙН ТАЛБАР */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Жин (кг) *
                    </label>
                    <input
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      required
                      type="number"
                      step="0.1"
                      min="0"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white py-3 px-4 outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ж нь: 3.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Тайлбар (Заавал биш)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary py-3 px-4 min-h-[100px] outline-none"
                    placeholder="Дуугаралт, түүх, болон өөрчлөлтүүдийг тайлбарлана уу..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* === 2. НАРИЙВЧИЛСАН ҮЗҮҮЛЭЛТ (DYNAMIC SPECS) === */}
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <span className="material-symbols-outlined">tune</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Нарийвчилсан үзүүлэлт *
                </h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Худалдан авагчид зориулан хөгжмийн зэмсгийн үндсэн
                үзүүлэлтүүдийг заавал бөглөнө үү. Хэрэв сайн мэдэхгүй бол
                "Тодорхойгүй" гэж бичиж болно.
              </p>

              <div className="space-y-4">
                {specs.map((spec, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Үзүүлэлтийн нэр"
                      value={spec.key}
                      onChange={(e) =>
                        handleSpecChange(index, "key", e.target.value)
                      }
                      readOnly={spec.isFixed} // Үндсэн үзүүлэлтийн нэрийг өөрчлөхийг хориглоно
                      className={`flex-1 rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-4 outline-none ${spec.isFixed ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium" : "bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"}`}
                    />
                    <span className="font-bold text-slate-400">:</span>
                    <input
                      type="text"
                      placeholder={
                        spec.isFixed ? `${spec.key} оруулна уу...` : "Утга"
                      }
                      value={spec.value}
                      onChange={(e) =>
                        handleSpecChange(index, "value", e.target.value)
                      }
                      required={spec.isFixed} // Үндсэн үзүүлэлтүүдийг ЗААВАЛ бөглөнө
                      className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white py-2 px-4 outline-none focus:ring-2 focus:ring-primary"
                    />

                    {/* Зөвхөн хэрэглэгчийн нэмсэн үзүүлэлтийг л устгах товч харуулна */}
                    {!spec.isFixed ? (
                      <button
                        type="button"
                        onClick={() => removeSpecSlot(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Устгах"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          delete
                        </span>
                      </button>
                    ) : (
                      <div className="p-2 w-[36px]"></div> // Зай барих зорилгоор
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSpecSlot}
                  className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark mt-2 p-2 hover:bg-primary/5 rounded-lg transition-colors w-fit"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add
                  </span>{" "}
                  Нэмэлт үзүүлэлт үүсгэх
                </button>
              </div>
            </div>

            {/* === 3. ЗУРАГ ОРУУЛАХ === */}
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <span className="material-symbols-outlined">imagesmode</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Зураг оруулах *
                </h2>
              </div>

              <label
                htmlFor="file-upload"
                className="block border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/20 p-8 text-center hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group mb-6"
              >
                <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    add_photo_alternate
                  </span>
                </div>
                <p className="text-slate-900 dark:text-white font-semibold mb-1">
                  Дарж зургаа сонгоно уу
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  SVG, PNG, JPG (дээд хэмжээ 5MB)
                </p>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {previews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 group"
                    >
                      <img
                        src={preview}
                        alt={`Урьдчилсан харагдац ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          Нүүр зураг
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          close
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* === 4. ХУРААНГУЙ & БАТАЛГААЖУУЛАХ (БАРУУН ТАЛ) === */}
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Хураангуй
              </h2>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 dark:text-slate-400">
                  Байршуулах хураамж
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  ₮0.00 (Үнэгүй)
                </span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-slate-500 dark:text-slate-400">
                  Сонгосон зураг
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {images.length} ширхэг
                </span>
              </div>
              <hr className="border-slate-100 dark:border-slate-700 mb-6" />
              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-lg transition-all shadow-md shadow-primary/20 mb-3 disabled:opacity-50"
              >
                <span>{isSubmitting ? "Илгээж байна..." : "Нийтлэх"}</span>
                {!isSubmitting && (
                  <span className="material-symbols-outlined text-lg">
                    publish
                  </span>
                )}
              </button>
              <p className="text-[11px] text-slate-400 text-center">
                Нийтлэх товчийг дарснаар та манай үйлчилгээний нөхцөлийг хүлээн
                зөвшөөрч байгаа болно.
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddListingPage;
