import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import BrandLogo from '../../components/ui/BrandLogo';
import { LayoutDashboard, ShoppingBag, PackageSearch, Settings, LogOut, Package, Tag, BarChart3, Star, Truck, MessageSquare, IndianRupee, Bell, BellOff, CheckCircle, Users, Menu, X, Home, Folder, LayoutGrid, Diamond, Square, PanelTop, Columns, PieChart, Circle, Asterisk, Mail } from 'lucide-react';
import { useAuth as useAdmin } from '../../context/AuthContext';
import AdminLogin from './AdminLogin';
import { useSettingsContext } from '../../context/SettingsContext';
import { UIProvider } from '../../context/UIContext';
import { useRecentActivity } from '../../queries/useRecentActivity';
import { useOrdersList } from '../../queries/useOrders';
import { useCombinedProducts } from '../../queries/useCombinedProducts';

function AdminLayoutContent() {
  const location = useLocation();
  const { user, logout } = useAdmin();
  const isAuthenticated = user && user.role === 'ADMIN';
  const { settings } = useSettingsContext();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isNotifMuted, setIsNotifMuted] = useState(false);
  
  // Track read notifications locally and persist
  const [readState, setReadState] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_notif_read_state');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { activities } = useRecentActivity();
  
  // Queries for dynamic badges
  const { data: ordersData } = useOrdersList();
  const orders = ordersData?.data || [];
  const { products = [] } = useCombinedProducts();
  
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const outOfStockCount = products.reduce((count, product) => {
    return count + product.variants.filter(v => (v.onHand - v.reserved) <= 0).length;
  }, 0);
  
  const notifications = activities.map(a => ({
    ...a,
    read: readState[a.id] ?? a.read
  }));

  const markAllRead = () => {
    const newReadState = { ...readState };
    activities.forEach(a => { newReadState[a.id] = true; });
    setReadState(newReadState);
    localStorage.setItem('admin_notif_read_state', JSON.stringify(newReadState));
  };
  
  const markAsRead = (id) => {
    const newReadState = { ...readState, [id]: true };
    setReadState(newReadState);
    localStorage.setItem('admin_notif_read_state', JSON.stringify(newReadState));
  };

 const navGroups = [
   {
     title: 'OVERVIEW',
     items: [
       { name: 'Dashboard', path: '/admin', icon: LayoutGrid },
       { name: 'Analytics', path: '/admin/analytics', icon: Diamond },
     ]
   },
   {
     title: 'CATALOGUE',
     items: [
       { name: 'Products', path: '/admin/products', icon: Square },
       { name: 'Categories', path: '/admin/categories', icon: PanelTop },
       { name: 'Inventory', path: '/admin/inventory', icon: Columns, badge: outOfStockCount > 0 ? outOfStockCount : null },
     ]
   },
   {
     title: 'SALES',
     items: [
       { name: 'Orders', path: '/admin/orders', icon: PieChart, badge: pendingOrders > 0 ? pendingOrders : null },
       { name: 'Customers', path: '/admin/customers', icon: Circle },
       { name: 'Promotions', path: '/admin/promotions', icon: Asterisk },
       { name: 'Financials', path: '/admin/financials', icon: IndianRupee },
     ]
   },
   {
     title: 'CONTENT',
     items: [
       { name: 'Reviews', path: '/admin/reviews', icon: Star },
       { name: 'Settings', path: '/admin/settings', icon: Settings },
     ]
   }
 ];

 if (!isAuthenticated) {
 return <AdminLogin />;
 }

 return (
 <div className="min-h-screen bg-slate-50 text-text-primary admin-theme flex">
 
 {isMobileMenuOpen && (
   <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
 )}

 {/* Sidebar */}
 <div className={`w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-50 transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
 <div className="p-4 pb-4 border-b border-slate-200 flex flex-col items-start shrink-0 relative">
  <BrandLogo className="h-10 mb-0" linkTo="/admin" showTagline={false} animate={true} />
  <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
    <X className="w-5 h-5" />
  </button>
 </div>
 
 <nav className="flex-1 flex flex-col pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
 {navGroups.map((group, index) => (
   <div key={group.title} className={index > 0 ? "mt-6" : "mt-4"}>
     <div className="mb-3 pl-8 pr-4 text-[11px] font-bold text-[#7d8fb3] uppercase tracking-[0.15em]">{group.title}</div>
     <div className="flex flex-col gap-1">
       {group.items.map((item) => {
         const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
         const Icon = item.icon;
         return (
           <Link
             key={item.name}
             to={item.path}
             className={`flex items-center justify-between transition-all duration-200 text-[15px] py-2.5 pr-6 border-l-[4px] ${
               isActive 
                 ? 'bg-[#f4f7fe] text-[#3366ff] border-[#3366ff] font-semibold pl-[28px]' 
                 : 'text-[#7d8fb3] hover:bg-[#f8f9fc] hover:text-[#3366ff] border-transparent font-medium pl-[28px]'
             }`}
           >
             <div className="flex items-center gap-4">
               <Icon className={`w-5 h-5 ${isActive ? 'text-[#3366ff]' : 'text-[#a1b0cc]'}`} strokeWidth={isActive ? 2.5 : 2} />
               {item.name}
             </div>
             {item.badge && (
               <span className="bg-[#e11d48] text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                 {item.badge}
               </span>
             )}
           </Link>
         );
       })}
     </div>
   </div>
 ))}
 </nav>


 </div>

 {/* Main Content */}
 <div className="flex-1 md:ml-64 relative min-h-screen flex flex-col w-full min-w-0 bg-slate-50">
 {/* Top Navbar */}
 <header className="h-16 bg-white border-b border-slate-100 shadow-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
 <div className="flex items-center gap-3">
   <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-zinc-500 hover:text-zinc-800 rounded-lg">
     <Menu className="w-6 h-6" />
   </button>
   <div className="hidden sm:block w-96">
   <div className="relative">
   <input 
   type="text" 
   placeholder="Search orders, products, etc." 
   className="w-full bg-zinc-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
   />
   <svg className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
   </div>
   </div>
 </div>
 <div className="flex items-center gap-2 md:gap-4">
 <Link to="/" className="hidden md:flex items-center gap-2 px-4 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
 Go to Home
 </Link>
 
 <div className="flex items-center gap-1">
   <div className="relative">
     <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 rounded-lg transition-colors">
       {isNotifMuted ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
       {!isNotifMuted && notifications.some(n => !n.read) && (
         <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
       )}
     </button>
     
     {isNotifOpen && (
     <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
       <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-zinc-50/80 rounded-t-xl">
         <h3 className="font-bold text-primary-dark">Notifications</h3>
         <div className="flex gap-2">
           <button onClick={markAllRead} className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-600/10 rounded-md transition-colors" title="Mark all as read">
             <CheckCircle className="w-4 h-4" />
           </button>
           <button onClick={() => setIsNotifMuted(!isNotifMuted)} className={`p-1.5 rounded-md transition-colors ${isNotifMuted ? 'text-warning-dark bg-warning/10 hover:bg-warning/20' : 'text-zinc-400 hover:bg-zinc-200'}`} title={isNotifMuted ? 'Unmute' : 'Mute alerts'}>
             {isNotifMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
           </button>
         </div>
       </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-sm">No notifications</div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map(n => (
                <Link 
                  key={n.id} 
                  to={`/admin/orders?orderId=${n.sourceId}`}
                  onClick={() => {
                    setIsNotifOpen(false);
                    markAsRead(n.id);
                  }}
                  className={`block p-4 hover:bg-zinc-50 transition-colors ${!n.read ? 'bg-blue-600/5' : ''}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className={`text-sm ${!n.read ? 'font-bold text-primary-dark' : 'text-zinc-600 font-medium'}`}>{n.title}</p>
                      <p className="text-xs text-zinc-400 mt-1">{n.time}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 bg-blue-600 rounded-full mt-1 shrink-0"></span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
     </div>
   )}
 </div>
 <button 
   onClick={logout} 
   title="Logout" 
   className="p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
 >
   <LogOut className="w-5 h-5" />
 </button>
 </div>
 <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
 <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-600 font-bold text-xs uppercase">
   {user?.name ? user.name.substring(0, 2) : 'AD'}
 </div>
 <div className="hidden sm:block">
 <p className="text-sm font-bold text-text-primary leading-none truncate w-28">{user?.name || 'Administrator'}</p>
 <p className="text-xs text-text-secondary mt-1 truncate w-28">{user?.email}</p>
 </div>
 </div>
 </div>
 </header>

 <main className="max-w-7xl w-full mx-auto space-y-6 px-6 md:px-12 py-8 flex-1">
 <Outlet />
 </main>
 </div>
 </div>
 );
}

export default function AdminLayout() {
  return (
    <UIProvider>
      <AdminLayoutContent />
    </UIProvider>
  );
}
