import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Palette, TrendingUp, Scissors, User, Building, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import FloatingElements from '../components/ui/FloatingElements';
import ClothDoodlesBackground from '../components/ui/ClothDoodlesBackground';
import { getImageUrl } from '../utils/getImageUrl';

const stats = [
  { value: 30, suffix: '+', label: 'Years Experience', color: 'text-[#EF4A45]' },
  { value: 1, suffix: 'M+', label: 'Happy Customers', color: 'text-[#EAB308]' },
  { value: 500, suffix: '+', label: 'Retail Partners', color: 'text-[#00A3E0]' },
  { value: 100, suffix: '%', label: 'Bio-Washed Cotton', color: 'text-[#10B981]' }
];

const teamMembers = [
  { name: 'Vaishal A Shah', role: 'Managing Director', image: 'https://ui-avatars.com/api/?name=Vaishal+Shah&background=AEE6FF&color=000&size=300' }
];

const CustomClothingSticker = ({ type, style }) => {
  const map = {
    "sticker_0_0": getImageUrl('cutouts/cutout_1.webp'),
    "sticker_0_1": getImageUrl('cutouts/cutout_2.webp'),
    "sticker_0_2": getImageUrl('cutouts/cutout_3.webp'),
    "sticker_1_0": getImageUrl('cutouts/cutout_4.webp'),
    "sticker_1_1": getImageUrl('cutouts/cutout_5.webp'),
    "sticker_1_2": getImageUrl('cutouts/cutout_6.webp'),
    "sticker_2_0": getImageUrl('cutouts/cutout_7.webp'),
    "sticker_2_1": getImageUrl('cutouts/cutout_8.webp'),
    "sticker_2_2": getImageUrl('cutouts/cutout_9.webp'),
  };

  return (
    <div
      className="absolute z-0 pointer-events-none drop-shadow-sm opacity-30 mix-blend-multiply"
      style={{ ...style, width: '120px', height: '120px' }}
    >
      <img src={map[type]} alt={type} className="w-full h-full object-contain" />
    </div>
  );
};

