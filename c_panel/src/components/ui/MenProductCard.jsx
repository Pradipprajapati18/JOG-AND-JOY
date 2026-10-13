import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { createSlug } from '../../utils/helpers';
import { flyToCart } from '../../utils/animations';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function MenProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [animateHeart, setAnimateHeart] = useState(false);
  const isWished = isInWishlist(product.id);

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    // Use the existing add to cart function as a quick action for this theme
    flyToCart(e, product.image);
    addToCart(product, product.sizes?.[0] || 'M', product.colors?.[0]?.hex || '#000');
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    toggleWishlist(product.id);
    if (!isWished) {
      setAnimateHeart(true);
      setTimeout(() => setAnimateHeart(false), 300);
    }
  };

  return (
    <div className="flex flex-col group cursor-pointer w-full">
      {/* Image Block */}
      <div className="relative aspect-square w-full bg-[#F5F5F5] rounded-3xl overflow-hidden mb-4">
        <Link to={`/product/${createSlug(product.name || product.title) || product.id}`} className="absolute inset-0">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-8 mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600&auto=format&fit=crop";
            }}
          />
        </Link>

        {/* Hover Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label="Toggle Wishlist"
          className={`absolute top-4 left-4 w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center transition-opacity duration-300 z-10 hover:bg-slate-50 cursor-pointer ${isWished ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          <Heart className={`w-4 h-4 transition-all duration-300 ${isWished ? 'text-[#FF7A59] fill-[#FF7A59]' : 'text-slate-600 hover:text-[#FF7A59]'} ${animateHeart ? 'scale-[1.75]' : 'scale-100'}`} />
        </button>

        {/* Sale Badge */}
        {product.discount && (
          <div className="absolute top-4 right-4 bg-[#147B74] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider z-10">
            Sale
          </div>
        )}

        {/* Hover Quick View Button */}
        <button
          onClick={handleQuickViewClick}
          className="absolute bottom-4 left-4 right-4 bg-[#E5F778] hover:bg-[#D4E85C] text-[#1f2923] font-bold text-xs py-3 rounded-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10 shadow-sm"
        >
          Quick add to cart
        </button>
      </div>

      {/* Thumbnails (Simulated color variants) */}
      <div className="flex items-center gap-2 mb-3 px-1">
        {[product.image, ...(product.gallery || [])].slice(0, 3).map((img, idx) => (
          <div key={idx} className="w-10 h-10 rounded-lg bg-[#F5F5F5] border border-transparent hover:border-[#1f2923] cursor-pointer overflow-hidden transition-colors p-1">
            <img src={img} alt="variant" className="w-full h-full object-contain mix-blend-multiply" />
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="px-1 space-y-1">
        <Link to={`/product/${createSlug(product.name || product.title) || product.id}`}>
          <h3 className="text-sm font-bold text-[#1f2923] leading-snug line-clamp-2 hover:underline">
            {product.name}
          </h3>
        </Link>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          JOG & JOY
        </p>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-sm font-black text-[#1f2923]">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-xs font-bold text-slate-400 line-through">₹{product.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}
