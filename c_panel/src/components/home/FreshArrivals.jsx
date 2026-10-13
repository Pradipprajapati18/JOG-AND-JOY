import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/getImageUrl';

const freshProducts = [
  {
    id: 1,
    name: 'Kids Dynamic Printed Tee',
    category: 'Kids T-Shirt',
    price: '₹499',
    rating: 5,
    tag: 'NEW DROP',
    image: getImageUrl('cat_kids_tshirt.webp'),
    fallback: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Pro-Fit Flex Jogger Pant',
    category: 'Men Tracks & Joggers',
    price: '₹999',
    rating: 5,
    tag: 'BESTSELLER',
    image: getImageUrl('cat_men_joggers.webp'),
    fallback: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Summer Breeze Athletic Shorts',
    category: 'Men Shorts & Bermuda',
    price: '₹699',
    rating: 4.9,
    tag: 'SUMMER VIBES',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop',
    fallback: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 4,
    name: 'Comfy Cotton Night Suit Set',
    category: 'Kids Night Suits',
    price: '₹799',
    rating: 4.8,
    tag: 'COZY',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop',
    fallback: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 5,
    name: 'Vibrant Casual Active Frock',
    category: 'Girl Frocks',
    price: '₹849',
    rating: 5,
    tag: 'TRENDY',
    image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop',
    fallback: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop'
  }
];

export default function FreshArrivals() {
  const [startIndex, setStartIndex] = useState(0);

  const prev = () => {
    setStartIndex((current) => Math.max(0, current - 1));
  };

  const next = () => {
    setStartIndex((current) => Math.min(freshProducts.length - 3, current + 1));
  };

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Hot Off The Machine
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              FRESH <span className="text-gradient-lime">ARRIVALS</span>
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={prev}
              disabled={startIndex === 0}
              className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center text-white disabled:opacity-40 hover:bg-[#ccff00] hover:text-slate-950 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={next}
              disabled={startIndex >= freshProducts.length - 3}
              className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center text-white disabled:opacity-40 hover:bg-[#ccff00] hover:text-slate-950 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Carousel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {freshProducts.slice(startIndex, startIndex + 3).map((item) => (
            <div
              key={item.id}
              className="group rounded-3xl bg-slate-900/60 border border-slate-800 p-4 hover:border-[#ccff00]/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-72 rounded-2xl overflow-hidden mb-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.onerror = null; e.target.src = item.fallback; }}
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[10px] font-extrabold text-[#ccff00] uppercase tracking-wider">
                  {item.tag}
                </span>
              </div>

              <div className="space-y-2 p-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{item.category}</span>
                  <div className="flex items-center gap-1 text-[#ccff00]">
                    <Star className="w-3.5 h-3.5 fill-[#ccff00]" />
                    <span className="font-bold text-white">{item.rating}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-[#ccff00] transition-colors line-clamp-1">
                  {item.name}
                </h3>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xl font-extrabold text-[#ccff00]">{item.price}</span>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-[#ccff00] hover:text-slate-950 text-xs font-bold text-white transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