export default function AboutUs() {
  return (
    <div className="bg-[#FFF8EC] min-h-screen font-sans overflow-x-hidden relative">
      <ClothDoodlesBackground />
      <FloatingElements />

      {/* 1. Playful Kids Hero Section */}
      <section className="pt-8 pb-10 px-4 relative z-10 overflow-hidden bg-transparent">

        {/* Full Width Hero Content (No Container) */}
        <div className="w-full max-w-7xl mx-auto relative flex flex-col pt-4 md:pt-10">

          {/* Top Playful Badge */}
          <div className="flex items-center justify-center mb-4">
            <span className="px-4 py-1.5 rounded-full bg-[#FFF3EE] text-[#FF7A59] border border-[#FFE0D6] text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Made For Play & Smiles 🌈
            </span>
          </div>

          {/* Center Text Content */}
          <div className="text-center max-w-3xl mx-auto mb-8 px-4 relative z-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl leading-[1.15] font-black text-slate-900 tracking-tight mb-4 font-heading-primary">
              Our Story of <span className="text-[#FF7A59]">Playful Joy</span> <br />and Pure <span className="text-[#8DD67C]">Comfort</span> 🎈
            </h1>
            <p className="text-slate-500 text-base md:text-lg font-medium max-w-xl mx-auto leading-relaxed">
              Crafted with love for your little adventurers! 100% super-soft organic cotton, non-scratchy seams, and play-proof durability.
            </p>
          </div>

          {/* Playful Kids Gallery Grid */}
          <div className="relative w-full overflow-hidden mb-8">
            <motion.div
              className="flex gap-4 md:gap-6 min-w-max py-2 px-4 items-center"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 25, repeat: Infinity }}
            >
              {[
                { src: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=600&auto=format&fit=crop", tag: "☁️ Soft Tees" },
                { src: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop", tag: "🎨 Fun Colors" },
                { src: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop", tag: "🏃 Active Play" },
                { src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop", tag: "✨ Comfy Shorts" },
                { src: "https://images.unsplash.com/photo-1471286174574-e9627710ee7e?q=80&w=600&auto=format&fit=crop", tag: "🎈 Cute Frocks" },
                { src: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=600&auto=format&fit=crop", tag: "☁️ Soft Tees" },
                { src: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop", tag: "🎨 Fun Colors" },
                { src: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop", tag: "🏃 Active Play" }
              ].map((item, idx) => (
                <div key={idx} className="relative h-[180px] w-[140px] md:h-[230px] md:w-[180px] rounded-3xl overflow-hidden shrink-0 group shadow-md border-4 border-white bg-[#FFF8EC] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <img
                    src={item.src}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={`Kids Outfit ${idx}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=600&auto=format&fit=crop";
                    }}
                  />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-center">
                    <span className="text-[11px] font-extrabold text-slate-800 tracking-wide">{item.tag}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>


        </div>
      </section>

      {/* 2. Split Hero & Quote (Playful Edit) */}
      <section id="who-we-are" className="py-12 px-4 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">

          {/* Left: Image & Quote */}
          <div className="relative pl-4 lg:pl-8">
            {/* Background Blob decoration */}
            <div className="absolute top-4 -left-4 w-full h-full bg-[#AEE6FF] rounded-[3rem] rotate-3" />

            <div className="relative rounded-[3rem] overflow-hidden aspect-4/5 sm:aspect-square lg:aspect-4/5 shadow-xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Jog and Joy Manufacturing"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlapping Quote Bubble */}
            <div className="absolute top-1/2 -right-4 lg:-right-12 -translate-y-1/2 bg-white p-6 sm:p-8 shadow-2xl rounded-3xl border-2 border-[#FFD800] max-w-[280px] transform hover:scale-105 transition-transform">
              <p className="text-slate-900 font-black text-lg sm:text-xl leading-snug mb-3">
                "Quality is non-negotiable. Comfort is our core."
              </p>
              <p className="text-xs font-bold uppercase tracking-widest text-[#EF4A45]">Ashwin Bhai K Shah</p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="lg:pl-12 space-y-6">
            <span className="px-3 py-1 bg-[#FFD800]/20 text-slate-800 rounded-lg text-xs font-black uppercase tracking-widest font-poppins">Who We Are</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight font-heading-primary">
              Activewear is about <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00A3E0] to-[#EF4A45]">freedom</span>, not just fabric.
            </h2>
            <p className="text-slate-600 text-base font-semibold leading-relaxed font-poppins">
              We started our journey in 1996 with a singular focus on perfect knitting and stitching. Today, Jog&Joy brings vibrant, durable, and extremely comfortable activewear directly to the next generation of kids.
            </p>

            <div className="pt-4 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#CFFFE5] text-[#10B981] flex items-center justify-center shrink-0">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 font-heading-primary">Bio-Washed Cotton</h4>
                  <p className="text-slate-600 text-sm font-semibold mt-1 font-poppins">We use 100% bio-washed combed cotton to ensure zero toxicity, ultimate softness, and zero shrinkage.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD800]/20 text-[#D97706] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 font-heading-primary">High-Volume Production</h4>
                  <p className="text-slate-600 text-sm font-semibold mt-1 font-poppins">State-of-the-art facilities allow us to maintain a massive inventory, ready to supply our network immediately.</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-[#EF4A45] to-orange-500 hover:from-orange-500 hover:to-[#EF4A45] text-white font-extrabold rounded-full shadow-lg shadow-red-500/20 hover:shadow-xl hover:scale-105 hover:-translate-y-0.5 transition-all">
                Discover More <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* 4. Vibrant CTA Section */}
      <section className="relative py-32 md:py-48 mt-12 bg-[url('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-fixed bg-cover bg-center rounded-3xl mx-4 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-[#EF4A45]/90 via-[#D32F2F]/80 to-[#00A3E0]/90" />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 text-white space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-extrabold uppercase tracking-widest backdrop-blur-sm shadow-sm font-poppins">
            Partner With Us
          </span>
          <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight font-heading-primary">
            Grow your retail business with our high-demand apparel
          </h2>
          <p className="text-lg text-white/80 font-semibold max-w-2xl mx-auto font-poppins">
            Join our rapidly expanding network of wholesale distributors. Enjoy high margins, dedicated brand support, and a product that sells itself.
          </p>
          <div className="pt-8">
            <Link to="/distributor-network" className="inline-block px-10 py-5 bg-linear-to-r from-[#FFD800] to-amber-500 hover:from-amber-500 hover:to-[#FFD800] text-slate-950 font-black rounded-full shadow-lg shadow-amber-500/25 hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5 transition-all font-poppins">
              Become a Distributor
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Overlapping Feature Cards */}
      <section className="px-4 relative z-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 -mt-20">

          <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center gap-4 hover:-translate-y-2 transition-transform border-b-4 border-[#00A3E0]">
            <div className="w-16 h-16 rounded-2xl bg-[#AEE6FF]/35 text-[#00A3E0] flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-slate-900 mt-2 font-heading-primary">Kids Focus</h4>
            <p className="text-sm font-semibold text-slate-600 font-poppins">Empowering play with bright, non-toxic kids activewear at great wholesale price points.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center gap-4 hover:-translate-y-2 transition-transform border-b-4 border-[#10B981]">
            <div className="w-16 h-16 rounded-2xl bg-[#CFFFE5] text-[#10B981] flex items-center justify-center">
              <Scissors className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-slate-900 mt-2 font-heading-primary">Quality Guarantee</h4>
            <p className="text-sm font-semibold text-slate-600 font-poppins">Multi-needle flatlock stitching and colorfast dyes guarantee long-lasting durability.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center gap-4 hover:-translate-y-2 transition-transform border-b-4 border-[#EF4A45]">
            <div className="w-16 h-16 rounded-2xl bg-[#FF8E8E]/20 text-[#EF4A45] flex items-center justify-center">
              <Building className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-slate-900 mt-2 font-heading-primary">Distributor First</h4>
            <p className="text-sm font-semibold text-slate-600 font-poppins">Building transparent, highly profitable wholesale partnerships backed by fast logistics.</p>
          </div>

        </div>
      </section>

      {/* 6. Meet Our Team */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="px-3 py-1 bg-[#00A3E0]/15 text-[#00A3E0] rounded-lg text-xs font-black uppercase tracking-widest font-poppins">Meet Our Founders</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight font-heading-primary">
              We serve uniqueness because <br />you are unique to us
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-3xl mx-auto">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] shadow-lg hover:shadow-xl transition-all group overflow-hidden border border-slate-100 p-4">
                <div className="aspect-square bg-slate-100 rounded-4xl overflow-hidden">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 text-center">
                  <h4 className="text-xl font-black text-slate-900 font-heading-primary">{member.name}</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#EF4A45] mt-2 mb-4">{member.role}</p>

                  <div className="flex items-center justify-center gap-3">
                    <a href="#" className="w-10 h-10 rounded-full bg-[#FFF8EC] text-[#EF4A45] flex items-center justify-center hover:bg-[#EF4A45] hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" /></svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-[#FFF8EC] text-[#00A3E0] flex items-center justify-center hover:bg-[#00A3E0] hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.52 8.52 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
