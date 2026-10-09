import React, { useMemo, useState, useRef } from 'react';
import { Sparkles, ArrowRight, TrendingUp, Play } from 'lucide-react';
import NewArrivalProductCard from '../components/ui/NewArrivalProductCard';
import QuickViewModal from '../components/ui/QuickViewModal';
import { useCombinedProducts } from '../queries/useCombinedProducts';
import { Link } from 'react-router-dom';
import DomeGallery from '../components/ui/DomeGallery';
import AnimatedLogoLoader from '../components/ui/AnimatedLogoLoader';

const newArrivalImages = [
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50.webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50 (1).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50 (2).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50 (3).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50 (4).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50 (5).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51.webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (1).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (2).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (3).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (4).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (5).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (6).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (7).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (8).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (9).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (10).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (11).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (12).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (13).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (14).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (15).webp", alt: "Gallery Image" },
  { src: "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (16).webp", alt: "Gallery Image" }
];

export default function NewArrivalsPage() {
  const spotlightRef = useRef(null);

  const { combinedProducts, isLoading } = useCombinedProducts();

  const newProducts = useMemo(() => {
    return combinedProducts.filter((p) => p.isNew);
  }, [combinedProducts]);

  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const productsPerPage = 16;
  const totalPages = Math.ceil(newProducts.length / productsPerPage) || 1;
  const currentProducts = newProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setTimeout(() => {
        if (spotlightRef.current) {
          const y = spotlightRef.current.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">

      {/* Inline styles for marquee animation */}
      <style>{`
        @keyframes marquee-fast {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-fast {
          animation: marquee-fast 12s linear infinite;
        }
      `}</style>

      {/* Reference-Inspired Kids Fashion New Arrivals Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 relative z-10">

        {/* TOP BANNER: Headline + Spinning Video Badge + Avatar Stack */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">

          {/* Left: Spinning Badge */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="relative w-24 h-24 flex items-center justify-center select-none">
              <svg className="w-full h-full animate-[spin_12s_linear_infinite] text-slate-800" viewBox="0 0 100 100">
                <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                <text className="text-[9.5px] font-black uppercase tracking-[0.2em] fill-current">
                  <textPath href="#circlePath">
                    ★ NEW ARRIVALS ★ FRESH KIDS STYLES ★
                  </textPath>
                </text>
              </svg>
              <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-[#FF7A59] text-white flex items-center justify-center shadow-md">
                <Play className="w-4 h-4 fill-white ml-0.5" />
              </div>
            </div>
          </div>

          {/* Center Headline */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-linear-to-r from-[#FFF3EE] via-[#FFF9E6] to-[#EBF7FF] border border-[#FFE0D6] text-[#FF7A59] font-black text-xs uppercase tracking-wider mb-5 shadow-xs">
              <Sparkles className="w-4 h-4 text-[#FF7A59] animate-pulse" />
              <span>Just Dropped • Season 2026 🌈</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] font-heading-primary">
              Elevate Your <span className="font-serif italic font-normal text-slate-800 underline decoration-[#FFD800] decoration-wavy decoration-2">Style</span> With <br />
              <span className="bg-linear-to-r from-[#FF7A59] via-[#E65100] to-[#00A3E0] bg-clip-text text-transparent">
                Bold New Fashion 🎈
              </span>
            </h1>
          </div>

          {/* Right: Parent Avatar Stack */}
          <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-full border border-slate-100 shadow-sm select-none">
            <div className="flex -space-x-2.5 overflow-hidden">
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" alt="Parent 1" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" alt="Parent 2" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" alt="Parent 3" />
              <div className="h-8 w-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center ring-2 ring-white">
                5k+
              </div>
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-slate-900 leading-tight">Happy Families</div>
              <div className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                ★★★★★ <span className="text-slate-400 font-medium">4.9/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* DYNAMIC 3D SPHERICAL DOME GALLERY (Replaces Old Grid) */}
        <div className="w-screen h-screen relative left-1/2 -translate-x-1/2 mb-12 bg-slate-950 sm:bg-white overflow-hidden shadow-sm cursor-grab active:cursor-grabbing border-y border-slate-100">
          <DomeGallery 
            images={newArrivalImages} 
            grayscale={true} 
            overlayBlurColor="#ffffff" 
            imageBorderRadius="24px"
            openedImageBorderRadius="32px"
            padFactor={0.2}
            fit={0.9}
          />
        </div>

        {/* BOTTOM FEATURE BAR: Review Quote + Lifestyle Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100 text-left">

          {/* Left Testimonial */}
          <div className="flex items-start gap-3 max-w-md">
            <span className="text-4xl leading-none text-[#FF7A59] font-serif font-black">“</span>
            <div>
              <p className="text-xs sm:text-sm text-slate-700 font-bold leading-relaxed">
                Jog & Joy’s new arrivals are super soft, colorful, and built for play! Loved the quality and vibe! 💕
              </p>
              <span className="text-[11px] font-extrabold text-[#FF7A59] font-serif italic mt-1 block">
                ~ Rafi H. (Happy Parent)
              </span>
            </div>
          </div>

          {/* Right Lifestyle Badge */}
          <Link to="/kids" className="flex items-center gap-4 bg-[#FFF8EC] px-6 py-3.5 rounded-2xl border border-[#FFE0D6] cursor-pointer hover:bg-[#FFF0E0] transition-colors group">
            <div className="text-3xl font-black text-slate-900 font-serif leading-none group-hover:text-[#FF7A59] transition-colors">01</div>
            <div className="text-left">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#FF7A59]">Lifestyle</div>
              <div className="text-xs font-extrabold text-slate-900">Set Up Your Kids Wardrobe With Latest Trends</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-800 ml-2 shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>

        </div>

      </div>

      {/* Monochrome/Mint Marquee */}
      <div className="w-full overflow-hidden border-y border-slate-100 py-4 mb-20 bg-slate-50">
        <div className="flex space-x-12 animate-marquee-fast whitespace-nowrap">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Sparkles className="w-4 h-4 text-[#A7DEB9]" />
              <span className="text-black font-black text-sm uppercase tracking-[0.2em]">
                Explore The Latest Trends
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Playful & Premium Shop By Department Bento Cards */}
        <div className="mb-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#FF7A59] bg-[#FFF3EE] px-3.5 py-1 rounded-full border border-[#FFE0D6]">
                Explore Collections
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
                Shop By Department
              </h2>
            </div>
            <p className="text-slate-500 font-bold text-xs sm:text-sm mt-2 sm:mt-0">
              Curated collections for everyday comfort & play
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Card 1: Kids Collection (Pastel Peach) */}
            <Link
              to="/kids"
              className="lg:col-span-12 relative group overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] bg-[#FFF3EE] border-2 border-[#FFE0D6] p-4 sm:p-8 shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col justify-between min-h-56 sm:min-h-85"
            >
              <div className="relative z-10 text-left max-w-sm">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white text-[#FF7A59] text-[9px] sm:text-[11px] font-black uppercase tracking-wider mb-2 sm:mb-4 shadow-xs border border-[#FFE0D6]">
                  🎈 Kids Collection • 0-14 Yrs
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-2 sm:mb-3">
                  Kids Playwear <br />& Tees 🌈
                </h3>
                <p className="text-[10px] sm:text-sm text-slate-600 font-bold leading-relaxed mb-4 sm:mb-6 max-w-[65%] sm:max-w-full">
                  Super soft 100% bio-washed cotton, non-scratchy seams, and play-proof durability.
                </p>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-[#FF7A59] text-white font-black text-[10px] sm:text-xs shadow-md group-hover:bg-slate-900 group-hover:scale-105 transition-all">
                  <span>Shop Kids Range</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>

              {/* Card Image */}
              <div className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 w-32 h-32 sm:w-60 sm:h-60 rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-white shadow-xl rotate-3 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop"
                  alt="Kids Collection"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800&auto=format&fit=crop"; }}
                />
              </div>
            </Link>

          </div>
        </div>

        {/* Product Grid Header */}
        <div ref={spotlightRef} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-black tracking-tight mb-4 sm:mb-0">
            The Latest Drops
          </h2>
          <div className="text-slate-500 font-bold text-sm">
            Showing {newProducts.length} Products
          </div>
        </div>

        {isLoading ? (
          <AnimatedLogoLoader text="Loading Newest Drops..." />
        ) : newProducts.length > 0 ? (
          <div className="mb-16">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {currentProducts.map((product) => (
                <NewArrivalProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16 pb-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${currentPage === 1
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm border border-slate-200'
                    }`}
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePageChange(num)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all shadow-sm ${currentPage === num
                      ? 'bg-[#1C2C28] text-[#E5F778] shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                      }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${currentPage === totalPages
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm border border-slate-200'
                    }`}
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center">
            <h3 className="text-xl font-bold text-slate-800">Check back soon for new arrivals!</h3>
          </div>
        )}

      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}
