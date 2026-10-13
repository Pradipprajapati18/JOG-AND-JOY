import React, { useState } from 'react';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { createSlug } from '../../utils/helpers';
import { flyToCart } from '../../utils/animations';

export default function KidsProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product.id);
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
            src={isHovered && product.gallery?.[1] ? product.gallery[1] : product.image}
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

        {/* Heart Icon */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Toggle Wishlist"
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-md z-10 cursor-pointer ${
            isWishlisted ? 'bg-[#FF7A59] text-white scale-110' : 'bg-white/85 text-slate-700 hover:bg-white hover:scale-105'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>
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
