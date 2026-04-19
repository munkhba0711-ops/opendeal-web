import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [isCartCheckout, setIsCartCheckout] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [priceDetails, setPriceDetails] = useState({
    subTotal: 0,
    deliveryFee: 0,
    totalAmount: 0,
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user.first_name || "",
    lastName: user.last_name || "",
    phone: user.phone || "",
    email: user.email || "",
    city: user.city || "",
    district: user.district || "",
    address: user.address || "",
  });

  // Хүргэлтийн үнийг динамикаар бодох функц
  const calculateShipping = (prod) => {
    let fee = 10000;
    if (prod.weight) fee += Math.ceil(prod.weight) * 1000;
    if (prod.size_category === "large") fee += 15000;
    else if (prod.size_category === "medium") fee += 5000;
    return fee;
  };

  useEffect(() => {
    // 1. САГСНААС ИРСЭН БОЛ
    if (id === "cart" && location.state?.isCart) {
      setIsCartCheckout(true);
      setCheckoutItems(location.state.items || []);
      setPriceDetails({
        subTotal: location.state.subTotal || 0,
        deliveryFee: location.state.deliveryFee || 0,
        totalAmount: location.state.totalAmount || 0,
      });
      return;
    }

    // 2. БЭЛЭН ҮҮССЭН ЗАХИАЛГА ИРСЭН БОЛ (Үнийн санал зөвшөөрсөн үед)
    if (location.state?.existingOrderId) {
      const prod = location.state.product;
      const fee = calculateShipping(prod);

      // ШИНЭЧИЛСЭН: Number() ашиглаж текстийг математик тоо руу хүчээр хөрвүүлнэ!
      const sub = Number(location.state.totalAmount) || 0;
      const total = sub + fee;

      setCheckoutItems([prod]);
      setPriceDetails({
        subTotal: sub,
        deliveryFee: fee,
        totalAmount: total,
      });
      return;
    }

    // 3. ШУУД ХУДАЛДАЖ АВАХ БОЛ (API-аас татах)
    const fetchSingleProduct = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/products/${id}`,
        );
        const product = response.data.product;

        const priceNum =
          typeof product.price === "string"
            ? parseInt(product.price.replace(/[^\d]/g, ""))
            : product.price;
        const fee = calculateShipping(product);

        setCheckoutItems([product]);
        setPriceDetails({
          subTotal: priceNum,
          deliveryFee: fee,
          totalAmount: priceNum + fee,
        });
      } catch (error) {
        toast.error("Барааны мэдээлэл олдсонгүй.");
        navigate("/");
      }
    };

    if (id !== "cart") {
      fetchSingleProduct();
    }
  }, [id, location, navigate]);

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const { firstName, phone, city, district, address } = shippingInfo;
    if (!firstName || !phone || !city || !district || !address) {
      toast.error("Хүргэлтийн мэдээллээ бүрэн гүйцэд бөглөнө үү!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // АЛХАМ 1: Аль хэдийнэ үүссэн захиалга байвал зөвхөн хаягийг нь UPDATE хийж, нийт үнээ бааз руу явуулах
      if (location.state?.existingOrderId) {
        await axios.put(
          `http://127.0.0.1:8000/api/orders/${location.state.existingOrderId}/shipping`,
          {
            shipping_info: shippingInfo,
            total_price: priceDetails.totalAmount, // Эцсийн мөнгийг баазад илгээх
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        navigate(`/payment/${location.state.existingOrderId}`, {
          state: {
            product: checkoutItems[0],
            amount: priceDetails.totalAmount,
            subTotal: priceDetails.subTotal,
            deliveryFee: priceDetails.deliveryFee,
          },
        });
      }
      // АЛХАМ 2: Сагсны олон барааг захиалах
      else if (isCartCheckout) {
        const itemsData = checkoutItems.map((item) => ({
          id: item.id,
          price:
            typeof item.price === "string"
              ? parseInt(item.price.replace(/[^\d]/g, ""))
              : item.price,
        }));

        const res = await axios.post(
          "http://127.0.0.1:8000/api/orders/cart/checkout",
          {
            items: itemsData,
            shipping_info: shippingInfo,
            total_price: priceDetails.totalAmount,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        navigate(`/payment/cart`, {
          state: {
            isCart: true,
            items: checkoutItems,
            subTotal: priceDetails.subTotal,
            deliveryFee: priceDetails.deliveryFee,
            totalAmount: priceDetails.totalAmount,
            orderIds: res.data.order_ids,
          },
        });
      }
      // АЛХАМ 3: Цоо шинэ ганц бараа захиалах
      else {
        const res = await axios.post(
          "http://127.0.0.1:8000/api/orders",
          {
            product_id: checkoutItems[0].id,
            shipping_info: shippingInfo,
            total_price: priceDetails.totalAmount,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        navigate(`/payment/${res.data.order.id}`, {
          state: {
            product: checkoutItems[0],
            amount: priceDetails.totalAmount,
            subTotal: priceDetails.subTotal,
            deliveryFee: priceDetails.deliveryFee,
          },
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Захиалга баталгаажуулахад алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  if (checkoutItems.length === 0)
    return (
      <div className="py-20 text-center text-slate-500">Ачаалж байна...</div>
    );

  return (
    <main className="flex-grow flex justify-center py-8 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-background-dark min-h-screen">
      <div className="max-w-6xl w-full">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm mb-4"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>{" "}
            Буцах
          </button>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Захиалга баталгаажуулах
          </h1>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
        >
          {/* ЗҮҮН ТАЛ: Хүргэлтийн мэдээлэл */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="material-symbols-outlined text-primary text-3xl">
                  local_shipping
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Хүргэлтийн мэдээлэл
                </h2>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Овог, Нэр *
                    </label>
                    <input
                      required
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary py-3 px-4 outline-none"
                      placeholder="Хүлээн авах хүний нэр"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Имэйл хаяг
                    </label>
                    <input
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary py-3 px-4 outline-none"
                      placeholder="example@mail.com"
                      type="email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Утасны дугаар *
                  </label>
                  <input
                    required
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary py-3 px-4 outline-none font-bold tracking-wider"
                    placeholder="9911-XXXX"
                    type="tel"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Хот / Аймаг *
                    </label>
                    <select
                      required
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary py-3 px-4 outline-none appearance-none"
                    >
                      <option value="" disabled>
                        Сонгох...
                      </option>
                      <option value="Улаанбаатар">Улаанбаатар</option>
                      <option value="Дархан-Уул">Дархан-Уул</option>
                      <option value="Орхон">Орхон</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Дүүрэг / Сум *
                    </label>
                    <input
                      required
                      name="district"
                      value={shippingInfo.district}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary py-3 px-4 outline-none"
                      placeholder="Сүхбаатар дүүрэг"
                      type="text"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Дэлгэрэнгүй хаяг *
                  </label>
                  <textarea
                    required
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary py-3 px-4 min-h-[100px] outline-none"
                    placeholder="Хороо, гудамж, байр, орц, тоот..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* БАРУУН ТАЛ: Захиалгын тойм */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
                Захиалгын тойм
              </h2>

              <div className="max-h-[300px] overflow-y-auto mb-4 pr-2 hide-scrollbar">
                {checkoutItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700"
                  >
                    <div className="size-20 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        src={item.img}
                        alt={item.title}
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      <span className="text-primary font-bold text-sm mt-1">
                        {typeof item.price === "string"
                          ? item.price
                          : `${item.price?.toLocaleString()} ₮`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">
                    Барааны үнэ
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {(priceDetails.subTotal || 0).toLocaleString()} ₮
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Хүргэлт</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {(priceDetails.deliveryFee || 0).toLocaleString()} ₮
                  </span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800 my-2"></div>
                <div className="flex justify-between items-end pt-2 mb-6">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    Нийт төлөх дүн
                  </span>
                  <span className="text-3xl font-black text-primary">
                    {(priceDetails.totalAmount || 0).toLocaleString()} ₮
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-4 rounded-xl transition-all shadow-md shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <span>Түр хүлээнэ үү...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl">
                        lock
                      </span>{" "}
                      Төлбөр төлөх рүү шилжих
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default CheckoutPage;
