import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('jog_n_joy_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load wishlist from Supabase when user logs in
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.id) {
         setWishlist([]);
         localStorage.removeItem('jog_n_joy_wishlist');
         return;
      }
      const { data, error } = await supabase
        .from('users')
        .select('wishlist')
        .eq('id', user.id)
        .single();
        
      if (!error && data?.wishlist) {
         setWishlist(data.wishlist);
         localStorage.setItem('jog_n_joy_wishlist', JSON.stringify(data.wishlist));
      }
    };
    fetchWishlist();
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('jog_n_joy_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  const { showToast } = useCart();

  const toggleWishlist = async (productId) => {
    let newWishlist = [];
    if (wishlist.includes(productId)) {
      showToast && showToast('Removed from Wishlist 💔');
      newWishlist = wishlist.filter((id) => id !== productId);
    } else {
      showToast && showToast('Added to Wishlist 💖');
      newWishlist = [...wishlist, productId];
    }
    setWishlist(newWishlist);

    // Sync to DB
    if (user?.id) {
       await supabase.from('users').update({ wishlist: newWishlist }).eq('id', user.id);
    }
  };

  const clearWishlist = async () => {
    setWishlist([]);
    if (user?.id) {
       await supabase.from('users').update({ wishlist: [] }).eq('id', user.id);
    }
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        clearWishlist,
        isInWishlist,
        wishlistCount: wishlist.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
