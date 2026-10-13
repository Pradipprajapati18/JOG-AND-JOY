import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Truck } from 'lucide-react';
import SizeSelector from './SizeSelector';
import ColorSwatches from './ColorSwatches';
import Button from './Button';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCombinedProducts } from '../../queries/useCombinedProducts';
import { createSlug } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState('4Y-5Y');
  const [selectedColor, setSelectedColor] = useState('#A7D8FF');

  const { combinedProducts } = useCombinedProducts();

  const siblingProducts = combinedProducts?.filter(p => 
    (product?.groupId && p.groupId === product.groupId) ||
    (product?.groupId && String(p.id) === String(product.groupId)) ||
    (p.groupId && String(p.groupId) === String(product?.id)) ||
    String(p.id) === String(product?.id)
  ) || [product];

  const globalColors = React.useMemo(() => {
    if (!product) return [];
    const colors = [];
    siblingProducts.forEach(sibling => {
      sibling?.colors?.forEach(color => {
        if (!colors.some(c => c.hex === color.hex)) {
          colors.push({ ...color, productId: sibling.id });
        }
      });
    });
    // Fallback if no colors found
    if (colors.length === 0 && product.colors) {
      return product.colors;
    }
    return colors;
  }, [siblingProducts, product]);

  // Ensure we have gallery images
  const galleryImages = React.useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) return product.images;
    return [product.image].filter(Boolean);
  }, [product]);

  const [activeImage, setActiveImage] = useState(galleryImages[0]);

  // Update active image if product changes
  React.useEffect(() => {
    if (galleryImages.length > 0) {
      setActiveImage(galleryImages[0]);
    }
  }, [galleryImages]);

  if (!product) return null;

  const isFavorited = isInWishlist(product.id, selectedSize, selectedColor);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.98 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100/80 backdrop-blur-md hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row w-full h-full p-4 sm:p-6 md:p-8 gap-5 md:gap-8 mt-6 sm:mt-0">
            {/* Left Column: Image Section & Button */}
            <div className="w-full md:w-1/2 flex flex-col gap-3 sm:gap-4 shrink-0">
              {/* Image Row */}
              <div className="flex gap-3 sm:gap-4 flex-1 min-h-0">
              {/* Thumbnails */}
              <div className="flex flex-col gap-2 sm:gap-3 w-14 sm:w-16 shrink-0 overflow-y-auto no-scrollbar pb-2 hidden sm:flex">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-[#F5F5F5] ${
                      activeImage === img ? 'border-slate-300 ring-2 ring-slate-100' : 'border-transparent hover:border-slate-200'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              
              {/* Main Image and Button Column */}
              <div className="flex-1 flex flex-col gap-2">
                {/* Main Image */}
                <div className="flex-1 bg-[#F5F5F5] rounded-[2rem] overflow-hidden relative min-h-[300px] h-[40vh] md:h-auto border border-slate-100">
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = product.fallback || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop';
                    }}
                  />
                  <button
                    onClick={() => toggleWishlist(product.id, selectedSize, selectedColor)}
                    className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm z-10 ${
                      isFavorited ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white' : ''}`} />
                  </button>
                </div>
                
                {/* View Product Details Button */}
                <Button 
                  variant="outline" 
                  size="md" 
                  onClick={() => {
                    onClose();
                    navigate(`/product/${createSlug(product.name || product.title) || product.id}`);
                  }} 
                  className="w-full"
                >
                  View Product Details
                </Button>
              </div>
            </div>
          </div>

            {/* Product Meta */}
            <div className="w-full md:w-1/2 space-y-4 sm:space-y-5 flex flex-col justify-start">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#D8C7FF]/40 text-purple-800 text-[11px] font-extrabold uppercase tracking-wider">
                  {product.category}
                </span>

                <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-2">
                  {product.name}
                </h2>

                <div className="flex items-center gap-3 mt-1 text-sm">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-extrabold text-slate-700">{product.rating} (48 reviews)</span>
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">₹{product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-sm font-bold text-slate-400 line-through">MRP ₹{product.originalPrice}</span>
                      {product.discount && (
                        <span className="text-sm font-extrabold text-[#EF4A45]">({product.discount})</span>
                      )}
                    </>
                  )}
                </div>
                <span className="text-[11px] font-medium text-slate-500">MRP inclusive of all taxes</span>
              </div>

              {/* Interactive Selectors */}
              <SizeSelector selectedSize={selectedSize} onSelectSize={setSelectedSize} />
              <ColorSwatches selectedColor={selectedColor} onSelectColor={setSelectedColor} colors={globalColors.length > 0 ? globalColors : undefined} />

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button variant="sky" size="lg" icon={ShoppingBag} onClick={handleAddToCart} className="w-full">
                  Add To Bag
                </Button>
              </div>

              {/* Guarantees */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Non-Toxic Cotton
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-sky-600" /> Fast Wholesale Delivery
                </span>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
