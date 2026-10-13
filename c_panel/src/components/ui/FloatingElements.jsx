import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Cloud, Sun } from 'lucide-react';

export default function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating Yellow Star */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 10, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-16 left-[8%] w-12 h-12 rounded-2xl bg-[#FFE89A]/60 backdrop-blur-sm flex items-center justify-center text-amber-600 shadow-md"
      >
        <Sparkles className="w-6 h-6" />
      </motion.div>

      {/* Floating Mint Cloud */}
      <motion.div
        animate={{ y: [0, 12, 0], x: [0, 6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-36 right-[12%] w-14 h-14 rounded-full bg-[#B8F2D0]/60 backdrop-blur-sm flex items-center justify-center text-emerald-700 shadow-md"
      >
        <Cloud className="w-7 h-7" />
      </motion.div>

      {/* Floating Coral Heart */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute bottom-24 left-[15%] w-10 h-10 rounded-2xl bg-[#FF8E8E]/60 backdrop-blur-sm flex items-center justify-center text-white shadow-md"
      >
        <Heart className="w-5 h-5 fill-white" />
      </motion.div>

      {/* Floating Lavender Sun */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-32 right-[8%] w-16 h-16 rounded-full bg-[#D8C7FF]/50 backdrop-blur-sm flex items-center justify-center text-purple-700 shadow-md"
      >
        <Sun className="w-8 h-8" />
      </motion.div>
    </div>
  );
}
