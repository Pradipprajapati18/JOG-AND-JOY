import React, { useLayoutEffect, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, CheckCheck, Package, Tag, Sparkles, ArrowRight } from 'lucide-react';
import { Search, Heart, User, ShoppingBag, Home } from '../ui/CustomIcons';
import BrandLogo from '../ui/BrandLogo';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useOrdersList } from '../../queries/useOrders';
import { usePromotionsList } from '../../queries/usePromotions';

import './CardNav.css';
import './StaggeredMenu.css'; 

const ArrowUpRight = ({ className, 'aria-hidden': ariaHidden }) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className={className} aria-hidden={ariaHidden} height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M19 12a.75.75 0 0 1-1.5 0V7.56L6.53 18.53a.75.75 0 0 1-1.06-1.06l10.97-10.97H12a.75.75 0 0 1 0-1.5h7.25c.414 0 .75.336.75.75V12Z" clipRule="evenodd"></path>
  </svg>
);

const CardNav = ({
  items,
  baseColor = '#FFF8EC',
  menuButtonColor = '#2D2D2D',
  openMenuButtonColor = '#EF4A45',
  accentColor = '#EF4A45',
  onOpenProfile
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [textLines, setTextLines] = useState(['Menu', 'Close']);

  const { user } = useAuth();
  const { data: userOrdersData } = useOrdersList(user?.id ? { customerId: user.id } : undefined);
  const { data: promosData } = usePromotionsList();

  const [readState, setReadState] = useState(() => {
    try {
      const stored = localStorage.getItem('website_notif_read_state');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const myOrders = useMemo(() => {
    if (!user?.id) return [];
    return (userOrdersData?.data || []).filter(
      (o) => o.customerId === user.id || o.customerEmail === user.email
    );
  }, [user, userOrdersData]);

  const activePromos = useMemo(() => {
    return (promosData?.data || []).filter((p) => p.isActive !== false);
  }, [promosData]);

  const notifications = useMemo(() => {
    const list = [];

    // Order status updates for current user
    if (myOrders.length > 0) {
      myOrders.slice(0, 4).forEach((order) => {
        const orderNum = order.orderNumber || `#${order.id?.substring(0, 8).toUpperCase()}`;
        const statusText = order.status ? order.status.charAt(0) + order.status.slice(1).toLowerCase() : 'Updated';
        list.push({
          id: `order-${order.id}-${order.status}`,
          type: 'order',
          title: `Order ${orderNum}: ${statusText}`,
          description: `Total ₹${order.totalAmount || order.total || 0} • ${order.items?.length || 1} item(s)`,
          time: new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          link: `/account/orders/${String(order.orderNumber || order.id || '').replace(/^#/, '')}`,
        });
      });
    }

    // Active promotions / offers
    if (activePromos.length > 0) {
      activePromos.slice(0, 3).forEach((promo) => {
        list.push({
          id: `promo-${promo.id}`,
          type: 'promo',
          title: `${promo.code} — ${promo.discountType === 'PERCENT' ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`}`,
          description: promo.description || `Special offer on your order! Apply code at checkout.`,
          time: 'Active Offer',
          link: '/products',
        });
      });
    }

    // Default welcome notice
    list.push({
      id: 'welcome-jog-joy',
      type: 'announcement',
      title: 'Welcome to Jog & Joy 🎉',
      description: 'Discover trendy, high-quality, and joyful kids wear designed for everyday play.',
      time: 'Jog & Joy',
      link: '/products',
    });

    return list;
  }, [myOrders, activePromos]);

  const markAllRead = () => {
    const updated = { ...readState };
    notifications.forEach((n) => {
      updated[n.id] = true;
    });
    setReadState(updated);
    try {
      localStorage.setItem('website_notif_read_state', JSON.stringify(updated));
    } catch {}
  };

  const markAsRead = (id) => {
    const updated = { ...readState, [id]: true };
    setReadState(updated);
    try {
      localStorage.setItem('website_notif_read_state', JSON.stringify(updated));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !readState[n.id]).length;

  // Click outside listener for notification dropdown
  useEffect(() => {
    if (!isNotifOpen) return;
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isNotifOpen]);

  const navRef = useRef(null);
  const cardsRef = useRef([]);
  const tlRef = useRef(null);
  
  // StaggeredMenu refs for header animations
  const toggleBtnRef = useRef(null);
  const iconRef = useRef(null);
  const plusHRef = useRef(null);
  const plusVRef = useRef(null);
  const textInnerRef = useRef(null);
  const spinTweenRef = useRef(null);
  const colorTweenRef = useRef(null);
  const textCycleAnimRef = useRef(null);

  const { cartTotalCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const closeMenuRef = useRef(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      if (!closeMenuRef.current) {
        lastScrollY = window.scrollY;
      } else if (Math.abs(window.scrollY - lastScrollY) > 10) {
        closeMenuRef.current();
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 96;

    const contentEl = navEl.querySelector('.card-nav-content');
    if (contentEl) {
      const wasVisible = contentEl.style.visibility;
      const wasPointerEvents = contentEl.style.pointerEvents;
      const wasPosition = contentEl.style.position;
      const wasHeight = contentEl.style.height;

      contentEl.style.visibility = 'visible';
      contentEl.style.pointerEvents = 'auto';
      contentEl.style.position = 'static';
      contentEl.style.height = 'auto';

      contentEl.offsetHeight; // trigger reflow

      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const topBar = isMobile ? 64 : 80;
      const padding = 16;
      const contentHeight = contentEl.scrollHeight;

      contentEl.style.visibility = wasVisible;
      contentEl.style.pointerEvents = wasPointerEvents;
      contentEl.style.position = wasPosition;
      contentEl.style.height = wasHeight;

      const totalHeight = topBar + contentHeight + padding;
      return Math.min(totalHeight, window.innerHeight);
    }
    return 96;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const baseHeight = isMobile ? 64 : 80;

    gsap.set(navEl, { height: baseHeight, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease: 'power3.out'
    });

    tl.to(cardsRef.current.filter(Boolean), { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.08 }, '-=0.1');

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [items]);




  // StaggeredMenu Header Animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;
      if (!plusH || !plusV || !icon || !textInner) return;

      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      gsap.set(textInner, { yPercent: 0 });
      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor]);

  const animateIcon = useCallback(opening => {
    const icon = iconRef.current;
    if (!icon) return;
    spinTweenRef.current?.kill();
    if (opening) {
      spinTweenRef.current = gsap.to(icon, { rotate: 225, duration: 0.8, ease: 'power4.out', overwrite: 'auto' });
    } else {
      spinTweenRef.current = gsap.to(icon, { rotate: 0, duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' });
    }
  }, []);

  const animateColor = useCallback(opening => {
    const btn = toggleBtnRef.current;
    if (!btn) return;
    colorTweenRef.current?.kill();
    const targetColor = opening ? openMenuButtonColor : menuButtonColor;
    colorTweenRef.current = gsap.to(btn, {
      color: targetColor,
      delay: 0.18,
      duration: 0.3,
      ease: 'power2.out'
    });
  }, [openMenuButtonColor, menuButtonColor]);

  const animateText = useCallback(opening => {
    const inner = textInnerRef.current;
    if (!inner) return;
    textCycleAnimRef.current?.kill();

    const currentLabel = opening ? 'Menu' : 'Close';
    const targetLabel = opening ? 'Close' : 'Menu';
    const cycles = 3;
    const seq = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === 'Menu' ? 'Close' : 'Menu';
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);
    setTextLines(seq);

    gsap.set(inner, { yPercent: 0 });
    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: 'power4.out'
    });
  }, []);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    const target = !isExpanded;
    setIsExpanded(target);

    if (target) {
      setIsSearchOpen(false);
      setIsNotifOpen(false);
      tl.play(0);
    } else {
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
    animateIcon(target);
    animateColor(target);
    animateText(target);
  };

  const closeMenu = () => {
    if (isExpanded) {
      toggleMenu();
    }
  };
  
  closeMenuRef.current = isExpanded ? closeMenu : null;

  useEffect(() => {
    closeMenu();
    setIsNotifOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setIsNotifOpen(false);
      setSearchQuery('');
    }
  };

  const setCardRef = i => el => {
    if (el) cardsRef.current[i] = el;
  };

  // Calculate circular fan parameters based on index
  const getCardAnimation = (idx, total) => {
    if (isMobile) {
      return {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0, rotate: 0, x: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { delay: idx * 0.08, duration: 0.4, ease: [0.25, 1, 0.5, 1] }
      };
    }
    
    // Desktop circular fan effect
    const mid = (total - 1) / 2;
    const offset = idx - mid; // e.g., for 3 items: -1, 0, 1
    const rotate = offset * 12; // -12deg, 0deg, 12deg
    const yOffset = Math.abs(offset) * 15; // 15px for outer cards, 0px for middle
    const xOffset = offset * 15; // spread them out slightly more horizontally

    return {
      initial: { opacity: 0, y: -40, rotate: 0, x: 0, scale: 0.95 },
      animate: { 
        opacity: 1, 
        y: yOffset, 
        rotate: rotate, 
        x: xOffset,
        scale: 1 
      },
      exit: { opacity: 0, y: -40, rotate: 0, x: 0, scale: 0.95 },
      transition: { 
        delay: idx * 0.06, 
        type: 'spring', 
        stiffness: 150, 
        damping: 15, 
        mass: 1 
      }
    };
  };

  return (
    <div 
      className={`card-nav-container block select-none`}
      style={accentColor ? { ['--sm-accent']: accentColor } : undefined}
    >
      {/* Background Blur Overlay */}
      <div className={`card-nav-overlay ${isExpanded ? 'open' : ''}`} onClick={closeMenu} aria-hidden="true" />

      <nav ref={navRef} className={`card-nav ${isExpanded ? 'open' : ''}`} style={{ backgroundColor: baseColor }}>
        
        {/* Exact StaggeredMenu Header Structure */}
        <header className={`staggered-menu-header w-full ${isScrolled ? 'scrolled' : ''} ${isExpanded ? 'menu-open' : ''}`} aria-label="Main navigation header" style={{position: 'absolute', top: 0, left: 0, right: 0}}>
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              ref={toggleBtnRef}
              className="sm-toggle"
              aria-label={isExpanded ? 'Close menu' : 'Open menu'}
              aria-expanded={isExpanded}
              onClick={toggleMenu}
              type="button"
            >
              <span className="sm-toggle-textWrap hidden md:inline-block" aria-hidden="true">
                <span ref={textInnerRef} className="sm-toggle-textInner">
                  {textLines.map((l, i) => (
                    <span className="sm-toggle-line" key={i}>
                      {l}
                    </span>
                  ))}
                </span>
              </span>
              <span className="md:hidden flex items-center justify-center text-slate-800 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                {isExpanded ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </span>
              <span ref={iconRef} className="sm-icon hidden md:inline-flex" aria-hidden="true">
                <span ref={plusHRef} className="sm-icon-line" />
                <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
              </span>
            </button>

          </div>

          <div className="sm-logo absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" aria-label="Logo">
            <BrandLogo className="h-7 sm:h-8 md:h-10" showTagline={false} animate={true} />
          </div>

          <div className="sm-header-right">
            <Link
              to="/"
              className="action-btn hidden-mobile"
              title="Home"
              onClick={() => {
                if (isExpanded) closeMenu();
              }}
            >
              <Home className="w-5 h-5 text-slate-700" />
            </Link>

            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (isNotifOpen) setIsNotifOpen(false);
                if (isExpanded) closeMenu();
              }}
              className="action-btn"
              title="Search"
            >
              <Search className="w-5 h-5 text-slate-700" />
            </button>

            <button
              onClick={() => {
                onOpenProfile?.();
                if (isExpanded) closeMenu();
                if (isNotifOpen) setIsNotifOpen(false);
              }}
              className="action-btn hidden-mobile group"
              title="Profile"
            >
              <img src="/profile_icon.webp" alt="Profile" className="w-5 h-5 object-contain transition-all duration-200 group-hover:scale-110 group-hover:brightness-110" />
            </button>

            {/* Notification Button & Responsive Dropdown Panel */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (isExpanded) closeMenu();
                  if (isSearchOpen) setIsSearchOpen(false);
                }}
                className="action-btn relative"
                title="Notifications"
                aria-label="Notifications"
                aria-expanded={isNotifOpen}
              >
                <Bell className="w-5 h-5 text-slate-700" />
                {unreadCount > 0 && (
                  <span className="badge">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <>
                  {/* Backdrop for click outside dismiss on mobile */}
                  <div 
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] md:hidden"
                    onClick={() => setIsNotifOpen(false)} 
                  />

                  {/* Responsive Notification Panel */}
                  <div className="fixed inset-x-3 top-18 sm:inset-x-auto sm:absolute sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-85 md:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 rounded-t-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-[#EF4A45] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                            {unreadCount} New
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllRead}
                            className="p-1.5 text-xs text-slate-500 hover:text-[#EF4A45] hover:bg-[#EF4A45]/10 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                            title="Mark all as read"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Mark read</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsNotifOpen(false)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                          title="Close"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto overscroll-contain divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                          <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                          No notifications
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const isUnread = !readState[n.id];
                          return (
                            <Link
                              key={n.id}
                              to={n.link}
                              onClick={() => {
                                markAsRead(n.id);
                                setIsNotifOpen(false);
                              }}
                              className={`flex items-start gap-3 p-3.5 sm:p-4 hover:bg-slate-50 transition-colors ${
                                isUnread ? 'bg-amber-50/40' : ''
                              }`}
                            >
                              <div className={`p-2 rounded-xl shrink-0 ${
                                n.type === 'order'
                                  ? 'bg-blue-50 text-blue-600'
                                  : n.type === 'promo'
                                  ? 'bg-red-50 text-[#EF4A45]'
                                  : 'bg-amber-50 text-amber-600'
                              }`}>
                                {n.type === 'order' ? (
                                  <Package className="w-4 h-4" />
                                ) : n.type === 'promo' ? (
                                  <Tag className="w-4 h-4" />
                                ) : (
                                  <Sparkles className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <h4 className={`text-xs sm:text-sm leading-tight truncate ${
                                    isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                                  }`}>
                                    {n.title}
                                  </h4>
                                  {isUnread && (
                                    <span className="w-2 h-2 bg-[#EF4A45] rounded-full shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] sm:text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                  {n.description}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1.5 inline-block font-medium">
                                  {n.time}
                                </span>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>

                    <div className="p-2.5 sm:p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                      {user ? (
                        <Link
                          to="/account/orders"
                          onClick={() => setIsNotifOpen(false)}
                          className="w-full text-center py-1.5 font-bold text-[#EF4A45] hover:underline flex items-center justify-center gap-1.5"
                        >
                          View all orders & history
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsNotifOpen(false);
                            onOpenProfile?.();
                          }}
                          className="w-full text-center py-1.5 font-bold text-[#EF4A45] hover:underline"
                        >
                          Sign in to view your order updates →
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>


            <Link
              to="/wishlist"
              className="action-btn relative hidden-mobile"
              title="Wishlist"
              onClick={() => {
                if (isExpanded) closeMenu();
              }}
            >
              <Heart className="w-5 h-5 text-slate-700" />
              {wishlistCount > 0 && (
                <span className="badge">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="card-nav-cta-button hidden md:flex"
              title="Bag"
              onClick={() => {
                if (isExpanded) closeMenu();
              }}
            >
              <div className="cta-content">
                <ShoppingBag className="w-4 h-4" />
                <span className="font-bold">Bag</span>
                {cartTotalCount > 0 && (
                  <span className="cta-badge">
                    {cartTotalCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* CardNav Expandable Content */}
        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {(items || []).slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) => (
                  <Link 
                    key={`${lnk.label}-${i}`} 
                    className="nav-card-link" 
                    to={lnk.href} 
                    aria-label={lnk.ariaLabel}
                    onClick={closeMenu}
                  >
                    <ArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                    {lnk.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Floating Search Bar Overlay */}
      {isSearchOpen && (
        <div className="card-nav-search-overlay" style={{position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', padding: '16px', zIndex: 10, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}>
          <form onSubmit={handleSearchSubmit} className="search-form flex items-center gap-2">
            <Search className="search-icon w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="search-input flex-1 p-2 border border-slate-200 rounded outline-none font-medium"
            />
            <button type="submit" className="search-submit px-4 py-2 bg-slate-900 text-white rounded font-bold text-sm">
              Search
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CardNav;
