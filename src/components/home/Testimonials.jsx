import React, { useState } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    quote: "Finding clothes that survive my 6-year-old's daily football drills without knee tears was nearly impossible until we discovered Jog & Joy. 20+ machine washes later, the color hasn't faded and the elastic waistband still fits like day one!",
    author: "Priya Sharma",
    role: "Mother of Two (Ages 4 & 7)",
    location: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    rating: 5
  },
  {
    id: 2,
    quote: "My son has sensitive skin, so rough synthetics or scratchy labels are an absolute no. Jog & Joy's 100% combed cotton feels like clouds. Zero irritation, perfectly breathable for humid summers!",
    author: "Dr. Rajesh Patel",
    role: "Pediatrician & Father",
    location: "Ahmedabad",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    rating: 5
  },
  {
    id: 3,
    quote: "I was nervous about ordering kids clothing online because size charts are often inaccurate. The age-based sizing here was spot-on for my 8-year-old daughter. The doorstep exchange policy gives total peace of mind.",
    author: "Ananya Deshmukh",
    role: "School Sports Coach & Parent",
    location: "Bengaluru",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    rating: 5
  },
  {
    id: 4,
    quote: "The deep functional pockets and reinforced stitching make these track pants the only ones my twin boys will wear. Plus, delivery to Pune was remarkably fast under 48 hours!",
    author: "Vikram Sen",
    role: "Father of 5yo Twins",
    location: "Pune",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    rating: 5
  }
];

export default function Testimonials() {
  const [active, setActive] = useState(0);

  const next = () => setActive((prev) => (prev + 1) % testimonials.length);
  const prev = () => setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const current = testimonials[active];

  return (
    <section className="py-24 bg-slate-900/40 relative overflow-hidden border-t border-slate-800/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <div className="w-16 h-16 rounded-3xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00] mx-auto mb-6 shadow-xl">
          <Quote className="w-8 h-8" />
        </div>

        <div className="flex justify-center space-x-1 mb-6">
          {[...Array(current.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-[#ccff00] fill-[#ccff00]" />
          ))}
        </div>

        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white italic leading-relaxed mb-8 max-w-3xl mx-auto">
          "{current.quote}"
        </p>

        {/* Parent Profile */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <img
            src={current.avatar}
            alt={current.author}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(current.author)}&background=1e293b&color=ccff00&bold=true`;
            }}
            className="w-14 h-14 rounded-full object-cover border-2 border-[#ccff00] shadow-md"
          />
          <div className="space-y-1">
            <h4 className="text-lg font-extrabold text-[#ccff00] flex items-center justify-center gap-1.5">
              <span>{current.author}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950" />
            </h4>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {current.role} • {current.location}
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center space-x-4 mt-10">
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-[#ccff00] hover:text-slate-950 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex space-x-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActive(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  idx === active ? 'w-8 bg-[#ccff00]' : 'w-2.5 bg-slate-700'
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            aria-label="Next testimonial"
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-[#ccff00] hover:text-slate-950 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
}
