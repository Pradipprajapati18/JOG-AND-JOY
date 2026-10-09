import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export default function ToastContainer({ toasts, removeToast, position = 'bottom-right' }) {
  const positionClasses = {
    'bottom-right': 'bottom-24 right-4 sm:bottom-6 sm:right-6',
    'bottom-center': 'bottom-24 left-1/2 -translate-x-1/2 sm:bottom-6',
    'top-right': 'top-6 right-4 sm:right-6',
    'top-center': 'top-6 left-1/2 -translate-x-1/2',
  };

  return (
    <div className={`fixed z-[100] flex flex-col gap-3 pointer-events-none ${positionClasses[position]}`}>
      <AnimatePresence>
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isInfo = toast.type === 'info';
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: position.includes('bottom') ? 20 : -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              layout
              className={`pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-[380px] p-4 rounded-2xl shadow-xl shadow-black/5 border backdrop-blur-md ${
                isError 
                  ? 'bg-red-50/95 border-red-200 text-red-900' 
                  : isInfo
                    ? 'bg-blue-50/95 border-blue-200 text-blue-900'
                    : 'bg-slate-900/95 border-slate-800 text-white'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isError ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : isInfo ? (
                  <Info className="w-5 h-5 text-blue-500" />
                ) : (
                  <CheckCircle2 className={`w-5 h-5 ${isError ? '' : 'text-emerald-400'}`} />
                )}
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-bold leading-tight ${isError ? 'text-red-900' : isInfo ? 'text-blue-900' : 'text-white'}`}>
                  {toast.message || toast.msg}
                </p>
                {toast.description && (
                  <p className={`text-xs mt-1 font-medium ${isError ? 'text-red-700' : isInfo ? 'text-blue-700' : 'text-slate-300'}`}>
                    {toast.description}
                  </p>
                )}
              </div>

              {removeToast && (
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeToast(toast.id); }}
                  onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); removeToast(toast.id); }}
                  className={`shrink-0 p-1.5 -mr-1 -mt-1 rounded-full opacity-60 hover:opacity-100 transition-opacity active:scale-90 ${
                    isError ? 'hover:bg-red-200 text-red-900' : isInfo ? 'hover:bg-blue-200 text-blue-900' : 'hover:bg-slate-700 text-white'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
