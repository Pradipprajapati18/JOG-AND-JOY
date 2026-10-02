import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Package, MapPin, User, Shield, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CustomerOrders from './CustomerOrders';
import CustomerOrderDetails from './CustomerOrderDetails';
import CustomerAddresses from './CustomerAddresses';
import CustomerProfile from './CustomerProfile';

export default function CustomerAccount() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { name: 'My Orders', path: '/account/orders', icon: <Package className="w-5 h-5" /> },
    { name: 'Saved Addresses', path: '/account/addresses', icon: <MapPin className="w-5 h-5" /> },
    { name: 'Account Info', path: '/account/profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-72 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-black text-slate-800">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{user.name || 'Customer'}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
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
