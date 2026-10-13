import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function BottomNav({ onOpenProfile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartTotalCount } = useCart();
  const { wishlistCount } = useWishlist();

  // Restore the original navigation items
  const navItems = [
    { id: 'home', label: 'Home', path: '/', icon: Home, badge: 0 },
    { id: 'shop', label: 'Shop', path: '/products', icon: Grid, badge: 0 },
    { id: 'wishlist', label: 'Wishlist', path: '/wishlist', icon: Heart, badge: wishlistCount },
    { id: 'cart', label: 'Bag', action: () => navigate('/cart'), icon: ShoppingBag, badge: cartTotalCount },
    { id: 'profile', label: 'Profile', action: onOpenProfile, icon: User, badge: 0 }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === '/') setActiveIndex(0);
    else if (currentPath === '/products') setActiveIndex(1);
    else if (currentPath === '/wishlist') setActiveIndex(2);
    else if (currentPath === '/cart' || currentPath === '/checkout') setActiveIndex(3);
    // Profile is an action
  }, [location.pathname]);

  const handleNavClick = (index, item) => {
    setActiveIndex(index);
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] overflow-hidden h-[64px]">
      <div className="relative flex items-center justify-between h-full w-full">
        
        {/* Animated Spotlight Indicator Container */}
        <div 
          className="absolute top-0 h-full w-[20%] transition-transform duration-500 ease-out flex justify-center pointer-events-none"
          style={{ transform: `translateX(${(activeIndex) * 100}%)`, left: 0 }}
        >
          {/* Top glowing bar */}
          <div className="absolute top-0 w-8 h-[3px] bg-[#EF4A45] rounded-b-md shadow-[0_2px_8px_rgba(239,74,69,0.5)]" />
          
          {/* Spotlight cone gradient (Darkened slightly for visibility on white) */}
          <div 
            className="absolute top-[3px] w-16 h-[60px] bg-gradient-to-b from-[#EF4A45]/15 to-transparent mix-blend-multiply"
            style={{ clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)' }}
          />
        </div>

        {/* Navigation Icons */}
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeIndex === index;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(index, item)}
              className="relative w-[20%] h-full flex flex-col items-center justify-center z-10 pt-1 pb-1 transition-transform active:scale-95"
            >
              <div className="relative flex flex-col items-center">
                <Icon 
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive 
                      ? 'text-[#EF4A45] scale-110' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] font-extrabold mt-0.5 transition-colors duration-300 ${
                    isActive ? 'text-[#EF4A45]' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
                
                {/* Badge */}
                {item.badge > 0 && (
                  <span className={`absolute -top-1.5 -right-3 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black border border-white transition-colors shadow-sm ${isActive ? 'bg-white text-[#EF4A45] border-[#EF4A45]' : 'bg-[#EF4A45] text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
