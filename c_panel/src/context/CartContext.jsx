import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePromotionsList, useUpdatePromotion } from '../queries/usePromotions';
import { useSettings } from '../queries/useSettings';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import ToastContainer from '../components/ui/ToastContainer';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('kids_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync Cart to Supabase whenever it changes and user is logged in
  useEffect(() => {
    const syncToCloud = async () => {
      if (user?.id && !isSyncing) {
        await supabase.from('users').update({ cart }).eq('id', user.id);
      }
    };
    
    try {
      localStorage.setItem('kids_cart', JSON.stringify(cart));
    } catch {}
    
    syncToCloud();
  }, [cart, user?.id]);

  // Load and merge Cart from Supabase when user logs in
  useEffect(() => {
    const fetchAndMergeCart = async () => {
      if (!user?.id) {
        // User logged out, clear cart to prevent leakage
        setCart([]);
        localStorage.removeItem('kids_cart');
        return;
      }

      setIsSyncing(true);
      const { data, error } = await supabase
        .from('users')
        .select('cart')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        const remoteCart = data.cart || [];
        
        // Merge logic: Combine local cart (built while logged out) with remote cart
        setCart(prevLocal => {
          if (prevLocal.length === 0) return remoteCart;
          
          let merged = [...remoteCart];
          prevLocal.forEach(localItem => {
            const existingIdx = merged.findIndex(
              (item) => item.id === localItem.id && item.size === localItem.size && item.color === localItem.color
            );
            if (existingIdx > -1) {
               // If item exists in both, keep the highest quantity or sum them
               merged[existingIdx].quantity = Math.max(merged[existingIdx].quantity, localItem.quantity);
            } else {
               merged.push(localItem);
            }
          });
          
          // Save merged cart back to cloud immediately
          supabase.from('users').update({ cart: merged }).eq('id', user.id);
          return merged;
        });
      }
      setIsSyncing(false);
    };

    fetchAndMergeCart();
  }, [user?.id]);

  const showToast = (msg, type = 'success', description = '') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, msg, type, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };
  
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product, selectedSize = '4Y-5Y', selectedColor = '#AEE6FF', e = null, quantity = 1, fromDetails = false, availableStock = Infinity) => {
    const rawPrice = product.price ?? 499;
    const numericPrice = typeof rawPrice === 'number'
      ? rawPrice
      : parseInt(String(rawPrice).replace(/[^0-9]/g, ''), 10) || 499;

    const existingIdx = cart.findIndex(
      (item) => item.id === product.id && item.size === selectedSize && item.color === selectedColor
    );

    if (existingIdx > -1) {
      const currentQty = cart[existingIdx].quantity;
      if (currentQty + quantity > availableStock) {
        showToast(`Only ${availableStock} units available in stock.`, 'error');
        return;
      }
      const updated = [...cart];
      updated[existingIdx].quantity += quantity;
      setCart(updated);
    } else {
      if (quantity > availableStock) {
        showToast(`Only ${availableStock} units available in stock.`, 'error');
        return;
      }
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          price: rawPrice,
          numericPrice: numericPrice,
          image: product.image,
          size: selectedSize,
          color: selectedColor,
          quantity: quantity,
          stock: availableStock
        }
      ]);
    }
    
    showToast(`Added ${product.name} to bag!`);
    setIsCartOpen(true);
  };

  const removeFromCart = (id, size, color) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.size === size && item.color === color)));
  };

  const updateQuantity = (id, size, color, delta) => {
    const itemIdx = cart.findIndex(item => item.id === id && item.size === size && item.color === color);
    if (itemIdx > -1) {
      const item = cart[itemIdx];
      const newQty = item.quantity + delta;
      if (newQty > (item.stock || Infinity)) {
        showToast(`Only ${item.stock} units available in stock.`, 'error');
        return;
      }
      if (newQty <= 0) {
        setCart(cart.filter((_, idx) => idx !== itemIdx));
      } else {
        const updated = [...cart];
        updated[itemIdx] = { ...item, quantity: newQty };
        setCart(updated);
      }
    }
  };

  const { data: promosData } = usePromotionsList();
  const { data: settingsData } = useSettings();
  const settings = settingsData || {};
  
  const [autoCoupon, setAutoCoupon] = useState(null);

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.numericPrice * item.quantity, 0);

  useEffect(() => {
    const promos = promosData?.data || [];
    const now = new Date();
    const activeAutoPromos = promos.filter(p => 
      p.active && 
      p.method === 'automatic' &&
      (!p.startsAt || new Date(p.startsAt) <= now) && 
      (!p.expiresAt || new Date(p.expiresAt) >= now) &&
      (!p.minOrderValue || cartSubtotal >= p.minOrderValue) &&
      (!p.usageLimit || (p.usageCount || 0) < p.usageLimit)
    );

    if (activeAutoPromos.length > 0) {
      // Sort by best value
      activeAutoPromos.sort((a, b) => {
        const valA = a.discountType === 'percentage' ? (cartSubtotal * (a.value / 100)) : a.value;
        const valB = b.discountType === 'percentage' ? (cartSubtotal * (b.value / 100)) : b.value;
        return valB - valA;
      });
      const best = activeAutoPromos[0];
      setAutoCoupon({
        id: best.id,
        code: best.title || 'Automatic Discount',
        discountPercent: best.discountType === 'percentage' ? best.value : 0,
        discountFixed: best.discountType === 'fixed' ? best.value : 0,
        freeShipping: best.discountType === 'free_shipping',
        minOrderValue: best.minOrderValue || 0
      });
    } else {
      setAutoCoupon(null);
    }
  }, [promosData?.data, cartSubtotal]);

  const applyCoupon = (code) => {
    if (appliedCoupon) {
      return { success: false, message: 'A coupon is already applied. Please remove it first to apply a new one.' };
    }

    const promos = promosData?.data || [];
    const matchedPromo = promos.find(p => p.code?.toUpperCase() === code.trim().toUpperCase() && p.active === true);

    if (matchedPromo) {
      const now = new Date();
      if (matchedPromo.startsAt && new Date(matchedPromo.startsAt) > now) {
        return { success: false, message: 'This coupon is not active yet.' };
      }
      if (matchedPromo.expiresAt && new Date(matchedPromo.expiresAt) < now) {
        return { success: false, message: 'This coupon has expired.' };
      }

      if (matchedPromo.minOrderValue && cartSubtotal < matchedPromo.minOrderValue) {
        return { success: false, message: `Minimum order value is ₹${matchedPromo.minOrderValue}` };
      }

      if (matchedPromo.usageLimit && (matchedPromo.usageCount || 0) >= matchedPromo.usageLimit) {
        return { success: false, message: 'This coupon has reached its usage limit.' };
      }

      if (matchedPromo.discountType === 'percentage') {
        setAppliedCoupon({ id: matchedPromo.id, code: matchedPromo.code, discountPercent: matchedPromo.value, minOrderValue: matchedPromo.minOrderValue });
        showToast(`Coupon ${matchedPromo.code} applied! ${matchedPromo.value}% OFF`);
        return { success: true, message: `${matchedPromo.value}% discount applied!` };
      } else if (matchedPromo.discountType === 'fixed') {
        setAppliedCoupon({ id: matchedPromo.id, code: matchedPromo.code, discountFixed: matchedPromo.value, minOrderValue: matchedPromo.minOrderValue });
        showToast(`Coupon ${matchedPromo.code} applied! ₹${matchedPromo.value} OFF`);
        return { success: true, message: `₹${matchedPromo.value} discount applied!` };
      } else if (matchedPromo.discountType === 'free_shipping') {
        setAppliedCoupon({ id: matchedPromo.id, code: matchedPromo.code, discountPercent: 0, freeShipping: true, minOrderValue: matchedPromo.minOrderValue });
        showToast('Free shipping coupon applied!');
        return { success: true, message: 'Free shipping granted!' };
      }
    }

    return { success: false, message: 'Invalid or expired coupon code.' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const clearCart = () => setCart([]);
  
  const baseShippingRate = settings.baseShippingRate ?? 99;
  const freeShippingThreshold = settings.freeShippingThreshold ?? 999;
  const expressShippingRate = settings.expressShippingRate ?? 149;

  let discountAmount = 0;
  
  let validAppliedCoupon = appliedCoupon;
  if (appliedCoupon && appliedCoupon.minOrderValue && cartSubtotal < appliedCoupon.minOrderValue) {
    validAppliedCoupon = null;
  }

  const activeDiscount = validAppliedCoupon || autoCoupon;

  if (activeDiscount) {
    if (activeDiscount.discountPercent) {
      discountAmount = cartSubtotal * (activeDiscount.discountPercent / 100);
    } else if (activeDiscount.discountFixed) {
      discountAmount = Math.min(cartSubtotal, activeDiscount.discountFixed);
    }
  }
  const shippingFee = cartSubtotal >= freeShippingThreshold || activeDiscount?.freeShipping ? 0 : (cartSubtotal > 0 ? baseShippingRate : 0);
  const cartGrandTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  const updatePromoMut = useUpdatePromotion();
  const recordCouponUsage = () => {
    if (activeDiscount?.id) {
      const promos = promosData?.data || [];
      const promo = promos.find(p => p.id === activeDiscount.id);
      if (promo) {
        updatePromoMut.mutate({ id: promo.id, patch: { usageCount: (promo.usageCount || 0) + 1 } });
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartTotalCount,
        cartSubtotal,
        discountAmount,
        shippingFee,
        expressShippingRate,
        cartGrandTotal,
        appliedCoupon,
        autoCoupon,
        activeDiscount,
        applyCoupon,
        removeCoupon,
        removeToast,
        showToast,
        recordCouponUsage
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} position="bottom-right" />
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
