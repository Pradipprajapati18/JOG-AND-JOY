import React, { useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import Button from './Button';

export default function Modal({ isOpen, onClose, title, message, type = 'success' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          {type === 'success' && (
            <div className="w-16 h-16 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          )}

          <h3 className="text-xl font-bold text-white tracking-wide">{title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>

          <Button variant="primary" onClick={onClose} className="w-full mt-4">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
