import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCombinedProducts } from '../../queries/useCombinedProducts';
import { createSlug } from '../../utils/helpers';

export default function ProductCard({ product, onQuickView }) {
  const { combinedProducts } = useCombinedProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [activeProduct, setActiveProduct] = useState(product);

  React.useEffect(() => {
    setActiveProduct(product);
  }, [product]);

  const [selectedSize, setSelectedSize] = useState(activeProduct.wishlistSize || activeProduct.sizes?.[0] || '4Y-5Y');
  const [selectedColor, setSelectedColor] = useState(activeProduct.wishlistColor || activeProduct.colors?.[0]?.hex || '#AEE6FF');

  const siblingProducts = combinedProducts?.filter(p => 
    (activeProduct.groupId && p.groupId === activeProduct.groupId) ||
    (activeProduct.groupId && String(p.id) === String(activeProduct.groupId)) ||
    (p.groupId && String(p.groupId) === String(activeProduct.id)) ||
    String(p.id) === String(activeProduct.id)
  ) || [activeProduct];

  const globalColors = [];
  siblingProducts.forEach(sibling => {
    sibling.colors?.forEach(color => {
      if (!globalColors.some(c => c.hex === color.hex)) {
        globalColors.push({ ...color, productId: sibling.id });
      }
    });
  });

  const isFavorited = isInWishlist(activeProduct.id, selectedSize, selectedColor);

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#ECECEC] bg-white shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">

      {/* Product Image Container */}
      <div className="relative aspect-square sm:aspect-auto sm:h-72 w-full overflow-hidden bg-[#FFF8EC]">
        <Link to={`/product/${createSlug(activeProduct.name || activeProduct.title) || activeProduct.id}`}>
          <img
            src={activeProduct.image}
            alt={activeProduct.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=600&auto=format&fit=crop";
            }}
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5 z-10">
          {activeProduct.discount && (
            <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#FF7A59] text-white text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm">
              {activeProduct.discount}
            </span>
          )}
          {activeProduct.isNew && (
            <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#AEE6FF] text-slate-900 text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Heart Toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(activeProduct.id, selectedSize, selectedColor);
          }}
          aria-label="Add to Wishlist"
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2.5 rounded-full backdrop-blur-md transition-all duration-200 shadow-md z-10 cursor-pointer ${
            isFavorited ? 'bg-[#FF7A59] text-white scale-110' : 'bg-white/85 text-slate-700 hover:bg-white hover:scale-105'
          }`}
          title="Add to Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorited ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View Button Hover Overlay */}
        <div className="absolute inset-x-0 bottom-2 sm:bottom-3 px-2 sm:px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-10">
          <button
            onClick={() => onQuickView && onQuickView(activeProduct)}
            aria-label="Quick View"
            className="w-full py-1.5 sm:py-2.5 bg-white/90 backdrop-blur-md hover:bg-white text-slate-900 font-extrabold text-[10px] sm:text-xs rounded-full shadow-md flex items-center justify-center gap-1 sm:gap-1.5 transition-all hover:scale-102 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF7A59]" /> Quick View
          </button>
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-3 sm:p-5 grow flex flex-col justify-between space-y-2 sm:space-y-3">

        <div>
          {/* Category & Rating */}
          <div className="hidden sm:flex items-center justify-between text-[10px] sm:text-xs mb-1">
            <div className="flex items-center gap-1 sm:gap-1.5 select-none">
              <span className="font-extrabold text-[#FF7A59] uppercase tracking-wider text-[8px] sm:text-[10px] bg-[#FFF3EE] px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full border border-[#FFE0D6]">
                {activeProduct.category}
              </span>
            </div>

            <div className="flex items-center gap-1 text-amber-500 font-black">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
              <span className="text-[10px] sm:text-xs">{activeProduct.rating}</span>
            </div>
          </div>

          {/* Product Name */}
          <Link to={`/product/${createSlug(activeProduct.name || activeProduct.title) || activeProduct.id}`}>
            <h3 className="font-extrabold text-slate-900 text-[11px] sm:text-base line-clamp-2 sm:line-clamp-1 group-hover:text-[#FF7A59] transition-colors mt-1">
              {activeProduct.name}
            </h3>
          </Link>

          {/* Price & Savings */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1 sm:mt-2">
            <span className="text-sm sm:text-lg font-black text-slate-900">₹{activeProduct.price}</span>
            {activeProduct.originalPrice && (
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 line-through">₹{activeProduct.originalPrice}</span>
            )}
          </div>
        </div>

        {/* Available Colors & Sizes Preview */}
        <div className="hidden sm:flex pt-2 border-t border-slate-100 items-center justify-between">

          {/* Color Swatches */}
          <div className="flex flex-wrap items-center gap-1.5">
            {globalColors.map((col, idx) => (
              <button
                key={idx}
                aria-label={`Select color ${col.name}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(col.hex);
                  if (String(col.productId) !== String(activeProduct.id)) {
                    const nextProduct = siblingProducts.find(p => String(p.id) === String(col.productId));
                    if (nextProduct) setActiveProduct(nextProduct);
                  }
                }}
                className={`w-4 h-4 rounded-full border border-black shadow-xs transition-transform cursor-pointer ${
                  selectedColor === col.hex ? 'scale-125 ring-2 ring-[#FF7A59]' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            ))}
          </div>

        </div>

        {/* Add to Bag Button */}
        <Link
          to={`/product/${createSlug(activeProduct.name || activeProduct.title) || activeProduct.id}`}
          aria-label="Add To Cart"
          className="hidden sm:flex w-full py-1.5 sm:py-2.5 rounded-full bg-slate-900 hover:bg-[#FF7A59] text-white font-extrabold text-[10px] sm:text-xs shadow-md hover:shadow-lg transition-all duration-200 items-center justify-center gap-1.5 sm:gap-2 mt-2 active:scale-95 cursor-pointer"
        >
          <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Add to Cart</span>
        </Link>

      </div>

    </div>
  );
}
