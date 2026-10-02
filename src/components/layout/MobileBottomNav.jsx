import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, Plus, User, Bell } from 'lucide-react';

export default function MobileBottomNav({ onOpenProfile }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Define the navigation items to precisely match the screenshot
  const navItems = [
    { id: 'home', icon: Home, path: '/' },
    { id: 'wishlist', icon: Heart, path: '/products' },
    { id: 'add', icon: Plus, path: '/checkout' }, // Using Plus icon for middle button
    { id: 'profile', icon: User, action: onOpenProfile },
    { id: 'notifications', icon: Bell, action: () => alert("Notifications coming soon!") }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === '/') setActiveIndex(0);
    else if (currentPath === '/products') setActiveIndex(1);
    else if (currentPath === '/checkout') setActiveIndex(2);
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
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 pointer-events-none">
      <div className="relative bg-[#18181A] rounded-[2rem] h-[60px] flex items-center justify-around px-2 shadow-2xl border border-white/5 pointer-events-auto">
        
        {/* Animated Spotlight Indicator Container */}
        <div 
          className="absolute top-0 h-full w-[20%] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex justify-center pointer-events-none"
          style={{ transform: `translateX(${(activeIndex) * 100}%)`, left: 0 }}
        >
          {/* Top glowing bar */}
          <div className="absolute top-0 w-8 h-[3px] bg-[#EF4A45] rounded-b-md shadow-[0_2px_10px_2px_rgba(239,74,69,0.8)]" />
          
          {/* Spotlight cone gradient */}
          <div 
            className="absolute top-[3px] w-16 h-[56px] bg-gradient-to-b from-[#EF4A45]/25 to-transparent mix-blend-screen"
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
              className="relative w-full h-full flex items-center justify-center z-10 transition-transform active:scale-90"
            >
              {item.id === 'profile' ? (
                <img 
                  src="/profile_icon.png" 
                  alt="Profile" 
                  className={`w-6 h-6 rounded-full object-cover transition-all duration-300 ${
                    isActive ? 'drop-shadow-[0_0_12px_rgba(239,74,69,0.8)] border border-[#EF4A45]' : 'border border-transparent hover:border-[#D1D1D6]'
                  }`} 
                />
              ) : (
                <Icon 
                  className={`w-6 h-6 transition-all duration-300 ${
                    isActive 
                      ? 'text-[#EF4A45] drop-shadow-[0_0_12px_rgba(239,74,69,0.8)]' 
                      : 'text-[#8E8E93] hover:text-[#D1D1D6]'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
