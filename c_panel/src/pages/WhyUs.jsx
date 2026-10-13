import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Heart, Award } from 'lucide-react';
import WhyChooseUs from '../components/home/WhyChooseUs';
import ClothDoodlesBackground from '../components/ui/ClothDoodlesBackground';

export default function WhyUs() {
  return (
    <div className="bg-[#FFF8EC] min-h-screen font-sans relative overflow-hidden">
      <ClothDoodlesBackground />

      {/* Hero Section */}
      <section className="relative w-full min-h-[50vh] flex flex-col items-center justify-center pt-32 pb-16 px-4 overflow-hidden">

        {/* Abstract shapes in background */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* The JOG & JOY Difference: Style 4 Premium Stacked Typography */}
            <div className="inline-flex flex-col items-center justify-center select-none group cursor-default">
              {/* Row 1: THE JOG & JOY */}
              <div className="inline-flex flex-col items-center">
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.34em] bg-linear-to-r from-[#FF6B4A] via-[#FFAE19] to-[#FFD800] bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-105">
                  THE JOG & JOY
                </span>
                <div className="w-full min-w-[160px] sm:min-w-[190px] h-[3px] rounded-full bg-linear-to-r from-[#FF6B4A] via-[#FFD800] to-[#00A3E0] mt-1.5 shadow-2xs" />
              </div>

              {/* Row 2: DIFFERENCE */}
              <div className="inline-flex flex-col items-center mt-2">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.44em] text-[#0F172A] transition-colors duration-300 group-hover:text-[#5B2E89]">
                  DIFFERENCE
                </span>
                <div className="w-full min-w-[125px] sm:min-w-[150px] h-[2.5px] rounded-full bg-linear-to-r from-[#00A3E0] via-[#4F46E5] to-[#5B2E89] mt-1.5 shadow-2xs" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-tight"
          >
            Crafted for <span className="text-[#EF4A45]">Comfort</span>,<br /> Designed for <span className="text-[#00A3E0]">Joy</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Discover why parents trust us and kids love wearing our premium activewear collections every single day.
          </motion.p>
        </div>

        {/* Floating Icons */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto w-full relative z-10 px-4">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-3">
              <Heart className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-700">Made with Love</span>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-700">Premium Quality</span>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-3">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-700">Award Winning</span>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-700">Sustainable</span>
          </div>
        </div>
      </section>

      {/* Main Content Component */}
      <div className="pb-24">
        <WhyChooseUs />
      </div>

    </div>
  );
}
