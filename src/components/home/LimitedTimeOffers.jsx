import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Flame, ArrowRight } from 'lucide-react';
import { usePromotionsList } from '../../queries/usePromotions';

export default function LimitedTimeOffers() {
  const { data: promosData } = usePromotionsList();
  const promotions = promosData?.data || [];
  
  const now = new Date();
  const activePromos = promotions.filter(p => 
    p.active && 
    (!p.startsAt || new Date(p.startsAt) <= now) && 
    (!p.expiresAt || new Date(p.expiresAt) >= now)
  );

  const promo = activePromos.length > 0 ? activePromos[0] : null;

  const calculateTimeLeft = () => {
    if (!promo || !promo.expiresAt) return { hours: 0, minutes: 0, seconds: 0 };
    const difference = new Date(promo.expiresAt) - new Date();
    if (difference <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor((difference / (1000 * 60 * 60))),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (!promo || !promo.expiresAt) return;
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [promo]);

  if (!promo) {
    return null; // Hide the section if there are no active promotions
  }

  const isCode = promo.method === 'code' && promo.code;
  const discountText = promo.discountType === 'percentage' 
    ? `${promo.value}% OFF` 
    : (promo.discountType === 'fixed' ? `₹${promo.value} OFF` : 'Free Shipping');

  return (
    <section className="py-6 sm:py-12 bg-linear-to-r from-[#EF4A45] via-rose-500 to-orange-500 text-white relative overflow-hidden shadow-xl">
      {/* Decorative Doodles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8 text-center lg:text-left">
          
          {/* Flash Offer Title & Details */}
          <div className="flex-1 space-y-2 sm:space-y-4">
            <span className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 border border-white/30">
              <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300 fill-amber-300 animate-pulse" /> {promo.expiresAt ? 'Flash Sale Ending Soon!' : 'Special Offer!'}
            </span>
            <h2 className="text-xl sm:text-5xl font-black tracking-tight leading-tight">
              {promo.title} <span className="text-[#FFD800] whitespace-nowrap">({discountText})</span>
            </h2>
            <p className="text-[11px] sm:text-base font-semibold text-white/90 max-w-xl mx-auto lg:mx-0">
              {isCode ? (
                <>Use code <strong className="bg-white text-[#EF4A45] px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md font-black">{promo.code}</strong> at checkout to redeem this offer.</>
              ) : (
                <>This discount will be applied automatically at checkout!</>
              )}
            </p>
          </div>

          {/* Countdown Clock & CTA */}
          <div className="flex flex-col items-center lg:items-end space-y-4 sm:space-y-6">
            
            {/* Clock Boxes */}
            {promo.expiresAt && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex flex-col items-center bg-white/20 backdrop-blur-md p-2 sm:p-3.5 rounded-xl sm:rounded-2xl min-w-12.5 sm:min-w-17.5 border border-white/30">
                  <span className="text-xl sm:text-3xl font-black">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[8px] sm:text-[10px] uppercase font-bold text-white/80">Hours</span>
                </div>
                <span className="text-xl sm:text-2xl font-black">:</span>
                <div className="flex flex-col items-center bg-white/20 backdrop-blur-md p-2 sm:p-3.5 rounded-xl sm:rounded-2xl min-w-12.5 sm:min-w-17.5 border border-white/30">
                  <span className="text-xl sm:text-3xl font-black">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[8px] sm:text-[10px] uppercase font-bold text-white/80">Mins</span>
                </div>
                <span className="text-xl sm:text-2xl font-black">:</span>
                <div className="flex flex-col items-center bg-white/20 backdrop-blur-md p-2 sm:p-3.5 rounded-xl sm:rounded-2xl min-w-12.5 sm:min-w-17.5 border border-white/30">
                  <span className="text-xl sm:text-3xl font-black">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[8px] sm:text-[10px] uppercase font-bold text-white/80">Secs</span>
                </div>
              </div>
            )}

            <Link
              to="/products"
              className="px-5 py-2.5 sm:px-8 sm:py-3.5 rounded-full bg-white text-[#EF4A45] hover:bg-[#FFD800] hover:text-slate-900 font-extrabold text-xs sm:text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2 group"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
}
