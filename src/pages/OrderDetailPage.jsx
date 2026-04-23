import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // === ШИЙДЭЛ: Баазад шинэ API бичихгүйгээр Profile дата дотроос шүүж олно ===
        const response = await api.get("/profile/data");
        const allOrders = response.data?.activeOrders || [];
        const pastOrders = response.data?.pastPurchases || [];

        // Идэвхтэй болон Түүхэн захиалгуудыг нэгтгээд хайх
        const combinedOrders = [...allOrders, ...pastOrders];
        const foundOrder = combinedOrders.find(
          (o) => String(o.id) === String(id),
        );

        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          throw new Error("Захиалга олдсонгүй");
        }
      } catch (error) {
        console.error("Захиалгын мэдээлэл олдсонгүй:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20 text-slate-500">
        Уншиж байна...
      </div>
    );
  }

  // Хэрэв дата олдсонгүй бол цагаан дэлгэц гаргахгүй, буцах товч харуулна
  if (!order) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 text-slate-500 gap-4">
        <span className="material-symbols-outlined text-5xl opacity-30">
          error
        </span>
        <p>Захиалгын мэдээлэл олдсонгүй эсвэл устгагдсан байна.</p>
        <button
          onClick={() => navigate("/profile")}
          className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark"
        >
          Профайл руу буцах
        </button>
      </div>
    );
  }

  // === АЛДАА ГАРГАХГҮЙН ТУЛД БҮХ ӨГӨГДЛИЙГ ШАЛГАХ (SAFE VARIABLES) ===
  const statusSteps = ["pending", "paid", "shipping", "delivered"];
  const currentStepIndex = statusSteps.indexOf(order.status || "pending");
  const isDelivered = order.status === "delivered";

  // 1. Огноог гацахгүйгээр хөрвүүлэх
  let orderDate = "Огноо тодорхойгүй";
  if (order.created_at) {
    try {
      orderDate = new Date(order.created_at).toLocaleDateString("mn-MN");
    } catch (e) {}
  }

  // 2. Хүргэлтийн хаягийг аюулгүйгээр задлах (JSON string ирсэн ч гацахгүй)
  let shippingInfo = {};
  if (typeof order.shipping_info === "string") {
    try {
      shippingInfo = JSON.parse(order.shipping_info);
    } catch (e) {}
  } else if (order.shipping_info) {
    shippingInfo = order.shipping_info;
  }

  // 3. Үнийн дүнгийн аюулгүй тооцоолол
  const totalAmount = Number(
    order.total_amount || order.total_price || order.product?.price || 0,
  );
  const productPrice = Number(order.product?.price || 0);
  const shippingFee = Number(shippingInfo.fee || 15000);
  const subTotal =
    totalAmount > 0 && totalAmount > shippingFee
      ? totalAmount - shippingFee
      : productPrice;

  return (
    <main className="flex-1 flex justify-center py-8 px-4 md:px-10">
      <div className="max-w-[1000px] w-full flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
              Захиалгын дэлгэрэнгүй
            </h1>
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mt-2">
              <span className="text-sm font-medium">
                Захиалгын дугаар:{" "}
                <span className="text-primary">#{order.id}</span>
              </span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-sm">Огноо: {orderDate}</span>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full w-fit ${isDelivered ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"}`}
          >
            <span className="material-symbols-outlined text-[20px] fill-1">
              check_circle
            </span>
            <span className="text-sm font-bold uppercase tracking-wider">
              {order.status === "delivered"
                ? "Хүргэгдсэн"
                : order.status === "shipping"
                  ? "Хүргэлтэнд"
                  : order.status === "paid"
                    ? "Төлбөр төлөгдсөн"
                    : "Хүлээгдэж буй"}
            </span>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="bg-white dark:bg-surface-dark p-8 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
          <div className="relative flex justify-between min-w-[400px]">
            <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-0">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{
                  width: `${currentStepIndex >= 0 ? (currentStepIndex / 3) * 100 : 0}%`,
                }}
              ></div>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentStepIndex >= 0 ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}
              >
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <span
                className={`text-xs font-bold ${currentStepIndex >= 0 ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
              >
                Захиалсан
              </span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentStepIndex >= 1 ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}
              >
                <span className="material-symbols-outlined">payments</span>
              </div>
              <span
                className={`text-xs font-bold ${currentStepIndex >= 1 ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
              >
                Төлбөр
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors ${currentStepIndex >= 2 ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}
              >
                <span className="material-symbols-outlined">
                  local_shipping
                </span>
              </div>
              <span
                className={`text-[11px] font-bold ${currentStepIndex >= 2 ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
              >
                Хүргэлтэнд
              </span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentStepIndex >= 3 ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}
              >
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <span
                className={`text-xs font-bold ${currentStepIndex >= 3 ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
              >
                Хүргэгдсэн
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content: Ordered Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Захиалсан бараа
                </h3>
                {order.product?.user_id && (
                  <Link
                    to={`/seller-profile/${order.product.user_id}`}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      storefront
                    </span>
                    Худалдагчийн профайл
                  </Link>
                )}
              </div>
              <div className="p-4 flex gap-4 items-center">
                <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    src={
                      order.product?.img || "https://via.placeholder.com/150"
                    }
                    alt="Item"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product-detail/${order.product?.id || order.product_id}`}
                    className="text-sm font-semibold text-slate-900 dark:text-white hover:text-primary transition-colors line-clamp-2"
                  >
                    {order.product?.title || "Бараа"}
                  </Link>
                  <p className="text-sm font-bold text-primary mt-2">
                    1 x {subTotal.toLocaleString()} ₮
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">
                  location_on
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Хүргэлтийн хаяг
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Хүлээн авагч
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {shippingInfo.firstName || "Мэдээлэл алга"}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {shippingInfo.phone || ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Хаяг
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {shippingInfo.city || ""}, {shippingInfo.district || ""}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {shippingInfo.address || ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Order Summary */}
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">
                Төлбөрийн тойм
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Барааны үнэ</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {subTotal.toLocaleString()} ₮
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Хүргэлт</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {shippingFee.toLocaleString()} ₮
                  </span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-800 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    Нийт дүн
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {totalAmount.toLocaleString()} ₮
                  </span>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full mt-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">print</span> Баримт
                хэвлэх
              </button>

              {/* ҮНЭЛГЭЭ ӨГӨХ ТОВЧ - Төлөгдсөн, Хүргэлтэнд гарсан, Хүргэгдсэн ямар ч үед харагдана */}
              {["paid", "shipping", "delivered"].includes(order?.status) && (
                <Link
                  to="/rating"
                  state={{
                    product: order.product,
                    orderId: order.id,
                    seller: order.product?.user,
                  }}
                  className="w-full mt-3 py-3 bg-primary text-white border-2 border-primary font-bold rounded-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                >
                  <span className="material-symbols-outlined">star</span>{" "}
                  Үнэлгээ өгөх
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderDetailPage;
