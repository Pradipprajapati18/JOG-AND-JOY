import React, { useMemo } from 'react';
import { REVIEWS as MOCK_REVIEWS } from '../../data/productsData';
import { Star, CheckCircle2, Sparkles } from 'lucide-react';
import SpotlightCard from '../ui/SpotlightCard';
import { useReviewsList } from '../../queries/useReviews';

const REAL_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
];

const POPULAR_PRODUCTS = [
  'Playful Dino Cotton Tee',
  'Active Streetwear Tracksuit Set',
  'Cozy Bunny Organic Onesie',
  'Sunshine Floral Twirl Frock',
  'Everyday Active Track Pants',
  'Rainbow Sparkle Pastel Hoodie',
  'Bio-Washed Cotton Loungewear',
  'Cool Explorer Denim Dungaree',
];

const CITIES = ['Mumbai', 'Ahmedabad', 'Bengaluru', 'Surat', 'Pune', 'Chennai', 'Delhi NCR', 'Jaipur'];

export default function CustomerReviews() {
  const { data, isLoading } = useReviewsList();

  const reviews = useMemo(() => {
    let list = [];
    if (!isLoading && data?.data && data.data.length > 0) {
      const validDbReviews = data.data
        .filter(r => {
          if (!r.comment || r.comment.trim().length < 15) return false;
          if (r.status === 'rejected') return false;
          const name = (r.name || r.author_name || r.authorName || '').toLowerCase();
          if (name.includes('test login') || name.includes('test user')) return false;
          if (/ovch|ubcngh|jhgfd|lkjhb|vcfbh/.test(r.comment)) return false;
          return true;
        })
        .map((r, i) => {
          const avatarUrl = (r.avatar && !r.avatar.includes('ui-avatars.com')) 
            ? r.avatar 
            : REAL_AVATARS[i % REAL_AVATARS.length];
          const productName = (r.product && r.product !== 'Verified Purchase' && r.product !== 'Jog & Joy Apparels')
            ? r.product
            : POPULAR_PRODUCTS[i % POPULAR_PRODUCTS.length];
          const city = r.city || CITIES[i % CITIES.length];
          return {
            id: r.id || `db-${i}`,
            name: r.name || r.author_name || r.authorName || 'Verified Parent',
            city,
            role: r.role || 'Verified Parent',
            rating: r.rating || 5,
            comment: r.comment || '',
            date: r.created_at ? new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Verified Buyer',
            avatar: avatarUrl,
            product: productName
          };
        });
      list = validDbReviews;
    }

    // Combine with MOCK_REVIEWS to maintain a full, varied parent testimonial ribbon
    const combined = [...list];
    for (const mock of MOCK_REVIEWS) {
      if (!combined.some(c => c.name.toLowerCase() === mock.name.toLowerCase())) {
        combined.push(mock);
      }
    }

    return combined.length > 0 ? combined : MOCK_REVIEWS;
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
            animation: scrollReviews 32s linear infinite;
          }
          .animate-scroll-reviews:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="flex overflow-hidden relative w-full pb-8">
          <div className="flex gap-6 animate-scroll-reviews w-max">
            {[...reviews, ...reviews].map((review, index) => {
              const spotlightColors = [
                'rgba(174, 230, 255, 0.4)', // Soft Blue
                'rgba(239, 74, 69, 0.25)',  // Soft Red
                'rgba(255, 216, 0, 0.35)'   // Soft Yellow
              ];
              return (
                <SpotlightCard
                  key={index}
                  className="kids-card p-6 border border-slate-100 flex flex-col justify-between space-y-4 bg-white w-87.5 shrink-0 transform hover:-translate-y-2 hover:shadow-2xl hover:border-slate-200 transition-all duration-300 rounded-3xl"
                  spotlightColor={spotlightColors[index % spotlightColors.length]}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-400">
                        {[...Array(review.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        {review.city && <span className="text-slate-500 font-semibold">{review.city} •</span>}
                        {review.date}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium italic whitespace-normal">
                      "{review.comment}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=FFE5D9&color=D94B34&bold=true`;
                      }}
                      className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-emerald-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1 truncate">
                        <span>{review.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100 shrink-0" />
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold whitespace-normal line-clamp-1">
                        {review.role ? `${review.role} • ` : 'Verified Parent • '}{review.product}
                      </p>
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
