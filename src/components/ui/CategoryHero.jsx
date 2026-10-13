import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Star, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=1000&auto=format&fit=crop',
    alt: 'Kids Fashion Hero 1'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=1000&auto=format&fit=crop',
    alt: 'Kids Fashion Hero 2'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?q=80&w=1000&auto=format&fit=crop',
    alt: 'Kids Fashion Hero 3'
  }
];

export default function CategoryHero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden pt-4 pb-12 lg:pb-16 bg-linear-to-b from-[#FFF8EC] via-[#FFF8EC] to-white border-b border-amber-100/50 mb-8">
      {/* Decorative Pastel Bubbles */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#AEE6FF]/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#FFD6BA]/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-[#E6D6FF]/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-amber-200/80 shadow-xs text-xs font-black text-slate-800"
            >
              <span className="flex h-2 w-2 rounded-full bg-[#EF4A45] animate-ping" />
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Dedicated Kids Store</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight"
            >
              Discover <span className="brush-underline text-[#EF4A45]">Adorable</span> Styles for Little Adventures
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Ultra-soft, 100% bio-washed combed cotton activewear designed for growing kids. Vibrant non-toxic dyes, tagless comfort, and playground-proof durability.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <button
                onClick={() => window.scrollBy({ top: 600, behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-linear-to-r from-[#EF4A45] to-orange-500 text-white font-extrabold text-sm shadow-xl shadow-red-500/20 hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 group"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Kids Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Guarantees Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-6 grid grid-cols-3 gap-3 border-t border-slate-200/60 text-slate-600 text-[10px] sm:text-xs font-bold"
            >
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% Bio Cotton</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <Truck className="w-4 h-4 text-[#00A3E0] shrink-0" />
                <span>Free Ship &gt; ₹999</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                <span>4.9★ (12k+ Reviews)</span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Hero Slider Frame */}
          <div className="lg:col-span-5 relative mt-10 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Image Frame with Pastel Accent */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="relative rounded-3xl overflow-hidden bg-[#AEE6FF] p-3 shadow-2xl rotate-1"
              >
                <div className="relative w-full h-[380px] sm:h-[420px] rounded-2xl overflow-hidden bg-slate-100">
                  {slides.map((slide, idx) => (
                    <img
                      key={slide.id}
                      src={slide.image}
                      alt={slide.alt}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                        idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                    />
                  ))}
                  
                  {/* Dot Navigation Inside the Frame */}
                  <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center space-x-2">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`transition-all duration-300 rounded-full ${
                          idx === currentSlide 
                            ? 'w-6 h-2 bg-white shadow-md' 
                            : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Floating Badge Card 1 */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="absolute bottom-10 -left-6 sm:-left-6 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/60 flex items-center gap-3 z-30"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#FFD6BA] flex items-center justify-center text-slate-900 font-black">
                    🐣
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-900">Hypoallergenic</h4>
                    <p className="text-[9px] text-slate-500 font-semibold">Zero harsh chemicals</p>
                  </div>
                </motion.div>

                {/* Floating Rating Card 2 */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute top-10 -right-6 sm:-right-6 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-white/60 flex items-center gap-2 z-30"
                >
                  <div className="flex text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                  </div>
                  <span className="text-[11px] font-black text-slate-900">4.9/5</span>
                </motion.div>
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
