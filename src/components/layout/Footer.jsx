import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/getImageUrl';

// Pixel-Perfect Vector Instagram Icon with CSS Gradient Container
const InstagramGradientIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-[#fdf497] via-[#fd5949] to-[#285AEB] flex items-center justify-center shadow-md shrink-0">
    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  </div>
);

const FacebookSquareIcon = () => (
  <svg className="w-8 h-8 rounded-lg shadow-xs shrink-0" viewBox="0 0 24 24" fill="#3B5998">
    <rect width="24" height="24" rx="4" fill="#3B5998" />
    <path d="M15.5 12.5h-2.5v7h-3v-7h-2v-2.5h2v-1.8c0-2.1 1.1-3.2 3.2-3.2h2.3v2.5h-1.4c-1 0-1.1.4-1.1 1.1v1.4h2.5l-.5 2.5z" fill="#ffffff" />
  </svg>
);

const LinkedInSquareIcon = () => (
  <svg className="w-8 h-8 rounded-lg shadow-xs shrink-0" viewBox="0 0 24 24" fill="#0077B5">
    <rect width="24" height="24" rx="4" fill="#0077B5" />
    <path d="M6.5 8.5h2.5v9h-2.5v-9zm1.25-3.8a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8zm10.75 12.8h-2.5v-4.5c0-1.2-.4-2-1.5-2-.8 0-1.3.6-1.5 1.1-.1.2-.1.5-.1.8v4.6h-2.5s.03-8 0-9h2.5v1.3c.3-.5 1-1.3 2.4-1.3 1.7 0 3 1.1 3 3.6v5.4z" fill="#ffffff" />
  </svg>
);

const YouTubeSquareIcon = () => (
  <svg className="w-8 h-8 rounded-lg shadow-xs shrink-0" viewBox="0 0 24 24" fill="#CD2019">
    <rect width="24" height="24" rx="4" fill="#CD2019" />
    <polygon points="10,8 16,12 10,16" fill="#ffffff" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#1B475D] text-[#EEE5C2] pt-12 pb-10 px-4 sm:px-6 lg:px-12 relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        

        {/* MAIN CONTENT CARD CONTAINER (Rich Warm Cream / Ivory Background) */}
        <div className="relative bg-linear-to-br from-[#FFF9EA] via-[#F6EAC9] to-[#EFE1BA] text-[#1B475D] rounded-4xl p-8 sm:p-12 shadow-2xl overflow-hidden border-2 border-white/80">
          
          {/* Scalloped Edges */}
          <div className="hidden lg:block absolute -left-4 top-0 bottom-0 w-5 overflow-hidden pointer-events-none select-none">
            <svg className="h-full w-full text-[#F6EAC9] fill-current" viewBox="0 0 20 200" preserveAspectRatio="none">
              <path d="M20,0 C10,0 0,10 0,20 C0,30 10,40 20,40 C10,40 0,50 0,60 C0,70 10,80 20,80 C10,80 0,90 0,100 C0,110 10,120 20,120 C10,120 0,130 0,140 C0,150 10,160 20,160 C10,160 0,170 0,180 C0,190 10,200 20,200 L20,0 Z" />
            </svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center relative z-10">
            
            {/* FAR LEFT: Main Logo */}
            <div className="lg:col-span-3 flex flex-col items-center sm:items-start justify-center">
              <Link to="/" className="inline-block hover:scale-105 transition-transform">
                <img 
                  src={getImageUrl('official_logo.webp')} 
                  alt="JOG & JOY® - Love is in the wear" 
                  className="h-16 sm:h-24 w-auto object-contain filter drop-shadow-md" 
                />
              </Link>
            </div>

            {/* NAV COLUMNS (3 Categories: SHOP, EXPLORE, BUSINESS - Clean 1-col on mobile, 3-col on sm+) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 text-center sm:text-left">
              
              {/* SHOP Column */}
              <div className="space-y-2.5 sm:space-y-3.5">
                <h4 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#D32F2F]">SHOP</h4>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base font-extrabold text-slate-900">
                  <li>
                    <Link to="/new-arrivals" className="hover:text-[#D32F2F] transition-colors sm:whitespace-nowrap">
                      New Arrivals
                    </Link>
                  </li>
                  <li>
                    <Link to="/kids" className="hover:text-[#D32F2F] transition-colors sm:whitespace-nowrap">
                      Kids Wear
                    </Link>
                  </li>
                  <li>
                    <Link to="/products" className="hover:text-[#D32F2F] transition-colors sm:whitespace-nowrap">
                      Best Sellers
                    </Link>
                  </li>
                </ul>
              </div>

              {/* EXPLORE Column */}
              <div className="space-y-2.5 sm:space-y-3.5">
                <h4 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#D32F2F]">EXPLORE</h4>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base font-extrabold text-slate-900">
                  <li>
                    <Link to="/about-us" className="hover:text-[#D32F2F] transition-colors sm:whitespace-nowrap">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/why-us" className="hover:text-[#D32F2F] transition-colors sm:whitespace-nowrap">
                      Why Choose Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/track-order" className="hover:text-[#D32F2F] transition-colors sm:whitespace-nowrap">
                      Track Order
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact-us" className="hover:text-[#D32F2F] transition-colors sm:whitespace-nowrap">
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>

              {/* BUSINESS Column */}
              <div className="space-y-2.5 sm:space-y-3.5">
                <h4 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#D32F2F]">BUSINESS</h4>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base font-extrabold text-slate-900">
                  <li>
                    <Link to="/distributor-network" className="hover:text-[#D32F2F] transition-colors sm:whitespace-nowrap">
                      Distributors
                    </Link>
                  </li>
                </ul>
              </div>

            </div>

            {/* RIGHT COLUMN: Paragraph + Social Icons + Other Verticals */}
            <div className="lg:col-span-4 border-t-2 lg:border-t-0 lg:border-l-2 border-slate-900/30 pt-6 lg:pt-0 pl-0 lg:pl-8 space-y-6 flex flex-col items-center sm:items-start text-center sm:text-left">
              
              {/* Paragraph & Right Social Column */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 w-full">
                <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed max-w-xs text-center sm:text-left">
                  Jog & Joy is adding a breath of fresh air to kids athleisure wear with a passion for quality, comfort, and style. Our trendy outfits are designed to empower the joy of movement.
                </p>

                {/* Vertical Social Icons Column */}
                <div className="flex sm:flex-col items-center gap-3 shrink-0 pt-0.5">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram" className="hover:scale-110 transition-transform">
                    <InstagramGradientIcon />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook" className="hover:scale-110 transition-transform">
                    <FacebookSquareIcon />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="hover:scale-110 transition-transform">
                    <LinkedInSquareIcon />
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" title="YouTube" className="hover:scale-110 transition-transform">
                    <YouTubeSquareIcon />
                  </a>
                </div>
              </div>

              {/* Other Verticals Section */}
              <div className="space-y-2.5 text-center sm:text-right pt-1 w-full flex flex-col items-center sm:items-end">
                <span className="block text-xs sm:text-sm font-black text-[#D32F2F] tracking-wide">
                  Click to explore other verticals
                </span>
                
                <div className="flex items-center justify-center sm:justify-end gap-5 bg-white/80 p-3 rounded-2xl border border-white shadow-xs ">
                  <a 
                    href="https://kamalclothing.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block hover:scale-105 transition-transform" 
                    title="Kamal Kids Wear"
                  >
                    <img src={getImageUrl('kamal logo black.webp')} alt="Kamal Kids Wear" className="h-9 sm:h-11 w-auto object-contain" />
                  </a>
                  <div className="w-[1.5px] h-8 sm:h-9 bg-slate-400/80" />
                  <a 
                    href="https://dharmanath.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block hover:scale-105 transition-transform" 
                    title="Dharmanath Products"
                  >
                    <img src={getImageUrl('Dharamnath logo.webp')} alt="DHARMANATH PRODUCTS PVT. LTD." className="h-9 sm:h-11 w-auto object-contain" />
                  </a>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* BOTTOM LEGAL & COPYRIGHT BAR */}
        <div className="pt-6 pb-2 text-center space-y-4 relative z-10 text-sm sm:text-base font-extrabold text-[#EEE5C2]">
          
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[#EEE5C2] text-xs sm:text-sm font-extrabold">
            <Link to="/terms-conditions" className="hover:text-[#FAD564] transition-colors">Terms & Services</Link>
            <span className="text-[#EEE5C2]/40 hidden sm:inline">|</span>
            <Link to="/privacy-policy" className="hover:text-[#FAD564] transition-colors">Privacy Policy</Link>
            <span className="text-[#EEE5C2]/40 hidden sm:inline">|</span>
            <Link to="/refund-policy" className="hover:text-[#FAD564] transition-colors">Refund & Cancellation</Link>
            <span className="text-[#EEE5C2]/40 hidden sm:inline">|</span>
            <Link to="/shipping-policy" className="hover:text-[#FAD564] transition-colors">Shipping & Delivery</Link>
          </div>

          <div className="pt-3 border-t border-[#EEE5C2]/15 max-w-2xl mx-auto space-y-2">
            <p className="text-xs sm:text-sm text-[#EEE5C2]/85 font-semibold tracking-wide">
              © {new Date().getFullYear()} JOG&JOY®. All rights reserved. Love is in the wear.
            </p>

            <p className="text-xs text-[#EEE5C2]/70 font-medium tracking-wide">
              ~ Managed by{' '}
              <a 
                href="https://www.sbsquantum.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-extrabold text-[#FAD564] hover:text-white underline decoration-[#FAD564]/60 hover:decoration-white transition-all inline-block hover:scale-105"
              >
                SBS Quantum
              </a>
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
}
