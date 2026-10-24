import React, { useState, useMemo } from 'react';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { createSlug, normalizeColor } from '../../utils/helpers';
import { flyToCart } from '../../utils/animations';

export default function KidsProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Hover state
  const [isHovered, setIsHovered] = useState(false);

  // Wishlist state
  const isWishlisted = isInWishlist(product.id);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  // Size list setup (matching numeric kids apparel sizes)
  const availableSizes = useMemo(() => ['S', 'M', 'L', 'XL'], []);
  const availableAges = useMemo(() => ['6-9 months', '9-12 months', '1-1.5 years', '1.5-2 years'], []);

  const [selectedSize, setSelectedSize] = useState(availableSizes[0]);
  const [selectedAge, setSelectedAge] = useState(availableAges[0]);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Discount calculation
  const discountPercent = useMemo(() => {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }, [product.price, product.originalPrice]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Animate item flying to cart
    flyToCart(e, product.image);
    
    // Unified size description including selected age range
    const cartSize = `Size: ${selectedSize} (${selectedAge})`;
    
    // Normalized color
    const colorObj = normalizeColor(product.colors?.[0] || product.variants?.[0]?.colorHex);
    
    // Add to cart store context
    addToCart(product, cartSize, colorObj.hex, e, 1, false, product.stock, colorObj.name);
  };

  return (
    <div className="flex flex-col group w-full bg-white transition-all duration-300 rounded-3xl hover:shadow-xl border border-[#ECECEC] p-3 sm:p-4 pb-6 hover:-translate-y-1">
      {/* Image Block */}
      <div
        className="relative aspect-square w-full bg-[#FFF8EC] rounded-2xl overflow-hidden mb-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${createSlug(product.name || product.title) || product.id}`} className="absolute inset-0">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover p-3 transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=600&auto=format&fit=crop";
            }}
          />
        </Link>

        {/* Wishlist Heart Icon */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Toggle Wishlist"
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-md z-10 cursor-pointer ${
            isWishlisted ? 'bg-[#FF7A59] text-white scale-110' : 'bg-white/85 text-slate-700 hover:bg-white hover:scale-105'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Size Chart Modal Overlay (inside the card) */}
        {showSizeChart && (
          <div className="absolute inset-0 bg-[#FFF8EC] z-30 p-4 flex flex-col justify-between transition-all duration-300">
            <div>
              <div className="flex justify-between items-center border-b pb-2 mb-3">
                <span className="font-bold text-xs text-slate-800">Size Chart (months/years)</span>
                <button 
                  onClick={() => setShowSizeChart(false)}
                  className="text-slate-400 hover:text-slate-800 font-bold text-xs p-1"
                >
                  ✕
                </button>
              </div>
              <table className="w-full text-[10px] text-left border-collapse">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="py-1">Size</th>
                    <th className="py-1">Height (cm)</th>
                    <th className="py-1">Weight (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-1 font-semibold">S (6-9m)</td>
                    <td className="py-1">68-74</td>
                    <td className="py-1">7.5-9</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 font-semibold">M (9-12m)</td>
                    <td className="py-1">74-80</td>
                    <td className="py-1">9-11</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 font-semibold">L (1-1.5y)</td>
                    <td className="py-1">80-86</td>
                    <td className="py-1">11-12.5</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 font-semibold">XL (1.5-2y)</td>
                    <td className="py-1">86-92</td>
                    <td className="py-1">12.5-14.5</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button 
              onClick={() => setShowSizeChart(false)}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-[10px] uppercase cursor-pointer"
            >
              Close Chart
            </button>
          </div>
        )}

        {/* --- HOVER REVEAL SIZE SELECTOR & ADD TO CART PANEL --- */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#FFF8EC] transition-transform duration-300 translate-y-full group-hover:translate-y-0 z-20 flex flex-col border-t border-slate-100">
          
          {/* Estimated Shipping Banner */}
          <div className="bg-[#2D2D2D] text-white text-[9px] font-bold py-1 text-center tracking-wide uppercase">
            Get it in 2-3 days
          </div>

          {/* Dual Size & Age Selector */}
          <div className="p-2 bg-[#FFF8EC] flex flex-col space-y-1.5">
            {/* Select Size Row */}
            <div className="flex flex-col space-y-0.5">
              <div className="flex items-center justify-between text-[9px] font-bold">
                <span className="text-slate-700">Select size</span>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSizeChart(true);
                  }}
                  className="text-[#EF4A45] hover:text-red-600 hover:underline cursor-pointer text-[8px]"
                >
                  SIZE CHART
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(sz);
                    }}
                    className={`px-2 py-0.5 text-[8px] font-bold rounded-md transition-all cursor-pointer border ${
                      selectedSize === sz
                        ? 'border-[#EF4A45] text-[#EF4A45] bg-red-50/50 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Age Row */}
            <div className="flex flex-col space-y-0.5">
              <div className="text-[9px] font-bold text-slate-700 text-left">
                Select age
              </div>
              <div className="flex flex-wrap gap-1">
                {availableAges.map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedAge(age);
                    }}
                    className={`px-2 py-0.5 text-[8px] font-bold rounded-md transition-all cursor-pointer border ${
                      selectedAge === age
                        ? 'border-[#EF4A45] text-[#EF4A45] bg-red-50/50 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ADD TO CART Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full bg-[#EF4A45] hover:bg-red-600 text-white font-black text-[10px] py-1.5 tracking-wider uppercase transition-colors cursor-pointer"
          >
            ADD TO CART
          </button>
        </div>
      </div>

      {/* Content Block */}
      <div className="flex flex-col items-center text-center space-y-2 grow justify-between">
        <div className="space-y-1.5 w-full">
          {/* Title */}
          <Link to={`/product/${createSlug(product.name || product.title) || product.id}`}>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight line-clamp-1 group-hover:text-[#FF7A59] transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 5) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
              />
            ))}
          </div>

          {/* Price */}
          <div className="text-base font-black text-slate-900 pt-0.5">
            ₹{product.price?.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Link
          to={`/product/${createSlug(product.name || product.title) || product.id}`}
          className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 rounded-full bg-slate-900 hover:bg-[#FF7A59] text-white font-extrabold text-xs shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Add to Cart
        </Link>
      </div>
    </div>
  );
}
