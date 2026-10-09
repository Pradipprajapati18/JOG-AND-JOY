import React from 'react';

export function Input({ label, error, required, variant = 'light', className = '', ...props }) {
  const baseInputStyles = "w-full px-4 py-3 rounded-2xl transition-all duration-200 focus:outline-none";
  
  const variants = {
    dark: "bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:border-[#FF7A59] focus:ring-4 focus:ring-[#FF7A59]/20",
    light: "bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#FF7A59] focus:ring-4 focus:ring-[#FF7A59]/15 shadow-xs",
    playful: "bg-white border-2 border-[#FFE0D6] text-slate-900 placeholder-slate-400 focus:border-[#FF7A59] focus:ring-4 focus:ring-[#FF7A59]/20 shadow-xs font-medium"
  };

  const labelVariants = {
    dark: "text-gray-300",
    light: "text-slate-700 font-bold",
    playful: "text-slate-800 font-extrabold"
  };

  return (
    <div className="w-full">
      {label && (
        <label className={`block text-xs uppercase tracking-wider mb-2 ${labelVariants[variant] || labelVariants.light}`}>
          {label} {required && <span className="text-[#FF7A59] font-black">*</span>}
        </label>
      )}
      <input
        className={`${baseInputStyles} ${variants[variant] || variants.light} ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1">⚠️ {error}</p>}
    </div>
  );
}

export function Textarea({ label, error, required, variant = 'light', rows = 4, className = '', ...props }) {
  const baseInputStyles = "w-full px-4 py-3 rounded-2xl transition-all duration-200 focus:outline-none";

  const variants = {
    dark: "bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:border-[#FF7A59] focus:ring-4 focus:ring-[#FF7A59]/20",
    light: "bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#FF7A59] focus:ring-4 focus:ring-[#FF7A59]/15 shadow-xs",
    playful: "bg-white border-2 border-[#FFE0D6] text-slate-900 placeholder-slate-400 focus:border-[#FF7A59] focus:ring-4 focus:ring-[#FF7A59]/20 shadow-xs font-medium"
  };

  const labelVariants = {
    dark: "text-gray-300",
    light: "text-slate-700 font-bold",
    playful: "text-slate-800 font-extrabold"
  };

  return (
    <div className="w-full">
      {label && (
        <label className={`block text-xs uppercase tracking-wider mb-2 ${labelVariants[variant] || labelVariants.light}`}>
          {label} {required && <span className="text-[#FF7A59] font-black">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`${baseInputStyles} ${variants[variant] || variants.light} ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1">⚠️ {error}</p>}
    </div>
  );
}
