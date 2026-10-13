import React, { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Playful Hand-Drawn SVG Doodles
const SparkleDoodle = ({ className = "w-6 h-6 text-emerald-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const CloudDoodle = ({ className = "w-12 h-12 text-emerald-400/60" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 44h32a12 12 0 0 0 0-24 14 14 0 0 0-27-3A10 10 0 0 0 16 44z" fill="rgba(255,255,255,0.4)" />
  </svg>
);

const SquiggleDoodle = ({ className = "w-16 h-4 text-emerald-600/70" }) => (
  <svg className={className} viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M5 10 Q 25 2 45 10 T 85 10" />
  </svg>
);

const EnvelopeDoodle = ({ className = "w-10 h-10 text-emerald-600" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="10" width="36" height="28" rx="6" fill="white" />
    <path d="M6 14l18 14 18-14" />
    <circle cx="38" cy="14" r="3" fill="#EF4A45" />
  </svg>
);

const StarDoodle = ({ className = "w-7 h-7 text-amber-400" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6 4.5 2.3 7.1-6.3-4.6-6.3 4.6 2.3-7.1-6-4.5h7.6z" />
  </svg>
);

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Soft Light Green / Mint Pastel Card Container */}
        <div className="rounded-[3.5rem] bg-linear-to-br from-[#D2F8DC] via-[#E6FCEE] to-[#B8F3C7] p-8 sm:p-14 text-emerald-950 shadow-2xl relative overflow-hidden border-4 border-white/80">

          {/* Soft Background Radial Light */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-200/40 rounded-full blur-3xl pointer-events-none"></div>

          {/* --- FLOATING DOODLES --- */}

          {/* Top Left Cloud Doodle */}
          <motion.div
            animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-6 left-8 pointer-events-none"
          >
            <CloudDoodle />
          </motion.div>

          {/* Top Right Star Doodle */}
          <motion.div
            animate={{ rotate: [0, 20, 0], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute top-8 right-10 pointer-events-none"
          >
            <StarDoodle />
          </motion.div>

          {/* Bottom Left Envelope Doodle */}
          <motion.div
            animate={{ y: [0, 6, 0], rotate: [-10, 5, -10] }}
            transition={{ repeat: Infinity, duration: 3.5 }}
            className="absolute bottom-8 left-10 pointer-events-none hidden sm:block"
          >
            <EnvelopeDoodle />
          </motion.div>

          {/* Bottom Right Sparkles Doodle */}
          <motion.div
            animate={{ scale: [0.8, 1.2, 0.8], rotate: [0, 90, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute bottom-10 right-12 pointer-events-none"
          >
            <SparkleDoodle className="w-8 h-8 text-emerald-600" />
          </motion.div>

          {/* Middle Right Squiggle Doodle */}
          <div className="absolute top-1/2 right-6 -translate-y-1/2 pointer-events-none hidden md:block opacity-75">
            <SquiggleDoodle />
          </div>


          {/* --- MAIN CARD CONTENT --- */}
          <div className="relative z-10 text-center max-w-xl mx-auto space-y-5">

            {/* Top Mail Icon Badge */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-14 h-14 rounded-2xl bg-white text-[#EF4A45] flex items-center justify-center mx-auto shadow-md border-2 border-emerald-100"
            >
              <Mail className="w-7 h-7" />
            </motion.div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-emerald-950 leading-tight">
              Get <span className="text-[#EF4A45]">₹200 OFF</span> Your First Order!
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm font-bold text-emerald-800/90 leading-relaxed max-w-lg mx-auto">
              Subscribe to our fun newsletter for exclusive drop alerts, secret flash sales, and parenting tips.
            </p>

            {/* Form / Success State */}
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-3xl bg-white text-emerald-900 font-extrabold text-sm flex items-center justify-center gap-3 shadow-lg border-2 border-emerald-200"
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <span>🎉 Hurray! You're subscribed. Use code <span className="bg-emerald-100 px-2.5 py-1 rounded-lg text-emerald-800 font-black tracking-wider">WELCOME200</span> on checkout!</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 pt-2 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={true}
                  className="w-full px-6 py-4 rounded-full bg-white text-emerald-950 font-bold text-sm placeholder-emerald-800/40 focus:outline-none focus:ring-4 focus:ring-emerald-400/50 shadow-md border border-emerald-100"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-950 hover:bg-[#EF4A45] text-white font-black text-sm shadow-xl hover:scale-105 transition-all shrink-0 flex items-center justify-center gap-2 border-2 border-emerald-950"
                >
                  <span>Subscribe</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Anti-spam notice */}
            <p className="text-[11px] text-emerald-800/70 font-extrabold tracking-wide pt-1">
              🔒 No spam ever. Unsubscribe anytime with 1 click.
            </p>

          </div>

        </div>
      </div>
    </section>
  );
}
