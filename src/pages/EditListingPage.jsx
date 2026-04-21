import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

const EditListingPage = () => {
  const { id } = useParams(); // URL-аас барааны ID-г авна
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // === 1. ФОРМЫН ҮНДСЭН МЭДЭЭЛЭЛ ===
  const [formData, setFormData] = useState({
    title: "",
    category_name: "",
    price: "",
    description: "",
    condition: "Сайн",
    isUsed: "Хэрэглэсэн",
    weight: "",
    size_category: "",
  });

  // === 2. ЗУРАГ ХАРАГДАХ БА ХАДГАЛАХ STATE ===
  const [existingImages, setExistingImages] = useState([]); // Баазад байсан хуучин зурагнууд (URL)
  const [newImages, setNewImages] = useState([]); // Шинээр нэмсэн зурагнууд (File)
  const [previews, setPreviews] = useState([]); // Дэлгэцэнд харуулах нийт зурагнууд

  // === 3. НАРИЙВЧИЛСАН ҮЗҮҮЛЭЛТ (SPECS) ===
  const fixedKeys = [
    "Брэнд",
    "Үйлдвэрлэсэн газар",
    "Өнгө / Материал",
    "Дагалдах хэрэгсэл",
  ];
  const [specs, setSpecs] = useState([]);

  // === АНХ ОРОХОД БАРААНЫ МЭДЭЭЛЛИЙГ ТАТАЖ АВАХ ===
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(
          `/products/${id}`,
        );
        const p = response.data.product;

        // 1. Үндсэн мэдээллийг нөхөх (Үнээс " ₮" болон таслалыг салгаж цэвэр тоо болгоно)
        setFormData({
          title: p.title,
          category_name: p.category_name,
          price: p.price ? p.price.replace(/[^\d]/g, "") : "",
          description: p.description || "",
          condition: p.condition || "Сайн",
          isUsed: p.isUsed || "Хэрэглэсэн",
          weight: p.weight || "",
          size_category: p.size_category || "medium",
        });

        // 2. Зурагнуудыг нөхөх
        let loadedImages = [];
        if (p.images) {
          loadedImages =
            typeof p.images === "string" ? JSON.parse(p.images) : p.images;
        } else if (p.img) {
          loadedImages = [p.img];
        }
        setExistingImages(loadedImages);
        setPreviews(loadedImages);

        // 3. Үзүүлэлтүүдийг (Specs) нөхөх
        const loadedSpecs = [];
        let parsedSpecs = {};
        if (p.specs) {
          parsedSpecs =
            typeof p.specs === "string" ? JSON.parse(p.specs) : p.specs;
        }

        // Эхлээд Fixed Key-үүдээ хийнэ
        fixedKeys.forEach((key) => {
          loadedSpecs.push({
            key,
            value: parsedSpecs[key] || "",
            isFixed: true,
          });
        });
        // Дараа нь хэрэглэгчийн өөрөө нэмсэн Custom Key-үүдийг хийнэ
        Object.keys(parsedSpecs).forEach((key) => {
          if (!fixedKeys.includes(key)) {
            loadedSpecs.push({ key, value: parsedSpecs[key], isFixed: false });
          }
        });
        setSpecs(loadedSpecs);
      } catch (error) {
        toast.error("Барааны мэдээлэл татахад алдаа гарлаа.");
        navigate("/profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // --- Input өөрчлөгдөх ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Зураг сонгох ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setNewImages((prev) => [...prev, ...files]);
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviewUrls]);
  };

  // --- Зураг устгах ---
  const removeImage = (indexToRemove) => {
    // Хэрэв хуучин зураг устгаж байвал
    if (indexToRemove < existingImages.length) {
      setExistingImages((prev) =>
        prev.filter((_, index) => index !== indexToRemove),
      );
    } else {
      // Хэрэв шинээр нэмсэн зураг устгаж байвал
      const newImageIndex = indexToRemove - existingImages.length;
      setNewImages((prev) =>
        prev.filter((_, index) => index !== newImageIndex),
      );
    }
    setPreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- Үзүүлэлт (Specs) удирдах ---
  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const addSpecSlot = () =>
    setSpecs([...specs, { key: "", value: "", isFixed: false }]);
  const removeSpecSlot = (indexToRemove) =>
    setSpecs(specs.filter((_, index) => index !== indexToRemove));

  // === 4. БАРААГ БААЗ РУУ ШИНЭЧИЛЖ ИЛГЭЭХ (UPDATE) ===
  const handleSubmit = async (e) => {
    e.preventDefault();

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

    if (previews.length === 0) {
      toast.error("Дор хаяж 1 зураг оруулна уу!");
      return;
    }

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
      // Laravel API дээр FormData-аар PUT хүсэлт явуулахын тулд _method ашиглана
      data.append("_method", "PUT");

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Хуучин үлдсэн зурагнуудаа String хэлбэрээр илгээнэ
      data.append("existing_images", JSON.stringify(existingImages));

      // Шинэ зурагнуудаа File хэлбэрээр илгээнэ
      newImages.forEach((img) => {
        data.append("images[]", img);
      });

      const specsObject = {};
      specs.forEach((spec) => {
        if (spec.key.trim() !== "" && spec.value.trim() !== "") {
          specsObject[spec.key] = spec.value;
        }
      });
      if (Object.keys(specsObject).length > 0) {
        data.append("specs", JSON.stringify(specsObject));
      }

      const response = await api.post(
        `/products/${id}`, // _method PUT учраас POST-оор явуулна
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Барааны мэдээлэл амжилттай шинэчлэгдлээ!");
      navigate(`/product-detail/${id}`); // Буцаад барааны хуудас руугаа орно
    } catch (error) {
      console.error("Засахад алдаа гарлаа:", error);
      toast.error("Алдаа гарлаа. Та мэдээллээ шалгаад дахин оролдоно уу.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="py-40 text-center text-slate-500">
        Мэдээллийг татаж байна...
      </div>
    );

  return (
    <div className="flex-1 flex justify-center max-w-6xl mx-auto w-full">
      <main className="flex-1 flex flex-col min-w-0 px-4 py-8 md:px-8 lg:px-12 w-full">
        <button
          onClick={() => navigate(-1)}
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
              Зараа засварлах
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
              Та барааныхаа мэдээллийг шинэчлэх боломжтой.
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
                      type="number"
                      min="0"
                    />
                  </div>
                </div>

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
                      <option value="small">Жижиг</option>
                      <option value="medium">Дунд зэрэг</option>
                      <option value="large">Том</option>
                    </select>
                  </div>
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
              <div className="space-y-4 mt-6">
                {specs.map((spec, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) =>
                        handleSpecChange(index, "key", e.target.value)
                      }
                      readOnly={spec.isFixed}
                      className={`flex-1 rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-4 outline-none ${spec.isFixed ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium" : "bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"}`}
                    />
                    <span className="font-bold text-slate-400">:</span>
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) =>
                        handleSpecChange(index, "value", e.target.value)
                      }
                      required={spec.isFixed}
                      className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white py-2 px-4 outline-none focus:ring-2 focus:ring-primary"
                    />
                    {!spec.isFixed ? (
                      <button
                        type="button"
                        onClick={() => removeSpecSlot(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          delete
                        </span>
                      </button>
                    ) : (
                      <div className="p-2 w-[36px]"></div>
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
                  Зураг шинэчлэх *
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
                  Шинэ зураг нэмэх
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
                        alt="Урьдчилсан"
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

          {/* === 4. ХУРААНГУЙ === */}
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Хураангуй
              </h2>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-slate-500 dark:text-slate-400">
                  Нийт зураг
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {previews.length} ширхэг
                </span>
              </div>
              <hr className="border-slate-100 dark:border-slate-700 mb-6" />
              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-4 rounded-lg transition-all shadow-md shadow-amber-500/20 mb-3 disabled:opacity-50"
              >
                <span>
                  {isSubmitting ? "Хадгалж байна..." : "Өөрчлөлтийг хадгалах"}
                </span>
                {!isSubmitting && (
                  <span className="material-symbols-outlined text-lg">
                    save
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditListingPage;