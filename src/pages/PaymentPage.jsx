import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useAppContext } from "../context/AppContext";

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart, fetchUserItems } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("qpay");
  const [isChecking, setIsChecking] = useState(false);

  const [isCartPayment, setIsCartPayment] = useState(false);
  const [orderItems, setOrderItems] = useState([]);

  const [paymentDetails, setPaymentDetails] = useState({
    subTotal: 0,
    deliveryFee: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    // 1. Хэрэв сагснаас ирсэн бол (Олон бараа)
    if (orderId === "cart" && location.state?.isCart) {
      setIsCartPayment(true);
      setOrderItems(location.state.items || []);
      setPaymentDetails({
        subTotal: location.state.subTotal || 0,
        deliveryFee: location.state.deliveryFee || 0,
        totalAmount: location.state.totalAmount || 0,
      });
      setLoading(false);
      return;
    }

    // 2. Хэрэв шууд худалдан авалт эсвэл Үнийн саналаас ирсэн бол (Ганц бараа)
    setTimeout(() => {
      const passedProduct = location.state?.product;
      const subTotal = location.state?.subTotal || 0;
      const deliveryFee = location.state?.deliveryFee || 0;
      const totalAmount = location.state?.amount || subTotal + deliveryFee;

      setOrderItems([
        {
          id: orderId,
          title: passedProduct?.title || "Барааны мэдээлэл олдсонгүй",
          img:
            passedProduct?.img ||
            "https://via.placeholder.com/600?text=Зураг+Олдсонгүй",
          condition: passedProduct?.condition || "",
          price: subTotal,
        },
      ]);

      setPaymentDetails({
        subTotal: subTotal,
        deliveryFee: deliveryFee,
        totalAmount: totalAmount,
      });
      setLoading(false);
    }, 300);
  }, [orderId, location]);

  const handleCheckPayment = async () => {
    setIsChecking(true);
    try {
      const token = localStorage.getItem("token");

      if (isCartPayment) {
        const orderIds = location.state?.orderIds || [];

        if (orderIds.length > 0) {
          await axios.post(
            `http://127.0.0.1:8000/api/cart/pay-orders`,
            { order_ids: orderIds },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        } else {
          await axios.post(
            `http://127.0.0.1:8000/api/cart/pay-all`,
            { items: orderItems },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        }
        clearCart();
      } else {
        const actualOrderId = String(orderId).replace("ORDER_", "");
        await axios.post(
          `http://127.0.0.1:8000/api/orders/pay/${actualOrderId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      toast.success("Төлбөр амжилттай төлөгдлөө! Баярлалаа.", {
        duration: 4000,
      });
      await fetchUserItems(); // Төлбөрийн дараа сагс, хадгалсныг баазаас цэвэрлэж татна

      navigate("/success", {
        state: { items: orderItems, total: paymentDetails?.totalAmount || 0 },
      });
    } catch (error) {
      toast.error(
        "Төлбөр шалгахад алдаа гарлаа. Та төлбөрөө бүрэн шилжүүлсэн эсэхээ шалгана уу.",
      );
    } finally {
      setIsChecking(false);
    }
  };

  if (loading)
    return (
      <div className="py-20 text-center text-slate-500">
        Төлбөрийн мэдээлэл ачаалж байна...
      </div>
    );

  return (
    <main className="flex-grow flex justify-center py-8 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-background-dark min-h-screen">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* ЗҮҮН ТАЛ: Захиалгын тойм */}
        <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col gap-6">
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
              <span className="material-symbols-outlined text-primary">
                receipt_long
              </span>
              {isCartPayment
                ? "Сагсны захиалга"
                : `Захиалгын дугаар: #${String(orderId).replace("ORDER_", "")}`}
            </h2>

            {isCartPayment ? (
              /* === САГСНААС ИРСЭН ОЛОН БАРАА === */
              <>
                <div className="flex flex-col gap-4 mb-6 max-h-[340px] overflow-y-auto hide-scrollbar pr-1">
                  {orderItems.map((item, index) => (
                    <Link
                      key={index}
                      to={`/product-detail/${item.id}`}
                      className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-primary/50 transition-colors group cursor-pointer"
                    >
                      <div className="w-20 h-20 rounded-md overflow-hidden shrink-0 bg-white">
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex flex-col flex-1 justify-center">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <div className="flex flex-col justify-end items-end shrink-0">
                        <span className="font-bold text-primary text-sm">
                          {typeof item.price === "string"
                            ? item.price
                            : `${(item.price || 0).toLocaleString()} ₮`}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">
                      Барааны нийт үнэ ({orderItems.length})
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {(paymentDetails?.subTotal || 0).toLocaleString()} ₮
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">
                      Нийт хүргэлт
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {(paymentDetails?.deliveryFee || 0).toLocaleString()} ₮
                    </span>
                  </div>
                  <div className="h-px bg-gray-200 dark:bg-gray-800"></div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      Нийт төлөх
                    </span>
                    <span className="text-2xl font-black text-primary">
                      {(paymentDetails?.totalAmount || 0).toLocaleString()} ₮
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* === ГАНЦ БАРАА === */
              <>
                <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden mb-5 relative group">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={orderItems[0].img}
                    alt={orderItems[0].title}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {orderItems[0].title}
                    </h3>
                  </div>
                  <div className="h-px bg-gray-200 dark:bg-gray-800"></div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">
                      Барааны үнэ
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {typeof orderItems[0].price === "string"
                        ? orderItems[0].price
                        : `${(orderItems[0].price || 0).toLocaleString()} ₮`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">
                      Хүргэлт
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {(paymentDetails?.deliveryFee || 0).toLocaleString()} ₮
                    </span>
                  </div>
                  <div className="h-px bg-gray-200 dark:bg-gray-800"></div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      Нийт төлөх
                    </span>
                    <span className="text-2xl font-black text-primary">
                      {(paymentDetails?.totalAmount || 0).toLocaleString()} ₮
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* БАРУУН ТАЛ: Төлбөр хийх хэсэг */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 lg:p-8 h-full flex flex-col">
            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                Төлбөр хийх
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Та доорх төлбөрийн хэрэгслүүдээс сонгон гүйлгээгээ
                баталгаажуулна уу.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <label className="cursor-pointer group relative">
                <input
                  checked={paymentMethod === "qpay"}
                  onChange={() => setPaymentMethod("qpay")}
                  className="peer sr-only"
                  type="radio"
                  value="qpay"
                />
                <div className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 transition-all peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-sm">
                  <div className="flex flex-col items-center justify-center gap-2 h-full py-2">
                    <span className="font-black tracking-wider text-xl text-primary">
                      QPay
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 peer-checked:opacity-100 text-primary transition-opacity">
                    <span className="material-symbols-outlined">
                      check_circle
                    </span>
                  </div>
                </div>
              </label>

              <label className="cursor-pointer group relative">
                <input
                  checked={paymentMethod === "socialpay"}
                  onChange={() => setPaymentMethod("socialpay")}
                  className="peer sr-only"
                  type="radio"
                  value="socialpay"
                />
                <div className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 transition-all peer-checked:border-[#293e92] peer-checked:bg-[#293e92]/5 peer-checked:shadow-sm">
                  <div className="flex flex-col items-center justify-center gap-2 h-full py-2">
                    <span className="font-black tracking-wider text-xl text-[#293e92] dark:text-[#5c73d6]">
                      SocialPay
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 peer-checked:opacity-100 text-[#293e92] transition-opacity">
                    <span className="material-symbols-outlined">
                      check_circle
                    </span>
                  </div>
                </div>
              </label>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
              <div className="text-center space-y-6 max-w-sm w-full">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    QR код уншуулах
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Банкны апп-аараа уншуулна уу.
                  </p>
                </div>
                <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mx-auto w-56 h-56 flex items-center justify-center overflow-hidden">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://opendeal.mn/pay"
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={handleCheckPayment}
                  disabled={isChecking}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-md disabled:opacity-70"
                >
                  {isChecking ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Шалгаж байна...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">refresh</span>
                      <span>Төлбөр шалгах</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentPage;
