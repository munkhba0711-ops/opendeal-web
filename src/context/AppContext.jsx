import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [animateCart, setAnimateCart] = useState(false);
  const [animateFav, setAnimateFav] = useState(false);

  // 1. ДЭЛГЭЦ АЧААЛЛАХАД БААЗААС ТАТАХ (Зарагдсан барааг шууд устгах)
  const fetchUserItems = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCart([]);
      setFavorites([]);
      return;
    }

    try {
      const response = await axios.get("http://127.0.0.1:8000/api/user/items", {
        headers: { Authorization: `Bearer ${token}` },
      });

     // ШИНЭЧИЛСЭН БА БАТТАЙ ЗАСВАР: Баазаас мэдээлэл ямар ч хэлбэрээр ирсэн алдаа гарахгүй уншина
      const validCart = (response.data.cart || [])
        .map((item) => item.product ? item.product : item)
        .filter((product) => product !== null && product !== undefined && product.status !== "sold");

      const validFavorites = (response.data.favorites || [])
        .map((item) => item.product ? item.product : item)
        .filter((product) => product !== null && product !== undefined && product.status !== "sold");

      setCart(validCart);
      setFavorites(validFavorites);
    } catch (error) {
      console.error("Баазаас мэдээлэл татахад алдаа гарлаа:", error);
    }
  };

  useEffect(() => {
    fetchUserItems();
  }, []);

  // 2. САГСАНД НЭМЭХ (Зарагдсан барааг block хийх)
  const addToCart = async (product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Та эхлээд нэвтэрч орно уу!");
      return;
    }

    // ДАВХАР ХАМГААЛАЛТ: Зарагдсан барааг ямар ч тохиолдолд сагсанд нэмэхгүй!
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
      await axios.post(
        "http://127.0.0.1:8000/api/cart",
        { product_id: product.id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

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
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/cart/remove",
        { product_id: productId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setCart((prev) => prev.filter((item) => item.id !== productId));
      toast.success("Сагснаас хасагдлаа");
    } catch (error) {
      console.error("Сагснаас устгахад алдаа гарлаа:", error);
    }
  };

  // 4. САГС ХООСЛОХ
  const clearCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const itemsToRemove = [...cart];
    setCart([]);
    localStorage.removeItem("cart");

    try {
      for (const item of itemsToRemove) {
        await axios.post(
          "http://127.0.0.1:8000/api/cart/remove",
          { product_id: item.id },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
    } catch (error) {
      console.error("Баазаас сагс хоослоход алдаа гарлаа:", error);
    }
  };

  // 5. ХАДГАЛСАН ЖАГСААЛТАД НЭМЭХ / ХАСАХ (Wishlist)
  const toggleFavorite = async (product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Та эхлээд нэвтэрч орно уу!");
      return;
    }

    // ХАМГААЛАЛТ: Зарагдсан барааг лайк дарах / хадгалах боломжгүй
    if (product.status === "sold") {
      toast.error("Уучлаарай, зарагдсан барааг хадгалах боломжгүй!");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/favorites/toggle",
        { product_id: product.id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

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
