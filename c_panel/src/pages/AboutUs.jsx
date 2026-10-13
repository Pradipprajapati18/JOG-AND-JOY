import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Palette, TrendingUp, Scissors, User, Building, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import FloatingElements from '../components/ui/FloatingElements';
import ClothDoodlesBackground from '../components/ui/ClothDoodlesBackground';
import { getImageUrl } from '../utils/getImageUrl';
import vaishalImage from '../assets/vaishal_shah.png';
import { useCombinedProducts } from '../queries/useCombinedProducts';

const stats = [
  { value: 30, suffix: '+', label: 'Years Experience', color: 'text-[#EF4A45]' },
  { value: 1, suffix: 'M+', label: 'Happy Customers', color: 'text-[#EAB308]' },
  { value: 500, suffix: '+', label: 'Retail Partners', color: 'text-[#00A3E0]' },
  { value: 100, suffix: '%', label: 'Bio-Washed Cotton', color: 'text-[#10B981]' }
];

const teamMembers = [
  { name: 'Vaishal A Shah', role: 'Managing Director', image: vaishalImage || '/images/vaishal_shah.png' }
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
  const { combinedProducts } = useCombinedProducts();

  const newArrivalGalleryItems = useMemo(() => {
    // 1. Fetch live new arrivals from useCombinedProducts (what New Arrivals page fetches)
    const newItems = combinedProducts?.filter((p) => p.isNew && (p.image || p.images?.[0])) || [];
    if (newItems.length >= 4) {
      return newItems.slice(0, 10).map((p) => ({
        src: p.image || p.images?.[0],
        tag: p.name || '✨ New Drop'
      }));
    }

    // 2. Fallback to all live products with images
    const liveItems = combinedProducts?.filter((p) => p.image || p.images?.[0]) || [];
    if (liveItems.length >= 4) {
      return liveItems.slice(0, 10).map((p) => ({
        src: p.image || p.images?.[0],
        tag: p.name || '✨ Fresh Kids Style'
      }));
    }

    // 3. Fallback to New Arrivals gallery images
    return [
      { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50.webp", tag: "☁️ Soft Tees" },
      { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50 (1).webp", tag: "🎨 Fun Colors" },
      { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50 (2).webp", tag: "🏃 Active Play" },
      { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50 (3).webp", tag: "✨ Comfy Shorts" },
      { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50 (4).webp", tag: "🎈 Cute Frocks" },
      { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50 (5).webp", tag: "☁️ Soft Tees" },
      { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51.webp", tag: "🎨 Fun Colors" },
      { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (1).webp", tag: "🏃 Active Play" }
    ];
  }, [combinedProducts]);

  const marqueeItems = useMemo(() => {
    let items = newArrivalGalleryItems || [];
    if (items.length === 0) return [];
    while (items.length < 8) {
      items = [...items, ...newArrivalGalleryItems];
    }
    return [...items, ...items];
  }, [newArrivalGalleryItems]);
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
            <div className="inline-flex flex-col items-center justify-center select-none group cursor-default">
              {/* Row 1: MADE FOR PLAY */}
              <div className="inline-flex flex-col items-center">
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.34em] bg-linear-to-r from-[#FF6B4A] via-[#FFAE19] to-[#FFD800] bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-105">
                  MADE FOR PLAY
                </span>
                <div className="w-full min-w-[150px] sm:min-w-[180px] h-[3px] rounded-full bg-linear-to-r from-[#FF6B4A] via-[#FFD800] to-[#00A3E0] mt-1.5 shadow-2xs" />
              </div>

              {/* Row 2: & SMILES */}
              <div className="inline-flex flex-col items-center mt-2">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.42em] text-[#0F172A] transition-colors duration-300 group-hover:text-[#5B2E89]">
                  & SMILES
                </span>
                <div className="w-full min-w-[95px] sm:min-w-[120px] h-[2.5px] rounded-full bg-linear-to-r from-[#00A3E0] via-[#4F46E5] to-[#5B2E89] mt-1.5 shadow-2xs" />
              </div>
            </div>

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
              {marqueeItems.map((item, idx) => (
                <div key={idx} className="relative h-[180px] w-[140px] md:h-[230px] md:w-[180px] rounded-3xl overflow-hidden shrink-0 group shadow-md border-4 border-white bg-[#FFF8EC] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <img
                    src={item.src}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={`Kids Outfit ${idx}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50.webp";
                    }}
                  />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-center">
                    <span className="text-[11px] font-extrabold text-slate-800 tracking-wide line-clamp-1">{item.tag}</span>
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
          {/* Partner With Us: Sleek Dual Underline Header for Vibrant Background */}
          <div className="inline-flex flex-col items-center justify-center select-none group cursor-default mb-2">
            {/* Row 1: PARTNER */}
            <div className="inline-flex flex-col items-center">
              <span className="text-xs sm:text-sm font-black uppercase tracking-[0.36em] bg-linear-to-r from-[#FFD800] via-[#FFE57F] to-[#FFF9C4] bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 drop-shadow-xs">
                PARTNER
              </span>
              <div className="w-full min-w-[110px] sm:min-w-[130px] h-[3px] rounded-full bg-linear-to-r from-[#FFD800] via-[#FFAE19] to-[#AEE6FF] mt-1.5 shadow-sm" />
            </div>

            {/* Row 2: WITH US */}
            <div className="inline-flex flex-col items-center mt-2">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.44em] text-white/95 group-hover:text-white transition-colors duration-300 drop-shadow-xs">
                WITH US
              </span>
              <div className="w-full min-w-[95px] sm:min-w-[115px] h-[2.5px] rounded-full bg-linear-to-r from-[#AEE6FF] via-[#00A3E0] to-[#FFFFFF] mt-1.5 shadow-sm" />
            </div>
          </div>

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
            {/* Meet Our Founders: Style 4 Premium Stacked Typography */}
            <div className="flex items-center justify-center">
              <div className="inline-flex flex-col items-center justify-center select-none group cursor-default">
                {/* Row 1: MEET OUR */}
                <div className="inline-flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-[0.34em] bg-linear-to-r from-[#FF6B4A] via-[#FFAE19] to-[#FFD800] bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-105">
                    MEET OUR
                  </span>
                  <div className="w-full min-w-[125px] sm:min-w-[145px] h-[3px] rounded-full bg-linear-to-r from-[#FF6B4A] via-[#FFD800] to-[#00A3E0] mt-1.5 shadow-2xs" />
                </div>

                {/* Row 2: FOUNDERS */}
                <div className="inline-flex flex-col items-center mt-2">
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.44em] text-[#0F172A] transition-colors duration-300 group-hover:text-[#5B2E89]">
                    FOUNDERS
                  </span>
                  <div className="w-full min-w-[110px] sm:min-w-[130px] h-[2.5px] rounded-full bg-linear-to-r from-[#00A3E0] via-[#4F46E5] to-[#5B2E89] mt-1.5 shadow-2xs" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight font-heading-primary">
              We serve uniqueness because <br />you are unique to us
            </h2>
          </div>

          <div className="w-full flex justify-center items-center">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="w-full max-w-sm sm:max-w-md bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden border-2 border-orange-100/80 p-5 mx-auto">
                <div className="aspect-square bg-slate-100 rounded-4xl overflow-hidden shadow-inner">
                  <img
                    src={member.image || '/images/vaishal_shah.png'}
                    alt={member.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/vaishal_shah.png';
                    }}
                  />
                </div>
                <div className="p-6 text-center">
                  <h4 className="text-2xl font-black text-slate-900 font-heading-primary">{member.name}</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#EF4A45] mt-2 mb-4">{member.role}</p>

                  <div className="flex items-center justify-center gap-3">
                    <a 
                      href="https://www.facebook.com/profile.php?id=61594924757967" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="Facebook" 
                      title="Facebook (@jognjoyofficial)"
                      className="w-10 h-10 rounded-full bg-[#FFF8EC] text-[#3B5998] flex items-center justify-center hover:bg-[#3B5998] hover:text-white transition-all hover:scale-110 shadow-xs"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" /></svg>
                    </a>
                    <a 
                      href="https://www.instagram.com/jognjoy_official?mdxt=MXdncjk4NDlqczFxcA==" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="Instagram" 
                      title="Instagram (@jognjoy_official)"
                      className="w-10 h-10 rounded-full bg-[#FFF8EC] text-[#E1306C] flex items-center justify-center hover:bg-linear-to-tr hover:from-[#fdf497] hover:via-[#fd5949] hover:to-[#285AEB] hover:text-white transition-all hover:scale-110 shadow-xs"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
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
