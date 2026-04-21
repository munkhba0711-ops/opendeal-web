import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [animateCart, setAnimateCart] = useState(false);
  const [animateFav, setAnimateFav] = useState(false);

  // 1. ДЭЛГЭЦ АЧААЛЛАХАД БААЗААС ТАТАХ
  const fetchUserItems = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCart([]);
      setFavorites([]);
      return;
    }

    try {
      const response = await api.get("/user/items");

      const validCart = (response.data.cart || [])
        .map((item) => (item.product ? item.product : item))
        .filter(
          (product) =>
            product !== null &&
            product !== undefined &&
            product.status !== "sold",
        );

      const validFavorites = (response.data.favorites || [])
        .map((item) => (item.product ? item.product : item))
        .filter(
          (product) =>
            product !== null &&
            product !== undefined &&
            product.status !== "sold",
        );

      setCart(validCart);
      setFavorites(validFavorites);
    } catch (error) {
      console.error("Баазаас мэдээлэл татахад алдаа гарлаа:", error);
    }
  };

  useEffect(() => {
    fetchUserItems();
  }, []);

  // 2. САГСАНД НЭМЭХ
  const addToCart = async (product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Та эхлээд нэвтэрч орно уу!");
      return;
    }

    if (product.status === "sold") {
      toast.error("Уучлаарай, энэ бараа аль хэдийн зарагдсан байна!");
      return;
    }

    const isExist = cart.find((item) => item.id === product.id);
    if (isExist) {
      toast.error("Энэ бараа сагсанд нэмэгдсэн байна.");
      return;
    }

    try {
      await api.post("/cart", { product_id: product.id });

      setCart((prev) => [...prev, product]);
      setAnimateCart(true);
      setTimeout(() => setAnimateCart(false), 400);
      toast.success("Сагсанд амжилттай нэмэгдлээ!");
    } catch (error) {
      console.error("Сагсанд хадгалахад алдаа гарлаа:", error);
      toast.error("Алдаа гарлаа!");
    }
  };

  // 3. САГСНААС ХАСАХ
  const removeFromCart = async (productId) => {
    try {
      await api.post("/cart/remove", { product_id: productId });
      setCart((prev) => prev.filter((item) => item.id !== productId));
      toast.success("Сагснаас хасагдлаа");
    } catch (error) {
      console.error("Сагснаас устгахад алдаа гарлаа:", error);
    }
  };

  // 4. САГС ХООСЛОХ
  const clearCart = async () => {
    const itemsToRemove = [...cart];
    setCart([]);
    localStorage.removeItem("cart");

    try {
      for (const item of itemsToRemove) {
        await api.post("/cart/remove", { product_id: item.id });
      }
    } catch (error) {
      console.error("Баазаас сагс хоослоход алдаа гарлаа:", error);
    }
  };

  // 5. ХАДГАЛСАН ЖАГСААЛТАД НЭМЭХ / ХАСАХ
  const toggleFavorite = async (product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Та эхлээд нэвтэрч орно уу!");
      return;
    }

    if (product.status === "sold") {
      toast.error("Уучлаарай, зарагдсан барааг хадгалах боломжгүй!");
      return;
    }

    try {
      await api.post("/favorites/toggle", { product_id: product.id });

      const isExist = favorites.find((f) => f.id === product.id);
      if (isExist) {
        setFavorites(favorites.filter((f) => f.id !== product.id));
        toast.success("Хадгалсан жагсаалтаас хасагдлаа");
      } else {
        setFavorites([...favorites, product]);
        setAnimateFav(true);
        setTimeout(() => setAnimateFav(false), 400);
        toast.success("Хадгалсан жагсаалтад нэмэгдлээ");
      }
    } catch (error) {
      console.error("Лайк хадгалахад алдаа гарлаа:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        animateCart,
        favorites,
        toggleFavorite,
        animateFav,
        fetchUserItems,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
