import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Star, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCombinedProducts } from '../../queries/useCombinedProducts';

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
  const [showSizeChart, setShowSizeChart] = useState(false);

  const isKidsProduct = React.useMemo(() => {
    return ['Boys', 'Girls', 'Newborn', 'Unisex'].includes(activeProduct.category);
  }, [activeProduct.category]);

  const availableSizes = React.useMemo(() => {
    return activeProduct.sizes && activeProduct.sizes.length > 0 
      ? activeProduct.sizes 
      : ['S', 'M', 'L', 'XL'];
  }, [activeProduct.sizes, isKidsProduct]);

  const availableAges = React.useMemo(() => ['6-9 months', '9-12 months', '1-1.5 years', '1.5-2 years'], []);
  const [selectedAge, setSelectedAge] = useState(availableAges[0]);

  const discountPercent = React.useMemo(() => {
    if (!activeProduct.originalPrice || activeProduct.originalPrice <= activeProduct.price) return 0;
    return Math.round(((activeProduct.originalPrice - activeProduct.price) / activeProduct.originalPrice) * 100);
  }, [activeProduct.price, activeProduct.originalPrice]);

  return (
    <div className="flex flex-col group w-full bg-transparent transition-all duration-300 relative">
      {/* Image Block with Slide-up Size Selector Overlay */}
      <div className="relative aspect-[3/4] w-full bg-[#FFF8EC] rounded-xl overflow-hidden mb-3 border border-slate-100/50">
        <Link to={`/product/${activeProduct.id}`} className="absolute inset-0">
          <img
            src={activeProduct.image}
            alt={activeProduct.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {activeProduct.discount && (
            <span className="px-2.5 py-1 rounded-full bg-[#EF4A45] text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
              {activeProduct.discount}
            </span>
          )}
          {activeProduct.isNew && (
            <span className="px-2.5 py-1 rounded-full bg-[#AEE6FF] text-slate-900 text-[9px] font-black uppercase tracking-wider shadow-sm">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(activeProduct.id, selectedSize, selectedColor);
          }}
          className="absolute top-3.5 right-3.5 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-[#EF4A45] hover:scale-110 transition-all z-25 cursor-pointer"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-[#EF4A45] text-[#EF4A45]' : ''}`} />
        </button>

        {/* Size Chart Modal Overlay (inside the card) */}
        {showSizeChart && (
          <div className="absolute inset-0 bg-[#FFF8EC] z-30 p-4 flex flex-col justify-between transition-all duration-300">
            <div>
              <div className="flex justify-between items-center border-b pb-2 mb-3">
                <span className="font-bold text-xs text-slate-800">Size Chart</span>
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
                    <th className="py-1">{isKidsProduct ? 'Height (cm)' : 'Chest (inches)'}</th>
                    <th className="py-1">{isKidsProduct ? 'Weight (kg)' : 'Waist (inches)'}</th>
                  </tr>
                </thead>
                <tbody>
                  {isKidsProduct ? (
                    <>
                      <tr className="border-b">
                        <td className="py-1 font-semibold">22 (6-9m)</td>
                        <td className="py-1">68-74</td>
                        <td className="py-1">7.5-9</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 font-semibold">24 (9-12m)</td>
                        <td className="py-1">74-80</td>
                        <td className="py-1">9-11</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 font-semibold">26 (1-1.5y)</td>
                        <td className="py-1">80-86</td>
                        <td className="py-1">11-12.5</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 font-semibold">28 (1.5-2y)</td>
                        <td className="py-1">86-92</td>
                        <td className="py-1">12.5-14.5</td>
                      </tr>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const cartSize = `${selectedSize} (${selectedAge})`;
              addToCart(activeProduct, cartSize, selectedColor, e);
            }}
            className="w-full bg-[#EF4A45] hover:bg-red-600 text-white font-black text-[10px] py-1.5 tracking-wider uppercase transition-colors cursor-pointer"
          >
            ADD TO CART
          </button>
        </div>
      </div>

      {/* Content Block (Left-Aligned, clean styling) */}
      <div className="flex flex-col items-start text-left space-y-1 mt-1 px-0.5">
        {/* Category & Rating */}
        <div className="flex items-center justify-between w-full text-[10px] font-bold">
          <div className="flex items-center gap-1">
            <span className="text-purple-700 uppercase bg-[#E6D6FF]/40 px-2 py-0.5 rounded-full">
              {activeProduct.category}
            </span>
          </div>
          {activeProduct.rating && (
            <div className="flex items-center gap-0.5 text-amber-500 font-extrabold">
              ★ <span>{activeProduct.rating}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link to={`/product/${activeProduct.id}`} className="w-full">
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight line-clamp-1 hover:text-[#EF4A45] transition-colors mt-0.5">
            {activeProduct.name}
          </h3>
        </Link>

        {/* Color Swatches and Pricing Block */}
        <div className="flex items-center justify-between w-full pt-1">
          {/* Pricing Block */}
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-slate-900">
              ₹{activeProduct.price.toLocaleString('en-IN')}
            </span>
            {activeProduct.originalPrice && activeProduct.originalPrice > activeProduct.price && (
              <>
                <span className="text-xs text-slate-400 line-through">
                  ₹{activeProduct.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-emerald-600 font-semibold">
                  ({discountPercent}% off)
                </span>
              </>
            )}
          </div>

          {/* Color Swatches */}
          {globalColors.length > 0 && (
            <div className="flex items-center gap-1">
              {globalColors.slice(0, 4).map((col, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColor(col.hex);
                    if (String(col.productId) !== String(activeProduct.id)) {
                      const nextProduct = siblingProducts.find(p => String(p.id) === String(col.productId));
                      if (nextProduct) setActiveProduct(nextProduct);
                    }
                  }}
                  className={`w-3.5 h-3.5 rounded-full border border-white shadow-xs transition-transform ${selectedColor === col.hex ? 'scale-110 ring-1 ring-[#EF4A45]' : 'hover:scale-115'
                    }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
