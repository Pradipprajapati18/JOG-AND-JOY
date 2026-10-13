import React from 'react';
import { Sparkles, Heart, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';

const features = [
  { label: '100% Super Soft Cotton', icon: Heart, badge: 'Organic' },
  { label: 'Play-Proof Vibrant Colors', icon: Sparkles, badge: 'Durable' },
  { label: 'Easy 30-Day Returns', icon: RotateCcw, badge: 'No Hassle' },
  { label: 'Free Shipping Over ₹999', icon: Truck, badge: 'Fast Delivery' },
  { label: 'Certified Child Safety', icon: ShieldCheck, badge: 'Safe Skin' },
  { label: 'Award Winning Designs', icon: Award, badge: 'Top Rated' }
];

export default function BrandStrip() {
  return (
    <section className="py-5 bg-white border-y border-[#FF7A59]/15 overflow-hidden relative hidden md:block">
      <div className="w-full relative flex overflow-hidden group">
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
          {/* Two identical sets to create a seamless infinite loop */}
          {[1, 2].map((setIndex) => (
            <div key={setIndex} className="flex gap-8 sm:gap-12 px-4 sm:px-6 items-center">
              {features.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={`${setIndex}-${idx}`} className="flex items-center gap-3 bg-white/80 backdrop-blur-xs px-5 py-2.5 rounded-full border border-[#FFE0D6] shadow-xs shrink-0 hover:scale-105 transition-transform duration-200">
                    <div className="w-7 h-7 rounded-full bg-[#FF7A59] text-white flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-800 tracking-wide">{item.label}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#8DD67C]/20 text-green-700">
                      {item.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
