import React from 'react';
import { getColorName } from '../../utils/helpers';

const defaultColors = [
  { name: 'Sky Blue', hex: '#A7D8FF' },
  { name: 'Mint Green', hex: '#B8F2D0' },
  { name: 'Soft Yellow', hex: '#FFE89A' },
  { name: 'Coral Pink', hex: '#FF8E8E' },
  { name: 'Soft Lavender', hex: '#D8C7FF' }
];

export default function ColorSwatches({ selectedColor, onSelectColor, colors = defaultColors }) {
  const selectedObj = colors.find(c => ((typeof c === 'string' ? c : c.hex)?.toLowerCase() === selectedColor?.toLowerCase()));
  const selectedName = (selectedObj && typeof selectedObj === 'object' && selectedObj.name) 
    ? selectedObj.name 
    : (selectedColor ? getColorName(selectedColor) : '');

  return (
    <div className="space-y-2">
      <div className="text-[15px] font-semibold text-black flex items-center gap-2">
        <span>Colour</span>
        {selectedName && (
          <span className="font-bold text-[#5B2E89]">({selectedName})</span>
        )}
      </div>
      <div className="flex items-center space-x-2.5">
        {colors.map((c) => {
          const hex = typeof c === 'string' ? c : c.hex;
          const name = (typeof c === 'object' && c.name) ? c.name : getColorName(hex);
          const isSelected = selectedColor?.toLowerCase() === hex?.toLowerCase();
          return (
            <button
              key={hex}
              type="button"
              onClick={() => onSelectColor && onSelectColor(hex)}
              title={`${name} (${hex})`}
              style={{ backgroundColor: hex }}
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
