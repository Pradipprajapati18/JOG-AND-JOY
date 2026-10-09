import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import AnnouncementBar from './components/layout/AnnouncementBar';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import FloatingActions from './components/layout/FloatingActions';
import CartPage from './pages/CartPage';
import LiveChatDrawer from './components/ui/LiveChatDrawer';
import UserProfileModal from './components/ui/UserProfileModal';
import CustomerLoginModal from './components/ui/CustomerLoginModal';
import Footer from './components/layout/Footer';
import { useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

const Home = React.lazy(() => import('./pages/Home'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Collections = React.lazy(() => import('./pages/Collections'));
const AboutUs = React.lazy(() => import('./pages/AboutUs'));
const ContactUs = React.lazy(() => import('./pages/ContactUs'));
const Invoice = React.lazy(() => import('./pages/Invoice'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const KidsPage = React.lazy(() => import('./pages/KidsPage'));
const NewArrivalsPage = React.lazy(() => import('./pages/NewArrivalsPage'));
const DistributorNetworkPage = React.lazy(() => import('./pages/DistributorNetworkPage'));
const WhyUs = React.lazy(() => import('./pages/WhyUs'));
const OrderTracking = React.lazy(() => import('./pages/OrderTracking'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const CustomerAccount = React.lazy(() => import('./pages/CustomerAccount'));

const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders'));
const AdminCustomers = React.lazy(() => import('./pages/admin/AdminCustomers'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const AdminInventory = React.lazy(() => import('./pages/admin/AdminInventory'));
const AdminPromotions = React.lazy(() => import('./pages/admin/AdminPromotions'));
const AdminAnalytics = React.lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminReviews = React.lazy(() => import('./pages/admin/AdminReviews'));
const AdminMessages = React.lazy(() => import('./pages/admin/AdminMessages'));
const AdminFinancials = React.lazy(() => import('./pages/admin/AdminFinancials'));
const AdminCategories = React.lazy(() => import('./pages/admin/AdminCategories'));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  useEffect(() => {
    const handleSamePageClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.href) {
        try {
          const url = new URL(link.href);
          if (url.pathname === window.location.pathname && url.origin === window.location.origin && !url.hash) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } catch (err) {
        }
      }
    };
    document.addEventListener('click', handleSamePageClick);
    return () => document.removeEventListener('click', handleSamePageClick);
  }, []);

  return null;
}

function StoreLayout({ isLiveChatOpen, setIsLiveChatOpen, isProfileOpen, setIsProfileOpen }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen w-full relative bg-white text-slate-800 flex flex-col font-sans selection:bg-[#AEE6FF] selection:text-slate-900 pb-16 md:pb-0">
      <AnnouncementBar />
      <Navbar onOpenProfile={() => setIsProfileOpen(true)} />

      <LiveChatDrawer isOpen={isLiveChatOpen} onClose={() => setIsLiveChatOpen(false)} />
      
      {isAuthenticated ? (
        <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      ) : (
        <CustomerLoginModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      )}
      
      <div className="grow">
        <Outlet context={{ setIsProfileOpen, setIsLiveChatOpen }} />
      </div>

      <Footer />
      <BottomNav onOpenProfile={() => setIsProfileOpen(true)} />
      <FloatingActions onOpenLiveChat={() => setIsLiveChatOpen(true)} />
    </div>
  );
}

import { AuthProvider } from './context/AuthContext';
import AdminRoute from './components/layout/AdminRoute';

export default function App() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <SettingsProvider>
            <Router>
              <ScrollToTop />
              <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center text-slate-500">Loading...</div>}>
              <Routes>
              {/* Admin Routes - Completely Isolated */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="promotions" element={<AdminPromotions />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="financials" element={<AdminFinancials />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Route>

              {/* Storefront Routes */}
              <Route element={<StoreLayout isLiveChatOpen={isLiveChatOpen} setIsLiveChatOpen={setIsLiveChatOpen} isProfileOpen={isProfileOpen} setIsProfileOpen={setIsProfileOpen} />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/kids" element={<KidsPage />} />
                <Route path="/men" element={<Navigate to="/products?category=Male" replace />} />
                <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/why-us" element={<WhyUs />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/invoice/:orderId" element={<Invoice />} />
                <Route path="/track-order" element={<OrderTracking />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/distributor-network" element={<DistributorNetworkPage />} />
                <Route path="/account/*" element={<CustomerAccount />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              </Routes>
              </Suspense>
            </Router>
          </SettingsProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
