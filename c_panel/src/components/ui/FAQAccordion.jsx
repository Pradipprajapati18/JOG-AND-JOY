import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden transition-all"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-slate-800 text-base sm:text-lg hover:bg-[#FFF8F0] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#A7D8FF]/30 flex items-center justify-center text-slate-700 shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span>{item.question}</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-sky-600' : ''
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
