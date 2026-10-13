import React, { useState } from 'react';
import ProductCard from '../ui/ProductCard';
import { useCombinedProducts } from '../../queries/useCombinedProducts';
import { Sun, Snowflake, Sparkles, CloudRain } from 'lucide-react';

export default function SeasonalCollection({ onQuickView }) {
  const [activeTab, setActiveTab] = useState('Summer');
  const { combinedProducts } = useCombinedProducts();

  const tabs = [
    { name: 'Summer', filterTag: 'Summer', icon: Sun, color: '#AEE6FF' },
    { name: 'Winter', filterTag: 'Winter', icon: Snowflake, color: '#E6D6FF' },
    { name: 'Festival Wear', filterTag: 'Festive', icon: Sparkles, color: '#FFD6BA' },
    { name: 'Monsoon', filterTag: 'Monsoon', icon: CloudRain, color: '#CFFFE5' }
  ];

  const activeFilterTag = tabs.find(t => t.name === activeTab)?.filterTag;
  
  const filtered = combinedProducts.filter((p) => {
    let colls = p.collections || [];
    if (typeof colls === 'string') {
      try { colls = JSON.parse(colls); } catch (e) { colls = []; }
    }
    return Array.isArray(colls) && colls.includes(activeFilterTag);
  });

  return (
    <section className="py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="px-4 py-1.5 rounded-full bg-[#E6D6FF]/40 text-purple-800 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" /> All-Season Wardrobe
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Seasonal <span className="text-[#EF4A45]">Collections</span>
          </h2>
        </div>

        {/* Interactive Tabs */}
        <div className="flex items-center sm:justify-center justify-start gap-2.5 sm:gap-3 overflow-x-auto pb-4 px-2 mb-8 no-scrollbar w-full">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.name;

            return (
              <button
                key={t.name}
                onClick={() => setActiveTab(t.name)}
                className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-black text-xs sm:text-sm transition-all duration-300 whitespace-nowrap border shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xl scale-105 border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#EF4A45]' : 'text-slate-500'}`} />
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Product Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 border border-slate-100">
            <p className="text-sm font-bold text-slate-500">No products available in the {activeTab} collection right now.</p>
          </div>
        )}

      </div>
    </section>
  );
}
