import React from 'react';
import { Link } from 'react-router-dom';
import { AGE_GROUPS } from '../../data/productsData';
import { ArrowRight, Sparkles, Smile, Star, HeartHandshake } from 'lucide-react';

const ageIcons = [Smile, Star, HeartHandshake, Sparkles];

export default function ShopByAge() {
  return (
    <section className="py-14 sm:py-20 bg-[#FFFDF9] relative overflow-hidden border-t border-[#ECECEC]">
      {/* Background Soft Floating Accents */}
      <div className="absolute top-10 left-5 w-24 h-24 rounded-full bg-[#AEE6FF]/30 blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 right-5 w-32 h-32 rounded-full bg-[#FFD5A1]/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-[#FFF3EE] text-[#FF7A59] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border border-[#FFE0D6]">
            <Sparkles className="w-3.5 h-3.5" /> Perfect Fit Guarantee
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Shop By <span className="text-[#FF7A59]">Age Group</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
            Clothing thoughtfully crafted for every stage of your child's joyful journey.
          </p>
        </div>

        {/* Age Group Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {AGE_GROUPS.map((item, index) => {
            const Icon = ageIcons[index % ageIcons.length];
            return (
              <Link
                key={index}
                to={`/kids?age=${encodeURIComponent(item.label)}`}
                className="group relative p-4 sm:p-7 rounded-[24px] sm:rounded-[28px] bg-white border border-[#ECECEC] shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between overflow-hidden"
              >
                {/* Top Pill & Icon */}
                <div className="flex justify-between items-center mb-4 sm:mb-8">
                  <span className="px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold bg-[#FFF3EE] text-[#FF7A59] border border-[#FFE0D6]">
                    {item.badge}
                  </span>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[10px] sm:rounded-2xl bg-[#FFFDF9] border border-[#ECECEC] text-slate-700 flex items-center justify-center group-hover:bg-[#FF7A59] group-hover:text-white group-hover:border-[#FF7A59] transition-all duration-300 shadow-xs">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                </div>

                {/* Card Title & Sub */}
                <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-[#FF7A59] transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-semibold leading-normal">
                    {item.sub}
                  </p>
                </div>

                {/* Explore Action Banner */}
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-[#FF7A59] group-hover:translate-x-1 transition-transform duration-300">
                  <span>Explore Items</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>

                {/* Bottom Soft Hover Accent */}
                <div className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full bg-[#FF7A59]/10 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
