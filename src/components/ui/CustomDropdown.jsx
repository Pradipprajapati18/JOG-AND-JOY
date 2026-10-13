import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  className = "",
  buttonClassName = "",
  icon: LeftIcon = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside or Esc key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left w-full sm:w-auto ${isOpen ? 'z-100' : 'z-10'} ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`w-full inline-flex items-center justify-between gap-3 px-4 py-2.5 bg-[#FFF8EC] hover:bg-[#FFF3EE] border-2 ${
          isOpen ? 'border-[#FF7A59] ring-4 ring-[#FF7A59]/15' : 'border-[#FFE0D6] hover:border-[#FF7A59]/50'
        } rounded-2xl text-xs font-black text-slate-800 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {LeftIcon && <LeftIcon className="w-4 h-4 text-[#FF7A59] shrink-0" />}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#FF7A59] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      {/* Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full z-999 w-full min-w-[210px] bg-white border-2 border-[#FFE0D6] rounded-2xl shadow-2xl p-1.5 space-y-1 drop-shadow-2xl"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFF3EE] text-[#FF7A59] shadow-xs'
                        : 'text-slate-700 hover:bg-[#FFF8EC] hover:text-[#FF7A59]'
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#FF7A59] shrink-0 ml-2" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
