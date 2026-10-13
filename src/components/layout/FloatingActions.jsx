import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowUp, MessageSquare } from 'lucide-react';

export default function FloatingActions({ onOpenLiveChat }) {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setShowScroll(window.scrollY > 300);
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-5 z-40 flex flex-col items-center gap-2 md:gap-3">
      {/* Live Chat Trigger */}
      <button
        onClick={onOpenLiveChat}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#AEE6FF] text-slate-900 shadow-xl hover:scale-110 flex items-center justify-center transition-all duration-200 border-2 border-white group"
        title="Live Support Chat"
      >
        <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-slate-800 group-hover:rotate-12 transition-transform" />
      </button>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/919429905118?text=Hello%20Jog%20%26%20Joy!%20I%20have%20an%20inquiry%20about%20kids%20clothing."
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#25D366] text-white shadow-xl hover:scale-110 flex items-center justify-center transition-all duration-200 border-2 border-white"
        title="WhatsApp Support"
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6 fill-white" />
      </a>

      {/* Scroll To Top Button */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-lg flex items-center justify-center transition-all duration-200 backdrop-blur-md animate-in fade-in"
          title="Scroll to top"
        >
          <ArrowUp className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      )}
    </div>
  );
}
