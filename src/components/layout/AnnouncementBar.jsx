import React, { useState, useEffect } from 'react';
import { usePromotionsList } from '../../queries/usePromotions';

export default function AnnouncementBar() {
  const { data } = usePromotionsList();
  const promotions = data?.data || [];
  
  const now = new Date();
  const activePromos = promotions.filter(p => 
    p.active && 
    (!p.startsAt || new Date(p.startsAt) <= now) && 
    (!p.expiresAt || new Date(p.expiresAt) >= now)
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activePromos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activePromos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activePromos.length]);

  if (activePromos.length === 0) {
    return (
      <div className="bg-black text-white text-xs md:text-sm font-medium py-2 px-4 text-center z-50 relative tracking-wide">
        Love is in the wear
      </div>
    );
  }

  const promo = activePromos[currentIndex];
  let message = promo.title;
  if (promo.method === 'code' && promo.code) {
    message += ` — Use code ${promo.code}`;
  } else if (promo.discountType === 'percentage') {
    message += ` — ${promo.value}% OFF applied automatically!`;
  } else if (promo.discountType === 'fixed') {
    message += ` — ₹${promo.value} OFF applied automatically!`;
  }

  return (
    <div className="bg-black text-white text-xs md:text-sm font-medium py-2 px-4 text-center z-50 relative tracking-wide transition-opacity duration-500">
      {message}
    </div>
  );
}
