import React from 'react';
import { motion } from 'framer-motion';

export default function Button({
  children,
  variant = 'sky',
  size = 'md',
  className = '',
  icon: Icon,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-extrabold rounded-full transition-all duration-300 shadow-sm cursor-pointer border border-transparent';

  const variants = {
    sky: 'bg-[#A7D8FF] text-slate-800 hover:bg-[#8ecbfa] shadow-blue-200/50 hover:shadow-lg hover:-translate-y-0.5',
    mint: 'bg-[#B8F2D0] text-slate-800 hover:bg-[#9fe6ba] shadow-emerald-200/50 hover:shadow-lg hover:-translate-y-0.5',
    yellow: 'bg-[#FFE89A] text-slate-800 hover:bg-[#fbdc74] shadow-amber-200/50 hover:shadow-lg hover:-translate-y-0.5',
    coral: 'bg-[#FF8E8E] text-white hover:bg-[#f77777] shadow-rose-200/50 hover:shadow-lg hover:-translate-y-0.5',
    lavender: 'bg-[#D8C7FF] text-slate-800 hover:bg-[#c5b0f8] shadow-purple-200/50 hover:shadow-lg hover:-translate-y-0.5',
    white: 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5',
    outline: 'border-2 border-slate-700 text-slate-800 hover:bg-slate-900 hover:text-white',
    dark: 'bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:-translate-y-0.5'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-6 py-2.5 text-sm gap-2',
    lg: 'px-8 py-3.5 text-base gap-2.5'
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
      {Icon && <Icon className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
    </motion.button>
  );
}
