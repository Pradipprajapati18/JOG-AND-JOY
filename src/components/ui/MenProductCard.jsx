import React, { useState, useMemo } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { flyToCart } from '../../utils/animations';

export default function MenProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Wishlist state
  const isWishlisted = isInWishlist(product.id);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  // Size list setup
  const defaultSizes = useMemo(() => ['S', 'M', 'L', 'XL'], []);
  const availableSizes = useMemo(() => {
    return product.sizes && product.sizes.length > 0 ? product.sizes : defaultSizes;
  }, [product.sizes, defaultSizes]);

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
    
    // Add to cart with size + age
    const cartSize = `${selectedSize} (${selectedAge})`;
    addToCart(product, cartSize, product.colors?.[0]?.hex || '#000');
  };

  return (
    <div className="flex flex-col group w-full bg-transparent transition-all duration-300 relative">
      {/* Image Block with Slide-up Size Selector Overlay */}
      <div className="relative aspect-[3/4] w-full bg-[#FFF8EC] rounded-xl overflow-hidden mb-3 border border-slate-100/50">
        <Link to={`/product/${product.id}`} className="absolute inset-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Wishlist Heart Icon */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3.5 right-3.5 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-[#EF4A45] hover:scale-110 transition-all z-25 cursor-pointer"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#EF4A45] text-[#EF4A45]' : ''}`} />
        </button>

        {/* Size Chart Modal Overlay (inside the card) */}
        {showSizeChart && (
          <div className="absolute inset-0 bg-[#FFF8EC] z-30 p-4 flex flex-col justify-between transition-all duration-300">
            <div>
              <div className="flex justify-between items-center border-b pb-2 mb-3">
                <span className="font-bold text-xs text-slate-800">Men's Size Chart</span>
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
                    <th className="py-1">Chest (inches)</th>
                    <th className="py-1">Waist (inches)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-1 font-semibold">S</td>
                    <td className="py-1">36 - 38</td>
                    <td className="py-1">30 - 32</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 font-semibold">M</td>
                    <td className="py-1">38 - 40</td>
                    <td className="py-1">32 - 34</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 font-semibold">L</td>
                    <td className="py-1">40 - 42</td>
                    <td className="py-1">34 - 36</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 font-semibold">XL</td>
                    <td className="py-1">42 - 44</td>
                    <td className="py-1">36 - 38</td>
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
            {/* Select Size */}
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

            {/* Select Age */}
            <div className="flex flex-col space-y-0.5">
              <div className="text-[9px] font-bold text-slate-700">Select age</div>
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
            className="w-full bg-[#EF4A45] hover:bg-red-600 text-white font-black text-[10px] py-2 tracking-wider uppercase transition-colors cursor-pointer"
          >
            ADD TO CART
          </button>
        </div>
      </div>

      {/* Content Block (Left-Aligned, clean styling) */}
      <div className="flex flex-col items-start text-left space-y-1 mt-1 px-0.5">
        {/* Title */}
        <Link to={`/product/${product.id}`} className="w-full">
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight line-clamp-1 hover:text-[#EF4A45]">
            {product.name}
          </h3>
        </Link>

        {/* Pricing Block */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-sm font-black text-slate-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-xs text-slate-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-emerald-600 font-semibold">
                ({discountPercent}% off)
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
