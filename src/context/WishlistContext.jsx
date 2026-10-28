import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { useCombinedProducts } from '../queries/useCombinedProducts';

const WishlistContext = createContext();

const normalizeWishlistId = (item) => {
  if (!item) return null;
  if (typeof item === 'object') {
    const raw = item.id || item.productId || item._id;
    return raw ? String(raw).trim() : null;
  }
  const str = String(item).trim();
  return str.length > 0 ? str : null;
};

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const { combinedProducts, isLoading: isProductsLoading } = useCombinedProducts();
  const { showToast } = useCart();

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('jog_n_joy_wishlist');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return Array.from(new Set(parsed.map(normalizeWishlistId).filter(Boolean)));
    } catch {
      return [];
    }
  });

  // Track previous user id to detect actual logouts vs initial hydration
  const prevUserIdRef = useRef(user?.id);

  // Load wishlist from Supabase when user logs in
  useEffect(() => {
    const fetchWishlist = async () => {
      // If user was previously logged in and logged out, clear the local wishlist
      if (prevUserIdRef.current && !user?.id) {
        setWishlist([]);
        try {
          localStorage.removeItem('jog_n_joy_wishlist');
        } catch { }
        prevUserIdRef.current = user?.id;
        return;
      }
      prevUserIdRef.current = user?.id;

      if (!user?.id) return;

      const { data, error } = await supabase
        .from('users')
        .select('wishlist')
        .eq('id', user.id)
        .single();

      if (!error && data?.wishlist) {
        const cleaned = Array.isArray(data.wishlist)
          ? Array.from(new Set(data.wishlist.map(normalizeWishlistId).filter(Boolean)))
          : [];
        setWishlist(cleaned);
        try {
          localStorage.setItem('jog_n_joy_wishlist', JSON.stringify(cleaned));
        } catch { }
      }
    };
    fetchWishlist();
  }, [user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem('jog_n_joy_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  // Compute valid wishlist items that exist in the loaded product catalog
  const validWishlist = useMemo(() => {
    const cleaned = wishlist.map(normalizeWishlistId).filter(Boolean);
    if (isProductsLoading || !combinedProducts || combinedProducts.length === 0) {
      return cleaned;
    }
    const productIds = new Set(combinedProducts.map((p) => String(p.id)));
    return cleaned.filter((id) => productIds.has(id));
  }, [wishlist, combinedProducts, isProductsLoading]);

  // Prune dead/orphaned IDs once catalog is fully loaded so notification counts stay accurate
  useEffect(() => {
    if (!isProductsLoading && combinedProducts && combinedProducts.length > 0 && wishlist.length > 0) {
      const productIds = new Set(combinedProducts.map((p) => String(p.id)));
      const filtered = wishlist.map(normalizeWishlistId).filter((id) => id && productIds.has(id));
      const unique = Array.from(new Set(filtered));
      if (unique.length !== wishlist.length) {
        setWishlist(unique);
        try {
          localStorage.setItem('jog_n_joy_wishlist', JSON.stringify(unique));
        } catch { }
        if (user?.id) {
          supabase.from('users').update({ wishlist: unique }).eq('id', user.id);
        }
      }
    }
  }, [combinedProducts, isProductsLoading, wishlist, user?.id]);

  const toggleWishlist = async (productId) => {
    const rawId = normalizeWishlistId(productId);
    if (!rawId) return;

    let newWishlist = [];
    const exists = wishlist.some((item) => normalizeWishlistId(item) === rawId);
    if (exists) {
      if (showToast) showToast('Removed from Wishlist 💔');
      newWishlist = wishlist.map(normalizeWishlistId).filter((id) => id && id !== rawId);
    } else {
      if (showToast) showToast('Added to Wishlist 💖');
      newWishlist = [...wishlist.map(normalizeWishlistId).filter(Boolean), rawId];
    }
    newWishlist = Array.from(new Set(newWishlist));
    setWishlist(newWishlist);

    try {
      localStorage.setItem('jog_n_joy_wishlist', JSON.stringify(newWishlist));
    } catch { }

    // Sync to DB
    if (user?.id) {
      await supabase.from('users').update({ wishlist: newWishlist }).eq('id', user.id);
    }
  };

  const clearWishlist = async () => {
    setWishlist([]);
    try {
      localStorage.removeItem('jog_n_joy_wishlist');
    } catch { }
    if (user?.id) {
      await supabase.from('users').update({ wishlist: [] }).eq('id', user.id);
    }
  };

  const isInWishlist = (productId) => {
    const rawId = normalizeWishlistId(productId);
    if (!rawId) return false;
    return wishlist.some((item) => normalizeWishlistId(item) === rawId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist: validWishlist,
        toggleWishlist,
        clearWishlist,
        isInWishlist,
        wishlistCount: validWishlist.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

const defaultWishlistContext = {
  wishlist: [],
  toggleWishlist: () => {},
  clearWishlist: () => {},
  isInWishlist: () => false,
  wishlistCount: 0
};

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  return ctx || defaultWishlistContext;
}
