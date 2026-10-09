import React from 'react';

const defaultColors = [
  { name: 'Sky Blue', hex: '#A7D8FF' },
  { name: 'Mint Green', hex: '#B8F2D0' },
  { name: 'Soft Yellow', hex: '#FFE89A' },
  { name: 'Coral Pink', hex: '#FF8E8E' },
  { name: 'Soft Lavender', hex: '#D8C7FF' }
];

export default function ColorSwatches({ selectedColor, onSelectColor, colors = defaultColors }) {
  return (
    <div className="space-y-2">
      <div className="text-[15px] font-semibold text-black">Colour</div>
      <div className="flex items-center space-x-2.5">
        {colors.map((c) => {
          const isSelected = selectedColor === c.hex;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => onSelectColor && onSelectColor(c.hex)}
              title={c.name}
              style={{ backgroundColor: c.hex }}
              className={`w-6 h-6 rounded-full transition-transform border-2 ${isSelected
                  ? 'border-slate-800 scale-125 shadow-md'
                  : 'border-white hover:scale-110 shadow-sm'
                }`}
            />
          );
        })}
      </div>
    </div>
  );
}
