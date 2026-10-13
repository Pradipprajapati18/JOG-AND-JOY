import React, { useState } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    quote: "Jog&Joy delivers unmatched stitch consistency and fabric durability. Our retail distribution numbers skyrocketed after introducing their kids activewear line.",
    author: "Abhishek Sharma",
    role: "MANAGER",
    company: "North Zone Retail Operations",
    rating: 5
  },
  {
    id: 2,
    quote: "Exceptional fitting and vibrant color schemes. Their summer vibes collection is a top performer across our store network with zero fabric shrinkage complaints.",
    author: "Rajesh Parmar",
    role: "SENIOR MANAGER",
    company: "West Region Apparel Group",
    rating: 5
  },
  {
    id: 3,
    quote: "Outstanding B2B support and quick supply turnaround. Highly recommend Jog&Joy for high-volume athleisure clothing line distribution.",
    author: "Priya Nair",
    role: "RETAIL DIRECTOR",
    company: "Vibrant Wear Outlets",
    rating: 5
  }
];

export default function Testimonials() {
  const [active, setActive] = useState(0);

  const next = () => setActive((prev) => (prev + 1) % testimonials.length);
  const prev = () => setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 bg-slate-900/40 relative overflow-hidden border-t border-slate-800/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <div className="w-16 h-16 rounded-3xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00] mx-auto mb-8 shadow-xl">
          <Quote className="w-8 h-8" />
        </div>

        <div className="flex justify-center space-x-1 mb-6">
          {[...Array(testimonials[active].rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-[#ccff00] fill-[#ccff00]" />
          ))}
        </div>

        <p className="text-xl sm:text-3xl font-bold text-white italic leading-relaxed mb-8 max-w-3xl mx-auto">
          "{testimonials[active].quote}"
        </p>

        <div className="space-y-1">
          <h4 className="text-lg font-extrabold text-[#ccff00]">
            {testimonials[active].author}
          </h4>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {testimonials[active].role} • {testimonials[active].company}
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center space-x-4 mt-10">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-[#ccff00] hover:text-slate-950 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex space-x-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActive(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === active ? 'w-8 bg-[#ccff00]' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-[#ccff00] hover:text-slate-950 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
}
