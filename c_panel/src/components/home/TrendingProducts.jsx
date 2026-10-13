import React from 'react';
import ProductCard from '../ui/ProductCard';
import { useCombinedProducts } from '../../queries/useCombinedProducts';
import { TrendingUp, Sparkles } from 'lucide-react';

export default function TrendingProducts({ onQuickView }) {
  const { combinedProducts } = useCombinedProducts();
  const trending = combinedProducts.filter((p) => p.isTrending);

  return (
    <section className="py-16 bg-[#FFF8EC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="px-4 py-1.5 rounded-full bg-[#AEE6FF]/50 text-sky-900 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-sky-600" /> Hot Right Now
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-2">
              Trending <span className="text-[#EF4A45]">Products</span>
            </h2>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.map((product) => (
            <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
          ))}
        </div>

      </div>
    </section>
  );
}
