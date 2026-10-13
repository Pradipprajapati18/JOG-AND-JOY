import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Package, MapPin, User, Shield, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CustomerOrders from './CustomerOrders';
import CustomerOrderDetails from './CustomerOrderDetails';
import CustomerAddresses from './CustomerAddresses';
import CustomerProfile from './CustomerProfile';
import ClothDoodlesBackground from '../components/ui/ClothDoodlesBackground';

export default function CustomerAccount() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isOrderDetailsPage = location.pathname.includes('/orders/');
  if (!user && !isOrderDetailsPage) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { name: 'My Orders', path: '/account/orders', icon: <Package className="w-5 h-5" /> },
    { name: 'Saved Addresses', path: '/account/addresses', icon: <MapPin className="w-5 h-5" /> },
    { name: 'Account Info', path: '/account/profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF7] relative overflow-hidden pt-24 pb-16 px-4 md:px-8">
      {/* Playful Ambient Background Radiant Glows */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-sky-200/25 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-rose-200/25 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Floating Animated Kids Clothing Doodles */}
      <ClothDoodlesBackground />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-72 shrink-0">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-amber-100/80">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FFD800] to-[#EF4A45] flex items-center justify-center text-xl font-black text-white shadow-md">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{user?.name || 'Aarav Sharma'}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || 'aarav.sharma@example.com'}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-colors ${
                        isActive 
                          ? 'bg-[#EF4A45]/10 text-[#EF4A45] font-bold' 
                          : 'text-slate-600 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#EF4A45]' : 'text-slate-400'}`} />
                    </Link>
                  );
                })}
              </nav>

              <hr className="my-6 border-slate-100" />
              
              <button 
                onClick={() => logout()}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <Routes>
              <Route index element={<Navigate to="orders" replace />} />
              <Route path="orders" element={<CustomerOrders />} />
              <Route path="orders/:id" element={<CustomerOrderDetails />} />
              
              <Route path="addresses" element={<CustomerAddresses />} />
              <Route path="profile" element={<CustomerProfile />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}
