import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, ShieldCheck, HeartHandshake } from 'lucide-react';
import whyChooseUsDesktop from '../../assets/why-choose-us-desktop.webp';
import whyChooseUsMobile from '../../assets/why-choose-us-mobile.webp';
import { getImageUrl } from '../../utils/getImageUrl';

export default function WhyChooseUs() {
  const AnimatedLogo = () => (
    <div className="relative inline-flex items-center justify-center p-2 group cursor-pointer z-30">
      <div className="absolute -inset-3 bg-linear-to-r from-[#FFD800] via-white to-[#AEE6FF] rounded-3xl blur-xl opacity-75 animate-pulse pointer-events-none"></div>
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
        className="absolute -inset-2 bg-linear-to-r from-[#FFD800] via-[#FF5500] to-[#00A3E0] rounded-2xl blur-md opacity-90 pointer-events-none"
      ></motion.div>
      <div className="relative flex items-center justify-center p-1">
        <motion.div 
          animate={{ scale: [0.8, 1.2, 0.8], rotate: [0, 45, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute -top-4 -right-4 text-amber-300 z-20 pointer-events-none"
        >
          <Sparkles className="w-7 h-7 fill-amber-300" />
        </motion.div>
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -30, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
          className="absolute -bottom-4 -left-4 text-amber-300 z-20 pointer-events-none"
        >
          <Sparkles className="w-6 h-6 fill-amber-300" />
        </motion.div>
        <motion.img
          src={getImageUrl('official_logo.webp')}
          alt="JOG & JOY®"
          className="h-12 sm:h-16 md:h-20 object-contain relative z-10 filter drop-shadow-md"
          animate={{ y: [0, -6, 0], scale: [1, 1.04, 1], rotate: [0, 1.5, -1.5, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          whileHover={{ scale: 1.12, rotate: 3 }}
        />
      </div>
    </div>
  );

  return (
    <section className="pt-16 pb-10 sm:py-20 bg-white relative">
      
      {/* MOBILE-ONLY Divider Logo (Centered exactly between this section and the one above) */}
      <div className="sm:hidden absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 scale-100 flex justify-center w-full">
        <AnimatedLogo />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* DESKTOP VIEW: Full Image Banner */}
        <div className="hidden sm:block max-w-5xl mx-auto relative rounded-[40px] overflow-hidden shadow-2xl border-4 border-[#A5B890]/30 bg-[#A5B890]">
          <img
            src={whyChooseUsDesktop}
            alt="Why Choose Us"
            className="w-full h-auto object-cover"
          />
          {/* Animated Logo positioned in the center right empty space */}
          <div className="absolute top-1/2 -translate-y-1/2 right-[4%] lg:right-[6%] scale-125 lg:scale-150 origin-right">
            <AnimatedLogo />
          </div>
        </div>

        {/* MOBILE VIEW: Full Image Banner */}
        <div className="sm:hidden relative mt-6 mb-2">
          
          <div className="rounded-4xl overflow-hidden shadow-2xl border-4 border-[#A5B890]/30 bg-[#A5B890]">
            <img
              src={whyChooseUsMobile}
              alt="Why Choose Us"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
