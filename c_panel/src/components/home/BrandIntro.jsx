import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';

export default function BrandIntro() {
  return (
    <section className="py-24 bg-slate-900/60 relative overflow-hidden border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Visual Showcase Stack */}
          <div className="relative">
            <div className="relative z-10 rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop"
                alt="Jog & Joy Garment Craftsmanship"
                className="w-full h-112.5 object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00] shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white">Legacy Since 1996</h4>
                    <p className="text-xs text-slate-400">Under Dharmnath Products & Kamal Clothing tradition.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Glowing Accent */}
            <div className="absolute -bottom-6 -left-6 w-72 h-72 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Content Info */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> Brand Essence
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              LOVE IS IN THE <span className="text-gradient-lime">WEAR</span>
            </h2>

            <p className="text-slate-300 text-base leading-relaxed">
              At <strong className="text-white">Jog&Joy</strong>, we believe activewear should be an extension of your energy. Spearheaded by Vaishal A Shah under the legacy founded by Ashwin Bhai K Shah in 1996, Jog&Joy bridges superior manufacturing standards with vibrant everyday comfort.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <CheckCircle2 className="w-5 h-5 text-[#ccff00] shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-bold text-white">Advanced Stitching</h5>
                  <p className="text-xs text-slate-400">State-of-the-art flatlock machinery for seamless movement.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <CheckCircle2 className="w-5 h-5 text-[#ccff00] shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-bold text-white">Breathable Fabrics</h5>
                  <p className="text-xs text-slate-400">Moisture-wicking combed cotton blends.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link to="/about-us">
                <Button size="lg" icon={ArrowRight}>
                  Read Our Story
                </Button>
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
