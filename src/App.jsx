import { Toaster } from "react-hot-toast";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Outlet, // <--- ЭНИЙГ ШИНЭЭР НЭМСЭН (Хуудас солих зориулалттай)
} from "react-router-dom";

import { AppProvider } from "./context/AppContext";

// Давтагдах хэсгүүд
import MainHeader from "./components/MainHeader";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Энгийн хэрэглэгчийн хуудсууд
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import PaymentPage from "./pages/PaymentPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AddListingPage from "./pages/AddListingPage";
import SellerProfilePage from "./pages/SellerProfilePage";
import SuccessPage from "./pages/SuccessPage";
import RatingPage from "./pages/RatingPage";
import ChatPage from "./pages/ChatPage";
import EditProfilePage from "./pages/EditProfilePage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import CheckoutPage from "./pages/CheckoutPage";
import EditListingPage from "./pages/EditListingPage";

// === ШИНЭ: АДМИН ХУУДСУУДЫН ИМПОРТ ===
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDisputes from "./pages/admin/AdminDisputes";
import AdminSettings from "./pages/admin/AdminSettings";

// 1. ЭНГИЙН ХЭРЭГЛЭГЧИЙН ЕРӨНХИЙ ЗАГВАР (Header, Footer-тэй)
const AppLayout = () => {
  const location = useLocation();
  const path = location.pathname;

  const simpleHeaderRoutes = ["/", "/login", "/register"];
  const showSimpleHeader = simpleHeaderRoutes.includes(path);

  const authRoutes = ["/login", "/register", "/chat"];
  const isAuthPage = authRoutes.includes(path);

  return (
    <div className="flex flex-col min-h-screen font-display bg-background-light dark:bg-background-dark text-text-main dark:text-white transition-colors duration-200">
      {showSimpleHeader ? <Header /> : <MainHeader />}

      <div className="flex-grow flex flex-col">
        {/* === ӨӨРЧЛӨЛТ: Энд хуудсууд ээлжилж гарах цэгийг Outlet гэж зааж өгөв === */}
        <Outlet />
      </div>

      {!isAuthPage && <Footer />}
    </div>
  );
};

// 2. ГОЛ АППЛИКЭЙШНИЙ ЗАМ ЗААГЧ (ROUTER)
function App() {
  return (
    <AppProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          {/* === А: ЭНГИЙН ХЭРЭГЛЭГЧИЙН ХУУДСУУД (AppLayout дотор орно) === */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product-detail/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/payment/:orderId" element={<PaymentPage />} />
            <Route path="/order-detail" element={<OrderDetailPage />} />
            <Route path="/add-listing" element={<AddListingPage />} />
            <Route path="/edit-listing/:id" element={<EditListingPage />} />
            <Route path="/seller-profile/:id" element={<SellerProfilePage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/rating" element={<RatingPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/checkout/:id" element={<CheckoutPage />} />
          </Route>

          {/* === Б: АДМИНЫ ХУУДСУУД (Тусдаа AdminLayout дотор орно) === */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="disputes" element={<AdminDisputes />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
