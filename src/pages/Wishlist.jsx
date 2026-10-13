import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCombinedProducts } from '../queries/useCombinedProducts';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ui/ProductCard';
import QuickViewModal from '../components/ui/QuickViewModal';
import { Heart, Sparkles, ArrowRight, Trash2 } from 'lucide-react';

export default function Wishlist() {
  const { wishlist, clearWishlist } = useWishlist();
  const { combinedProducts } = useCombinedProducts();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const favoritedProducts = wishlist.map(id => {
    const p = combinedProducts.find(cp => String(cp.id) === String(id));
    if (!p) return null;
    return p;
  }).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FFF8EC] py-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="px-4 py-1.5 rounded-full bg-[#FFD6BA]/50 text-orange-900 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-[#EF4A45] fill-[#EF4A45]" /> Saved Outfits
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            My <span className="text-[#EF4A45]">Wishlist</span> ({favoritedProducts.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Keep track of your favorite kids apparel and move them to bag whenever you're ready!
          </p>
        </div>

        {/* Wishlist Actions & Grid */}
        {favoritedProducts.length > 0 ? (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button 
                onClick={clearWishlist}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {favoritedProducts.map((product, idx) => (
                <ProductCard key={`${product.id}-${idx}`} product={product} onQuickView={setQuickViewProduct} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl p-8 shadow-md border border-slate-100 space-y-4 max-w-md mx-auto">
            <span className="text-5xl">💖</span>
            <h3 className="text-xl font-black text-slate-800">Your Wishlist is empty</h3>
            <p className="text-xs text-slate-500 font-semibold">Explore our kids fashion catalog and tap the heart icon on any item you love!</p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#EF4A45] text-white font-extrabold text-xs shadow-md hover:bg-red-600 transition-all"
            >
              <span>Discover Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}
