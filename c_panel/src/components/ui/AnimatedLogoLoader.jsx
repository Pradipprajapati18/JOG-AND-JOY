import React from 'react';
import BrandLogo from './BrandLogo';

export default function AnimatedLogoLoader({ text = "Loading Collection..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-8 w-full min-h-[40vh]">
      <div className="relative flex items-center justify-center">
        {/* Background ambient glow matching the colorful brand vibe */}
        <div className="absolute inset-0 bg-[#AEE6FF] rounded-full animate-ping opacity-10 duration-[3000ms] delay-75 w-32 h-32 -ml-8 -mt-4 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[#FFD6BA] rounded-full animate-ping opacity-20 duration-[3000ms] delay-1000 w-24 h-24 ml-8 mt-4 pointer-events-none"></div>
        
        {/* Using the exact colorful bouncy navbar logo */}
        <BrandLogo className="h-16 sm:h-20 drop-shadow-sm" showTagline={false} animate={true} linkTo="#" />
      </div>
      <p className="text-[#EF4A45] font-black text-lg sm:text-xl tracking-wider animate-pulse">
        {text}
      </p>
    </div>
  );
}
