import React from 'react';

const defaultSizes = ['2Y-3Y', '4Y-5Y', '6Y-7Y', '8Y-9Y', '10Y-12Y', 'S', 'M', 'L', 'XL'];

export default function SizeSelector({ selectedSize, onSelectSize, sizes = defaultSizes }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
        <span>SELECT SIZE</span>
        <span className="text-slate-400 font-semibold text-[11px] underline cursor-pointer hover:text-slate-700">
          Size Guide
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelectSize && onSelectSize(size)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-[#A7D8FF] hover:bg-[#FFF8F0]'
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
