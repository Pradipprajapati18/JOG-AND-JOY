import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { flyToCart } from '../../utils/animations';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { createSlug } from '../../utils/helpers';

export default function WomenProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [animateHeart, setAnimateHeart] = useState(false);
  const isWished = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
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
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-50 mb-4">
        <Link to={`/product/${createSlug(product.name || product.title) || product.id}`} className="absolute inset-0">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          />
        </Link>
        
        {/* Hover Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-4 left-4 w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center transition-opacity duration-300 z-10 hover:bg-slate-50 ${isWished ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          <Heart className={`w-4 h-4 transition-all duration-300 ${isWished ? 'text-red-500 fill-red-500' : 'text-slate-600 hover:text-red-500'} ${animateHeart ? 'scale-[1.75]' : 'scale-100'}`} />
        </button>
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-sm p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex justify-center">
          <button 
            onClick={handleAddToCart}
            className="text-white text-xs font-bold tracking-widest uppercase hover:text-gray-300 transition-colors"
          >
            Add to Tote
          </button>
        </div>
      </div>

      {/* Details (Ultra Minimalist) */}
      <div className="mt-4 space-y-1 flex flex-col items-center text-center">
        <Link to={`/product/${createSlug(product.name || product.title) || product.id}`}>
          <h3 className="text-sm font-semibold text-black tracking-wide line-clamp-1 uppercase hover:underline">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm font-light text-black">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-xs font-light text-gray-400 line-through">₹{product.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}
