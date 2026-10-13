import React from 'react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { flyToCart } from '../../utils/animations';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Eye, ShoppingBag } from 'lucide-react';
import { createSlug } from '../../utils/helpers';

export default function NewArrivalProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id, product.sizes?.[0] || 'M', product.colors?.[0]?.hex || '#FF7A59');

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    flyToCart(e, product.image);
    addToCart(product, product.sizes?.[0] || 'M', product.colors?.[0]?.hex || '#FF7A59');
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#ECECEC] bg-white p-3 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 font-sans">
      
      {/* Image Block */}
      <div className="relative aspect-square sm:aspect-4/5 w-full bg-[#FFF8EC] rounded-2xl overflow-hidden mb-3 border border-[#FFE0D6]">
        <Link to={`/product/${createSlug(product.name || product.title) || product.id}`} className="absolute inset-0">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=600&auto=format&fit=crop";
            }}
          />
        </Link>
        
        {/* Pastel Blue 'NEW' Badge */}
        <div className="absolute top-3 left-3 bg-[#AEE6FF] text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider z-10 flex items-center gap-1 shadow-xs border border-[#93D5FF] select-none">
          <Sparkles className="w-3 h-3 text-slate-800" /> NEW
        </div>

        {/* Wishlist Heart Toggle Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id, product.sizes?.[0] || 'M', product.colors?.[0]?.hex || '#FF7A59');
          }}
          aria-label="Add to Wishlist"
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 shadow-md z-10 cursor-pointer ${
            isFavorited ? 'bg-[#FF7A59] text-white scale-110' : 'bg-white/85 text-slate-700 hover:bg-white hover:scale-105'
          }`}
          title="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white text-white' : ''}`} />
        </button>

        {/* Quick View Button (Hover Overlay) */}
        <div className="absolute inset-x-0 bottom-3 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView && onQuickView(product);
            }}
            aria-label="Quick View"
            className="w-full py-2.5 bg-white/90 backdrop-blur-md hover:bg-white text-slate-900 font-extrabold text-xs rounded-full shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#FF7A59]" /> Quick View
          </button>
        </div>
      </div>

      {/* Details Body */}
      <div className="px-1 text-left flex flex-col justify-between grow space-y-2">
        <div>
          <span className="text-[10px] font-extrabold text-[#FF7A59] bg-[#FFF3EE] px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#FFE0D6] select-none">
            {product.category}
          </span>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-1 group-hover:text-[#FF7A59] transition-colors mt-1.5">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-base font-black text-slate-900">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs font-bold text-slate-400 line-through">₹{product.originalPrice}</span>
            )}
          </div>
        </div>

        {/* Add to Cart Button on Every Card */}
        <Link
          to={`/product/${createSlug(product.name || product.title) || product.id}`}
          aria-label="Add to Cart"
          className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-[#FF7A59] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mt-2 active:scale-95 cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add to Cart</span>
        </Link>
      </div>

    </div>
  );
}
