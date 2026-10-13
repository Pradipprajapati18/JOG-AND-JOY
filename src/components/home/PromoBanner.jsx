import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PromoBanner() {
  return (
    <section className="py-12 bg-[#FFF8EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] bg-linear-to-r from-emerald-500 via-teal-500 to-[#00A3E0] p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          
          <div className="space-y-2 text-center md:text-left max-w-2xl relative z-10">
            <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> SPECIAL KIDS COLLECTION
            </span>
            <h3 className="text-2xl sm:text-4xl font-black leading-tight text-white tracking-tight">
              Make Every Day a Fashion Adventure for Your Little Explorers!
            </h3>
            <p className="text-xs sm:text-sm text-white/90 font-bold">Jog & Joy — Love is in the wear ✨</p>
          </div>

          <Link to="/products" className="shrink-0 relative z-10">
            <button className="px-8 py-3.5 rounded-full bg-[#EF4A45] hover:bg-red-600 text-white font-extrabold text-sm shadow-xl transition-all hover:scale-105 flex items-center gap-2">
              <span>Claim Discount</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
