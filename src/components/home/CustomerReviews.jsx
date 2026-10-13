import React, { useMemo } from 'react';
import { REVIEWS as MOCK_REVIEWS } from '../../data/productsData';
import { Star, CheckCircle2, Quote, Sparkles } from 'lucide-react';
import SpotlightCard from '../ui/SpotlightCard';
import { useReviewsList } from '../../queries/useReviews';

export default function CustomerReviews() {
  const { data, isLoading } = useReviewsList();

  const reviews = useMemo(() => {
    if (!isLoading && data?.data && data.data.length > 0) {
      return data.data.map(r => ({
        id: r.id,
        name: r.author_name || r.authorName || 'Guest User',
        rating: r.rating || 5,
        comment: r.comment || '',
        date: new Date(r.created_at || r.createdAt).toLocaleDateString(),
        avatar: `https://ui-avatars.com/api/?name=${r.author_name || r.authorName || 'User'}&background=AEE6FF&color=000&size=100`,
        product: r.product_id === 'guest_default' ? 'Jog & Joy Apparels' : 'Verified Purchase'
      }));
    }
    return MOCK_REVIEWS;
  }, [data, isLoading]);

  return (
    <section className="py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="px-4 py-1.5 rounded-full bg-[#CFFFE5]/50 text-emerald-900 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Verified Parent Reviews
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Loved By <span className="text-[#EF4A45]">10,000+ Happy Parents</span>
          </h2>
        </div>

        {/* Testimonials Marquee */}
        <style>{`
          @keyframes scrollReviews {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-50% - 12px)); } /* 12px is half the gap */
          }
          .animate-scroll-reviews {
            animation: scrollReviews 30s linear infinite;
          }
          .animate-scroll-reviews:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="flex overflow-hidden relative w-full pb-8">
          <div className="flex gap-6 animate-scroll-reviews w-max">
            {[...reviews, ...reviews, ...reviews, ...reviews].map((review, index) => {
              const spotlightColors = [
                'rgba(174, 230, 255, 0.4)', // Soft Blue
                'rgba(239, 74, 69, 0.25)',  // Soft Red
                'rgba(255, 216, 0, 0.35)'   // Soft Yellow
              ];
              return (
                <SpotlightCard
                  key={index}
                  className="kids-card p-6 border border-slate-100 flex flex-col justify-between space-y-4 bg-white w-87.5 shrink-0 transform hover:-translate-y-2 hover:shadow-2xl hover:border-slate-200 transition-all duration-300"
                  spotlightColor={spotlightColors[index % spotlightColors.length]}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-400">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[11px] font-extrabold text-slate-400">{review.date}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold italic whitespace-normal">
                      "{review.comment}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#AEE6FF]"
                    />
                    <div>
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1">
                        {review.name} <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100" />
                      </h4>
                      <p className="text-[10px] text-slate-500 font-extrabold whitespace-normal">Verified Buyer • {review.product}</p>
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
